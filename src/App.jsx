import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { createClient } from "@supabase/supabase-js";
import Header from "./Header";
import Quests from "./Quests";
import Charts from "./Charts";
import Journal from "./Journal";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, AnimatePresence } from "framer-motion";
import LoadingComponent from "./components/LoadingComponent";
import { ErrorBoundary } from "react-error-boundary";
import { usePlayerState } from "./hooks/usePlayerState";
import PenaltyModal from "./components/modals/PenaltyModal";
import LevelUpModal from "./components/modals/LevelUpModal";
import TabNavigation from "./tabs/TabNavigation";
import NotificationPanel from "./tabs/NotificationPanel";
import AchievementsPanel from "./tabs/AchievementsPanel";
import { applyItemEffect } from "./logic/InventoryLogic";
import { canStartQuest } from "./logic/QuestLogic";
import ParticlesBackground from "./components/particlesBackground";

const Particles = lazy(() => import("@tsparticles/react"));

const supabaseUrl = "https://dycmmpjydiilovfvqxog.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Y21tcGp5ZGlpbG92ZnZxeG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzcyMzAsImV4cCI6MjA2NjM1MzIzMH0.SYXqbiZbWCI-CihtGO3jIWO0riYOC_tEiFV2EYw_lmE";
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const {
    level,
    setLevel,
    xp,
    setXp,
    maxXP,
    setMaxXP,
    coins,
    setCoins,
    hp,
    setHp,
    maxHp,
    setMaxHp,
    mana,
    setMana,
    maxMana,
    setMaxMana,
    badges,
    setBadges,
    penaltyCount,
    setPenaltyCount,
    penaltyCoins,
    setPenaltyCoins,
    isPenaltyActive,
    setIsPenaltyActive,
    currentPenalty,
    setCurrentPenalty,
  } = usePlayerState();

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [quests, setQuests] = useState([]);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [currentSubquestParentId, setCurrentSubquestParentId] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showSubquestModal, setShowSubquestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("quests");
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  const questsRef = useRef([]);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      setParticlesLoaded(true);
    }).catch((error) => {
      console.error("Failed to initialize tsparticles:", error);
    });
  }, []);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [
          { data: playerState },
          { data: questsData },
          { data: inventoryItems },
          { data: notificationsData },
          { data: achievementsData },
          { data: penaltiesData },
        ] = await Promise.all([
          supabase
            .from("game_state")
            .select("*")
            .eq("id", "playerState")
            .single(),
          supabase.from("quests").select("*"),
          supabase.from("inventory").select("*"),
          supabase.from("notifications").select("*"),
          supabase.from("achievements").select("*"),
          supabase.from("penalties").select("*"),
        ]);

        if (playerState) {
          setLevel(playerState.level || 1);
          setXp(playerState.xp || 0);
          setMaxXP(playerState.max_xp || 980);
          setCoins(playerState.coins || 0);
          setHp(playerState.hp || 100);
          setMaxHp(playerState.max_hp || 100);
          setMana(playerState.mana || 100);
          setMaxMana(playerState.max_mana || 120);
          setBadges(playerState.badges || []);
          setPenaltyCount(playerState.penalty_count || 0);
          setPenaltyCoins(playerState.penalty_coins || 0);
        } else {
          await supabase.from("game_state").insert({
            id: "playerState",
            level: 1,
            xp: 0,
            max_xp: 980,
            coins: 0,
            hp: 100,
            max_hp: 100,
            mana: 100,
            max_mana: 120,
            badges: [],
            penalty_count: 0,
            penalty_coins: 0,
          });
        }

        setQuests(
          questsData.map((q) => ({
            id: q.id,
            name: q.name,
            description: q.description,
            difficulty: q.difficulty,
            type: q.type,
            status: q.status || "not_started",
            subquests: q.subquests || [],
            priority: q.priority,
            deadline: q.deadline || null,
            dependencies: q.dependencies || [],
            repeatable: !!q.repeatable,
            required_level: q.required_level || 1,
            coins: q.coins || 0,
            xp: q.xp || 0,
            warning_sent_for_current_period:
              q.warning_sent_for_current_period || false,
            is_24_hour: !!q.is_24_hour,
            completion_timestamp: q.completion_timestamp,
          }))
        );

        const invData = {};
        inventoryItems.forEach((item) => {
          invData[item.id] = { ...item };
        });
        setInventory(invData);

        setNotifications(notificationsData);
        setAchievements(achievementsData);
        setUnreadNotifications(notificationsData.filter((n) => !n.read).length);
        setIsPenaltyActive(penaltiesData.length > 0);
        setCurrentPenalty(penaltiesData[0] || null);
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (loading) return;
    supabase
      .from("game_state")
      .upsert({
        id: "playerState",
        level,
        xp,
        max_xp: maxXP,
        coins,
        hp,
        max_hp: maxHp,
        mana,
        max_mana: maxMana,
        badges,
        penalty_count: penaltyCount,
        penalty_coins: penaltyCoins,
      })
      .then(({ error }) => {
        if (error) console.error("Error updating player state:", error);
      });
  }, [
    level,
    xp,
    maxXP,
    coins,
    hp,
    maxHp,
    mana,
    maxMana,
    badges,
    penaltyCount,
    penaltyCoins,
    loading,
  ]);

  const toDbQuest = (quest) => {
    return {
      id: quest.id,
      name: quest.name,
      description: quest.description,
      difficulty: quest.difficulty,
      type: quest.type,
      status: quest.status,
      subquests: quest.subquests,
      priority: quest.priority,
      deadline: quest.deadline,
      dependencies: quest.dependencies,
      repeatable: quest.repeatable,
      required_level: quest.required_level,
      coins: quest.coins,
      xp: quest.xp,
      completion_timestamp: quest.completion_timestamp,
      warning_sent_for_current_period: quest.warning_sent_for_current_period,
      is_24_hour: quest.is_24_hour,
    };
  };

  useEffect(() => {
    if (loading) return;
    const dbQuests = quests.map(toDbQuest);
    supabase
      .from("quests")
      .upsert(dbQuests)
      .then(({ error }) => {
        if (error) console.error("Error updating quests:", error);
      });
  }, [quests, loading]);

  useEffect(() => {
    if (loading) return;
    supabase
      .from("inventory")
      .upsert(Object.values(inventory))
      .then(({ error }) => {
        if (error) console.error("Error updating inventory:", error);
      });
  }, [inventory, loading]);

  useEffect(() => {
    if (loading) return;
    supabase
      .from("notifications")
      .upsert(notifications)
      .then(({ error }) => {
        if (error) console.error("Error updating notifications:", error);
      });
  }, [notifications, loading]);

  useEffect(() => {
    if (loading) return;
    supabase
      .from("achievements")
      .upsert(achievements)
      .then(({ error }) => {
        if (error) console.error("Error updating achievements:", error);
      });
  }, [achievements, loading]);

  useEffect(() => {
    const checkDeadlines = async () => {
      const now = new Date().toISOString();
      let updated = false;
      const newQuests = await Promise.all(
        questsRef.current.map(async (q) => {
          if (
            q.deadline &&
            q.deadline < now &&
            q.status !== "completed" &&
            q.status !== "failed"
          ) {
            updated = true;
            if (q.type === "daily" && q.repeatable) {
              const { data: ps } = await supabase
                .from("game_state")
                .select("*")
                .eq("id", "playerState")
                .single();
              let { hp, max_hp, mana, max_mana, coins } = ps;
              hp = Math.max(0, hp - Math.floor(max_hp * 0.85));
              mana = Math.max(0, mana - Math.floor(max_mana * 0.85));
              coins = Math.max(0, coins - Math.floor(coins * 0.15));
              await supabase
                .from("game_state")
                .update({ hp, mana, coins })
                .eq("id", "playerState");

              const nextMidnight = new Date();
              nextMidnight.setDate(nextMidnight.getDate() + 1);
              nextMidnight.setHours(0, 0, 0, 0);
              const newDeadline = nextMidnight.toISOString();

              addNotification(
                `Penalty applied for missed Every Day Quest: "${q.name}"`,
                "penalty"
              );
              return {
                ...q,
                status: "not_started",
                deadline: newDeadline,
                warning_sent_for_current_period: false,
              };
            } else {
              addNotification(
                `Quest "${q.name}" has failed! Penalty applied.`,
                "penalty"
              );
              return { ...q, status: "failed" };
            }
          }
          return q;
        })
      );
      if (updated) setQuests(newQuests);
    };

    const interval = setInterval(checkDeadlines, 60000);
    checkDeadlines();
    return () => clearInterval(interval);
  }, []);

  const addNotification = async (message, type = "info") => {
    const newNotification = {
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      const { data } = await supabase
        .from("notifications")
        .insert(newNotification)
        .select()
        .single();
      setNotifications((prev) => [...prev, data]);
      setUnreadNotifications((prev) => prev + 1);
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ read: true })
        .neq("read", true);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const addAchievement = async (achievement) => {
    try {
      const { data } = await supabase
        .from("achievements")
        .insert({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          type: achievement.type,
          icon: achievement.icon,
          reward_value: achievement.rewardValue || null,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();
      setAchievements((prev) => [...prev, data]);

      addNotification(
        `Achievement Unlocked: ${achievement.name}! ${achievement.description}`,
        "achievement"
      );

      if (achievement.id === "rising_star") {
        setCoins((prev) => prev + 200);
        setXp((prev) => prev + 100);
      } else if (achievement.id === "master_adventurer") {
        setCoins((prev) => prev + 500);
        setMaxHp((prev) => Math.floor(prev * 1.1));
        setMaxMana((prev) => Math.floor(prev * 1.1));
      } else if (achievement.id === "consistent_performer") {
        setMaxHp((prev) => Math.floor(prev * 1.05));
      } else if (achievement.id === "unstoppable") {
        setMaxHp((prev) => Math.floor(prev * 1.1));
        setMaxMana((prev) => Math.floor(prev * 1.1));
      } else if (achievement.id === "careless") {
        setMaxHp((prev) => Math.floor(prev * 0.98));
        setMaxMana((prev) => Math.floor(prev * 0.98));
        addNotification(
          "Careless achievement penalty: -2% max HP and Mana",
          "penalty"
        );
      } else if (achievement.id === "first_purchase") {
        setCoins((prev) => prev + 100);
      } else if (achievement.id === "main_quest_starter") {
        setXp((prev) => prev + 200);
      }
    } catch (error) {
      console.error("Error adding achievement:", error);
    }
  };

  const checkAchievements = () => {
    if (level >= 1 && !achievements.some((a) => a.id === "first_step")) {
      addAchievement({
        id: "first_step",
        name: "First Step",
        description: "Reached Level 1",
        type: "positive",
        icon: "👣",
      });
    }

    if (level >= 5 && !achievements.some((a) => a.id === "rising_star")) {
      addAchievement({
        id: "rising_star",
        name: "Rising Star",
        description: "Reached Level 5",
        type: "positive",
        icon: "⭐",
        rewardValue: 0,
      });
    }

    if (
      level >= 10 &&
      !achievements.some((a) => a.id === "master_adventurer")
    ) {
      addAchievement({
        id: "master_adventurer",
        name: "Master Adventurer",
        description: "Reached Level 10",
        type: "positive",
        icon: "🏆",
        rewardValue: 0.1,
      });
    }

    const streak = quests.filter(
      (q) => q.type === "daily" && q.status === "completed"
    ).length;

    if (
      streak >= 3 &&
      !achievements.some((a) => a.id === "consistent_performer")
    ) {
      addAchievement({
        id: "consistent_performer",
        name: "Consistent Performer",
        description: "Completed 3 daily quests in a row",
        type: "positive",
        icon: "🔥",
        rewardValue: 0.05,
      });
    }

    if (streak >= 7 && !achievements.some((a) => a.id === "unstoppable")) {
      addAchievement({
        id: "unstoppable",
        name: "Unstoppable",
        description: "Completed 7 daily quests in a row",
        type: "positive",
        icon: "💪",
        rewardValue: 0.1,
      });
    }

    const penalties = notifications.filter(
      (n) => n.message.includes("Penalty") || n.message.includes("penalty")
    ).length;

    if (penalties > 0 && !achievements.some((a) => a.id === "careless")) {
      addAchievement({
        id: "careless",
        name: "Careless",
        description: "Received your first penalty",
        type: "negative",
        icon: "⚠️",
        rewardValue: -0.02,
      });
    }

    const purchases = Object.values(inventory).length;
    if (purchases > 0 && !achievements.some((a) => a.id === "first_purchase")) {
      addAchievement({
        id: "first_purchase",
        name: "First Purchase",
        description: "Bought your first item from the shop",
        type: "positive",
        icon: "🛒",
        rewardValue: 0,
      });
    }

    const mainQuestsCompleted = quests.filter(
      (q) => q.type === "main" && q.status === "completed"
    ).length;

    if (
      mainQuestsCompleted >= 1 &&
      !achievements.some((a) => a.id === "main_quest_starter")
    ) {
      addAchievement({
        id: "main_quest_starter",
        name: "Main Quest Starter",
        description: "Completed your first main quest",
        type: "positive",
        icon: "⚔️",
        rewardValue: 0,
      });
    }
  };

  const showLevelUpAnimation = (newLevelValue) => {
    setNewLevel(newLevelValue);
    setShowLevelUp(true);
    setTimeout(() => {
      setShowLevelUp(false);
    }, 3000);
  };

  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  const addBadge = (badge, duration = 5000) => {
    const newBadges = [...badges, badge];
    setBadges(newBadges);
    setTimeout(() => {
      setBadges((prev) => prev.filter((b) => b !== badge));
    }, duration);
  };

  const shopItems = [
    { id: 1, name: "HP Potion", desc: "Restores 50 HP", cost: 100 },
    { id: 2, name: "Mana Potion", desc: "Restores 50 Mana", cost: 100 },
    { id: 3, name: "1-Hour Break", desc: "Take a 1-hour break", cost: 500 },
  ].map((item) => {
    let costMultiplier = 1;
    if (penaltyCount > 0) {
      costMultiplier = penaltyCount === 1 ? 2 : 3;
    }
    return { ...item, cost: item.cost * costMultiplier };
  });

  const tabNames = {
    notification: `Notifications${
      unreadNotifications > 0 ? ` (${unreadNotifications})` : ""
    }`,
    quests: "Quests",
    achievements: "Achievements",
  };

  useEffect(() => {
    if (!loading) {
      checkAchievements();
    }
  }, [level, quests, inventory, notifications, loading]);

  const startQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest, level, quests, hp, mana, isPenaltyActive)) return;

    let newDeadline = quest.deadline;

    if (quest.is_24_hour) {
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      newDeadline = deadlineDate.toISOString();
    }

    setQuests(
      quests.map((q) =>
        q.id === id ? { ...q, status: "in_progress", deadline: newDeadline } : q
      )
    );

    addNotification(`Quest started: "${quest.name}"`, "quest");
  };

  const completeQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;
    if (quest.status === "completed" || quest.status === "failed") return;
    if (!canStartQuest(quest, level, quests, hp, mana, isPenaltyActive)) return;

    let hpCost =
      quest.type === "main" ? 20 : quest.type === "challenge" ? 30 : 5;
    let manaCost = quest.difficulty === "hard" ? 15 : 5;

    if (quest.difficulty === "medium") {
      hpCost = Math.floor(hpCost * 1.1);
      manaCost = Math.floor(manaCost * 1.1);
    } else if (quest.difficulty === "hard") {
      hpCost = Math.floor(hpCost * 1.35);
      manaCost = Math.floor(manaCost * 1.35);
    }

    if (hp < hpCost || mana < manaCost) {
      addNotification("Not enough HP or Mana to complete the quest", "warning");
      return;
    }

    setHp((prev) => Math.max(0, prev - hpCost));
    setMana((prev) => Math.max(0, prev - manaCost));

    let baseXP =
      quest.xp ||
      (quest.type === "main" ? 1000 : quest.type === "challenge" ? 1500 : 30);
    let baseCoins =
      quest.coins ||
      (quest.type === "main" ? 500 : quest.type === "challenge" ? 750 : 50);

    if (quest.difficulty === "medium") {
      baseXP *= 1.1;
      baseCoins *= 1.1;
    } else if (quest.difficulty === "hard") {
      baseXP *= 1.35;
      baseCoins *= 1.35;
    }

    if (isPenaltyActive) {
      baseXP = Math.floor(baseXP * 0.8);
    }

    let newXp = xp + Math.floor(baseXP);
    let newLevel = level;
    let newMaxXP = maxXP;

    while (newXp >= newMaxXP) {
      newXp -= newMaxXP;
      newLevel++;
      newMaxXP = Math.floor(newMaxXP * 1.18);
      setMaxHp((prev) => Math.floor(prev * 1.1));
      setMaxMana((prev) => Math.floor(prev * 1.1));
      setHp(maxHp);
      setMana(maxMana);

      showLevelUpAnimation(newLevel);
      addNotification(`Level up! Reached level ${newLevel}`, "level");
    }

    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins((prev) => prev + Math.floor(baseCoins));

    setQuests(
      quests.map((q) =>
        q.id === id
          ? {
              ...q,
              status: quest.repeatable ? "not_started" : "completed",
              completion_timestamp: quest.repeatable
                ? null
                : new Date().toISOString(),
            }
          : q
      )
    );

    addNotification(
      `Quest completed: "${quest.name}"! +${Math.floor(
        baseXP
      )} XP, +${Math.floor(baseCoins)} coins`,
      "success"
    );
  };

  const completeSubquest = async (parentId, subId) => {
    const parent = quests.find((q) => q.id === parentId);
    if (!parent || !parent.subquests) return;
    const sub = parent.subquests.find((sq) => sq.id === subId);
    if (!sub || sub.done) return;

    if (mana < 5) {
      addNotification("Not enough Mana to complete subquest", "warning");
      return;
    }

    setCoins((prev) => prev + 20);
    setMana((prev) => Math.max(0, prev - 5));
    setQuests(
      quests.map((q) =>
        q.id === parentId
          ? {
              ...q,
              subquests: q.subquests.map((sq) =>
                sq.id === subId ? { ...sq, done: true } : sq
              ),
            }
          : q
      )
    );

    addNotification(`Subquest completed: "${sub.name}"! +20 coins`, "success");
  };

  const openQuestForm = (type) => {
    if (
      type === "daily" &&
      quests.filter((q) => q.type === "daily").length >= 5
    ) {
      addNotification("Daily quest limit reached (max 5)", "warning");
      return;
    }
    setCurrentQuestType(type);
    setShowQuestModal(true);
  };

  const openSubquestForm = (parentId) => {
    setCurrentSubquestParentId(parentId);
    setShowSubquestModal(true);
  };

  const buyItem = async (id) => {
    const item = shopItems.find((i) => i.id === id);
    if (!item || coins < item.cost) {
      addNotification("Not enough coins or item not found", "warning");
      return;
    }

    setCoins((prev) => prev - item.cost);

    const itemKey = `item_${item.id}_${Date.now()}`;

    const newItem = {
      id: itemKey,
      name: item.name,
      description: item.desc,
      count: 1,
      purchased_price: item.cost,
      timestamp: new Date().toISOString(),
    };

    await supabase.from("inventory").insert(newItem);
    setInventory((prev) => ({ ...prev, [itemKey]: newItem }));

    addNotification(`Purchased: ${item.name}`, "shop");
  };

  const applyItem = async (id) => {
    const item = inventory[id];
    if (!item || item.count <= 0) {
      addNotification("Item not available or insufficient quantity", "warning");
      return;
    }

    applyItemEffect(item, setHp, maxHp, setMana, maxMana, addBadge);

    const newCount = item.count - 1;
    if (newCount <= 0) {
      await supabase.from("inventory").delete().eq("id", id);
      setInventory((prev) => {
        const newInv = { ...prev };
        delete newInv[id];
        return newInv;
      });
    } else {
      await supabase.from("inventory").update({ count: newCount }).eq("id", id);
      setInventory((prev) => ({ ...prev, [id]: { ...item, count: newCount } }));
    }

    addNotification(`Used: ${item.name}`, "item");
  };

  const handleQuestConfirm = async ({
    name,
    description,
    difficulty,
    type,
    deadline,
    dependencies,
    repeatable,
    required_level,
    xp,
    coins,
    is_24_hour,
  }) => {
    if (!name) {
      addNotification("Quest name not provided", "warning");
      return;
    }

    const newQuest = {
      id: Date.now().toString(),
      name,
      description,
      difficulty,
      type,
      status: "not_started",
      subquests: [],
      priority:
        quests.reduce((max, q) => (q.priority > max ? q.priority : max), 0) + 1,
      deadline: deadline || null,
      dependencies: dependencies || [],
      repeatable: !!repeatable,
      required_level: required_level || 1,
      xp: xp || 0,
      coins: coins || 0,
      is_24_hour: !!is_24_hour,
      warning_sent_for_current_period: false,
    };

    await supabase.from("quests").insert(newQuest);
    setQuests([...quests, newQuest]);
    setShowQuestModal(false);

    addNotification(`New quest created: "${name}"`, "quest");
  };

  const handleSubquestConfirm = async ({ name, description }) => {
    if (!name) {
      addNotification("Subquest name not provided", "warning");
      return;
    }
    const parent = quests.find((q) => q.id === currentSubquestParentId);
    if (!parent) {
      addNotification("Parent quest not found", "error");
      return;
    }
    const newSubquest = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      name,
      description,
      done: false,
    };
    const updatedQuests = quests.map((q) =>
      q.id === currentSubquestParentId
        ? { ...q, subquests: [...(q.subquests || []), newSubquest] }
        : q
    );
    await supabase
      .from("quests")
      .update({
        subquests: updatedQuests.find((q) => q.id === currentSubquestParentId)
          .subquests,
      })
      .eq("id", currentSubquestParentId);
    setQuests(updatedQuests);
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);

    addNotification(`Subquest added to "${parent.name}": ${name}`, "quest");
  };

  const completePenaltyTask = async (penaltyId, taskIndex) => {
    const { data: penalty } = await supabase
      .from("penalties")
      .select("*")
      .eq("id", penaltyId)
      .single();
    if (penalty) {
      const updatedTasks = penalty.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: true } : task
      );
      await supabase
        .from("penalties")
        .update({ tasks: updatedTasks })
        .eq("id", penaltyId);
      setCurrentPenalty({ ...penalty, tasks: updatedTasks });
    }
  };

  const updateApology = async (penaltyId, apology) => {
    await supabase.from("penalties").update({ apology }).eq("id", penaltyId);
    setCurrentPenalty((prev) => ({ ...prev, apology }));
  };

  useEffect(() => {
    const checkPenalty = async () => {
      const now = new Date().toISOString();
      const { data: activePenalties } = await supabase
        .from("penalties")
        .select("*")
        .gt("end_time", now);
      setIsPenaltyActive(
        Array.isArray(activePenalties) && activePenalties.length > 0
      );
      if (Array.isArray(activePenalties) && activePenalties.length > 0) {
        setCurrentPenalty(activePenalties[0]);
        setShowPenaltyModal(true);
      } else {
        setCurrentPenalty(null);
      }
    };
    checkPenalty();
    const interval = setInterval(checkPenalty, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "notification":
        return (
          <NotificationPanel
            notifications={notifications}
            unreadNotifications={unreadNotifications}
            markNotificationAsRead={markNotificationAsRead}
            markAllNotificationsAsRead={markAllNotificationsAsRead}
          />
        );
      case "achievements":
        return <AchievementsPanel achievements={achievements} />;
      case "quests":
        return (
          <Quests
            quests={quests}
            setQuests={setQuests}
            openQuestForm={openQuestForm}
            openSubquestForm={openSubquestForm}
            completeQuest={completeQuest}
            completeSubquest={completeSubquest}
            startQuest={startQuest}
            userLevel={level}
            canStartQuest={(quest) =>
              canStartQuest(quest, level, quests, hp, mana, isPenaltyActive)
            }
            addNotification={addNotification}
          />
        );
      default:
        return null;
    }
  };

  const ChartErrorFallback = () => <div>⚠️ Chart failed to load.</div>;

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {particlesLoaded && <ParticlesBackground />}
      <div className="container mx-auto p-4 max-w-2xl relative z-10">
        {loading ? (
          <LoadingComponent />
        ) : (
          <>
            {showLevelUp && <LevelUpModal level={newLevel} />}
            {showPenaltyModal && currentPenalty && (
              <PenaltyModal
                currentPenalty={currentPenalty}
                onClose={() => setShowPenaltyModal(false)}
                completeTask={completePenaltyTask}
                updateApology={updateApology}
              />
            )}
            <Header
              level={level}
              coins={coins}
              hp={hp}
              maxHp={maxHp}
              mana={mana}
              maxMana={maxMana}
              xp={xp}
              maxXP={maxXP}
              setShowInventoryModal={setShowInventoryModal}
              setShowShopModal={setShowShopModal}
              badges={badges}
              isPenaltyActive={isPenaltyActive}
              showPenaltyDetails={() => setShowPenaltyModal(true)}
            />
            <ErrorBoundary FallbackComponent={ChartErrorFallback}>
              <Charts
                xp={xp}
                maxXP={maxXP}
                hp={hp}
                maxHp={maxHp}
                mana={mana}
                maxMana={maxMana}
                completedQuests={quests.filter((q) => q.status === "completed")}
              />
            </ErrorBoundary>
            <TabNavigation
              tabNames={tabNames}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <div className="px-2 py-4">{renderTabContent()}</div>
            <Journal />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
