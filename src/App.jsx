import { useState, useEffect, useRef } from "react";
import Particles from "particles.js";
import Dexie from "dexie";
import Header from "./Header";
import Quests from "./Quests";
import Charts from "./Charts";
import Modals from "./Modals";
import Journal from "./Journal";
import { useLiveQuery } from "dexie-react-hooks";

// Initialize Dexie database
const db = new Dexie("life_rpg");
db.version(1).stores({
  gameState: "id",
  quests: "id",
  inventory: "id",
  notifications: "++id, timestamp",
  achievements: "id",
  penalties: "++id, startTime, endTime, tasks, apology",
  journal: "++id, text, timestamp",
});

const App = () => {
  // Player state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [maxXP, setMaxXP] = useState(980);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mana, setMana] = useState(120);
  const [maxMana, setMaxMana] = useState(120);
  const [badges, setBadges] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [penaltyCoins, setPenaltyCoins] = useState(0);
  const [isPenaltyActive, setIsPenaltyActive] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  // Gameplay state
  const [quests, setQuests] = useState([]);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [currentSubquestParentId, setCurrentSubquestParentId] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showSubquestModal, setShowSubquestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Quests");
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const particlesContainerRef = useRef(null);
  const questsRef = useRef([]);
  const dbPlayerState = useLiveQuery(() => db.gameState.get("playerState"));
  const dbQuests = useLiveQuery(() => db.quests.toArray(), []);

  useEffect(() => {
    if (dbPlayerState) {
      setLevel(dbPlayerState.level || 1);
      setXp(dbPlayerState.xp || 0);
      setMaxXP(dbPlayerState.maxXP || 980);
      setCoins(dbPlayerState.coins || 0);
      setHp(dbPlayerState.hp || 100);
      setMaxHp(dbPlayerState.maxHp || 100);
      setMana(dbPlayerState.mana || 100);
      setMaxMana(dbPlayerState.maxMana || 120);
      setBadges(dbPlayerState.badges || []);
      setPenaltyCount(dbPlayerState.penaltyCount || 0);
      setPenaltyCoins(dbPlayerState.penaltyCoins || 0);
    }
  }, [dbPlayerState]);

  useEffect(() => {
    if (dbQuests) {
      setQuests(dbQuests);
    }
  }, [dbQuests]);

  useEffect(() => {
    const initPlayerStateIfNeeded = async () => {
      const existing = await db.gameState.get("playerState");
      if (!existing) {
        await db.gameState.put({
          id: "playerState",
          level: 1,
          xp: 0,
          maxXP: 980,
          coins: 0,
          hp: 100,
          maxHp: 100,
          mana: 100,
          maxMana: 120,
          badges: [],
          penaltyCount: 0,
          penaltyCoins: 0,
        });
      }
    };
    initPlayerStateIfNeeded();
  }, []);

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
              const ps = await db.gameState.get("playerState");
              let { hp, maxHp, mana, maxMana, coins } = ps;
              hp = Math.max(0, hp - Math.floor(maxHp * 0.85));
              mana = Math.max(0, mana - Math.floor(maxMana * 0.85));
              coins = Math.max(0, coins - Math.floor(coins * 0.15));
              await db.gameState.put({ ...ps, hp, mana, coins });

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
                warningSentForCurrentPeriod: false,
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
      const id = await db.notifications.add(newNotification);
      setNotifications((prev) => [...prev, { ...newNotification, id }]);
      setUnreadNotifications((prev) => prev + 1);
    } catch (e) {
      console.error("Error adding notification:", e);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await db.notifications.update(id, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await db.notifications.toCollection().modify({ read: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (e) {
      console.error("Error marking all notifications as read:", e);
    }
  };

  const addAchievement = async (achievement) => {
    try {
      await db.achievements.put(achievement);
      setAchievements((prev) => [...prev, achievement]);

      addNotification(
        `Achievement Unlocked: ${achievement.name}! ${achievement.description}`,
        "achievement"
      );

      if (achievement.effect) {
        achievement.effect();
      }
    } catch (e) {
      console.error("Error adding achievement:", e);
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
        reward: () => {
          setCoins((prev) => prev + 200);
          setXp((prev) => prev + 100);
        },
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
        reward: () => {
          setCoins((prev) => prev + 500);
          setMaxHp((prev) => Math.floor(prev * 1.1));
          setMaxMana((prev) => Math.floor(prev * 1.1));
        },
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
        reward: () => {
          setMaxHp((prev) => Math.floor(prev * 1.05));
        },
      });
    }

    if (streak >= 7 && !achievements.some((a) => a.id === "unstoppable")) {
      addAchievement({
        id: "unstoppable",
        name: "Unstoppable",
        description: "Completed 7 daily quests in a row",
        type: "positive",
        icon: "💪",
        reward: () => {
          setMaxHp((prev) => Math.floor(prev * 1.1));
          setMaxMana((prev) => Math.floor(prev * 1.1));
        },
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
        effect: () => {
          setMaxHp((prev) => Math.floor(prev * 0.98));
          setMaxMana((prev) => Math.floor(prev * 0.98));
          addNotification(
            "Careless achievement penalty: -2% max HP and Mana",
            "penalty"
          );
        },
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
        reward: () => {
          setCoins((prev) => prev + 100);
        },
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
        reward: () => {
          setXp((prev) => prev + 200);
        },
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
    if (!dbPlayerState) return;
    db.gameState
      .put({
        id: "playerState",
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
      })
      .catch((e) => console.error("Error updating player state:", e));
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
  ]);

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
    notification: `Notification${
      unreadNotifications > 0 ? ` (${unreadNotifications})` : ""
    }`,
    quests: "Quests",
    achievements: "Achievements",
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const [
          playerState,
          questsData,
          inventoryItems,
          notificationsData,
          achievementsData,
        ] = await Promise.all([
          db.gameState.get("playerState"),
          db.quests.toArray(),
          db.inventory.toArray(),
          db.notifications.toArray(),
          db.achievements.toArray(),
        ]);

        if (playerState) {
          setLevel(playerState.level || 1);
          setXp(playerState.xp || 0);
          setMaxXP(playerState.maxXP || 980);
          setCoins(playerState.coins || 0);
          setHp(playerState.hp || 100);
          setMaxHp(playerState.maxHp || 100);
          setMana(playerState.mana || 100);
          setMaxMana(playerState.maxMana || 120);
          setBadges(playerState.badges || []);
          setPenaltyCount(playerState.penaltyCount || 0);
          setPenaltyCoins(playerState.penaltyCoins || 0);
        } else {
          await db.gameState.put({
            id: "playerState",
            level: 1,
            xp: 0,
            maxXP: 980,
            coins: 0,
            hp: 100,
            maxHp: 100,
            mana: 100,
            maxMana: 120,
            badges: [],
            penaltyCount: 0,
            penaltyCoins: 0,
          });
        }

        const formattedQuests = questsData.map((q) => ({
          ...q,
          status: q.status || "not_started",
          dependencies: q.dependencies || [],
          deadline: q.deadline || null,
          subquests: q.subquests || [],
          repeatable: !!q.repeatable,
          is24Hour: !!q.is24Hour,
          requiredLevel: q.requiredLevel || 1,
          coins: q.coins || 0,
          xp: q.xp || 0,
          warningSentForCurrentPeriod: q.warningSentForCurrentPeriod || false,
        }));
        setQuests(formattedQuests);

        const invData = {};
        inventoryItems.forEach((item) => {
          let effectFn = () => {};
          if (item.name === "HP Potion") {
            effectFn = () => {
              setHp((prev) => Math.min(prev + 50, maxHp));
              addBadge("HP+", 3000);
            };
          } else if (item.name === "Mana Potion") {
            effectFn = () => {
              setMana((prev) => Math.min(prev + 50, maxMana));
              addBadge("MA+", 3000);
            };
          } else if (item.name === "1-Hour Break") {
            effectFn = () => {
              console.log("1-hour break used");
              addBadge("REST", 5000);
            };
          }
          invData[item.id] = { ...item, effect: effectFn };
        });
        setInventory(invData);

        setNotifications(notificationsData);
        setAchievements(achievementsData);

        const unread = notificationsData.filter((n) => !n.read).length;
        setUnreadNotifications(unread);
      } catch (error) {
        console.error("Error loading data from database:", error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, [maxHp, maxMana]);

  useEffect(() => {
    const regenerate = () => {
      if (isPenaltyActive) return;
      if (hp <= 0 || mana <= 0) return;
      if (hp < maxHp || mana < maxMana) {
        const now = new Date();
        const hour = (now.getUTCHours() + 4) % 24;
        const baseRate = 0.01;
        let regenRate = baseRate;

        if (hour >= 20 || hour < 6) regenRate = baseRate * 2;

        if (hp < maxHp * 0.3 || mana < maxMana * 0.3) regenRate *= 1.5;

        setHp((prev) => Math.min(prev + maxHp * regenRate, maxHp));
        setMana((prev) => Math.min(prev + maxMana * regenRate, maxMana));
      }
    };

    const interval = setInterval(regenerate, 3600000);
    return () => clearInterval(interval);
  }, [hp, maxHp, mana, maxMana, isPenaltyActive]);

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date().toISOString();
      let updated = false;
      const newQuests = questsRef.current.map((q) => {
        if (
          q.deadline &&
          q.deadline < now &&
          q.status !== "completed" &&
          q.status !== "failed"
        ) {
          updated = true;
          addNotification(
            `Quest "${q.name}" has failed! Penalty applied.`,
            "penalty"
          );
          return { ...q, status: "failed" };
        }
        return q;
      });
      if (updated) setQuests(newQuests);
    };

    const interval = setInterval(checkDeadlines, 60000);
    checkDeadlines();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkPenalty = async () => {
      const now = new Date().toISOString();
      const activePenalties = await db.penalties
        .where("endTime")
        .above(now)
        .toArray();
      setIsPenaltyActive(activePenalties.length > 0);
      if (activePenalties.length > 0) {
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

  const completePenaltyTask = async (penaltyId, taskIndex) => {
    const penalty = await db.penalties.get(penaltyId);
    if (penalty) {
      const updatedTasks = penalty.tasks.map((task, index) =>
        index === taskIndex ? { ...task, completed: true } : task
      );
      await db.penalties.update(penaltyId, { tasks: updatedTasks });
      setCurrentPenalty({ ...penalty, tasks: updatedTasks });
    }
  };

  const updateApology = async (penaltyId, apology) => {
    await db.penalties.update(penaltyId, { apology });
    setCurrentPenalty((prev) => ({ ...prev, apology }));
  };

  useEffect(() => {
    if (!loading && particlesContainerRef.current) {
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#5a5af0" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#5a5af0",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 6,
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: {
            repulse: { distance: 200, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });
    }
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    db.gameState
      .put({
        id: "playerState",
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
      })
      .catch((e) => console.error("Error updating player state:", e));
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

  useEffect(() => {
    if (loading) return;
    db.quests
      .bulkPut(quests)
      .catch((e) => console.error("Error updating quests:", e));
  }, [quests, loading]);

  useEffect(() => {
    if (loading) return;
    db.inventory
      .bulkPut(Object.values(inventory))
      .catch((e) => console.error("Error updating inventory:", e));
  }, [inventory, loading]);

  useEffect(() => {
    if (loading) return;
    db.notifications
      .bulkPut(notifications)
      .catch((e) => console.error("Error updating notifications:", e));
  }, [notifications, loading]);

  useEffect(() => {
    if (loading) return;
    db.achievements
      .bulkPut(achievements)
      .catch((e) => console.error("Error updating achievements:", e));
  }, [achievements, loading]);

  useEffect(() => {
    if (!loading) {
      checkAchievements();
    }
  }, [level, quests, inventory, notifications, loading]);

  const canStartQuest = (quest) => {
    if (hp <= 0 || mana <= 0) return false;
    if (isPenaltyActive && quest.type === "daily" && quest.repeatable)
      return false;
    if (!quest.dependencies || quest.dependencies.length === 0) return true;
    if (quest.requiredLevel && level < quest.requiredLevel) return false;

    return quest.dependencies.every((depId) => {
      const depQuest = quests.find((q) => q.id === depId);
      return depQuest && depQuest.status === "completed";
    });
  };

  const startQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    let newDeadline = quest.deadline;

    if (quest.is24Hour) {
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
    if (!canStartQuest(quest)) return;

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
              completionTimestamp: quest.repeatable
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

    let effectFn = () => {};
    if (item.name === "HP Potion") {
      effectFn = () => {
        setHp((prev) => Math.min(prev + 50, maxHp));
        addBadge("HP+", 3000);
      };
    } else if (item.name === "Mana Potion") {
      effectFn = () => {
        setMana((prev) => Math.min(prev + 50, maxMana));
        addBadge("MA+", 3000);
      };
    } else if (item.name === "1-Hour Break") {
      effectFn = () => {
        console.log("1-hour break used");
        addBadge("REST", 5000);
      };
    }

    const newItem = {
      id: itemKey,
      name: item.name,
      desc: item.desc,
      count: 1,
      purchasedPrice: item.cost,
      timestamp: Date.now(),
      effect: effectFn,
    };

    setInventory((prev) => ({ ...prev, [itemKey]: newItem }));

    addNotification(`Purchased: ${item.name}`, "shop");
  };

  const applyItem = async (id) => {
    const item = inventory[id];
    if (!item || item.count <= 0) {
      addNotification("Item not available or insufficient quantity", "warning");
      return;
    }

    if (item.name === "HP Potion") {
      setHp((prev) => Math.min(prev + 50, maxHp));
      addBadge("HP+", 3000);
    } else if (item.name === "Mana Potion") {
      setMana((prev) => Math.min(prev + 50, maxMana));
      addBadge("MA+", 3000);
    } else if (item.name === "1-Hour Break") {
      setHp((prev) => Math.min(prev + 20, maxHp));
      addBadge("REST", 5000);
    }

    const newCount = item.count - 1;
    if (newCount <= 0) {
      setInventory((prev) => {
        const newInv = { ...prev };
        delete newInv[id];
        return newInv;
      });
    } else {
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
    requiredLevel,
    xp,
    coins,
    is24Hour,
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
      requiredLevel: requiredLevel || 1,
      xp: xp || 0,
      coins: coins || 0,
      is24Hour: !!is24Hour,
    };

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
    setQuests(
      quests.map((q) =>
        q.id === currentSubquestParentId
          ? { ...q, subquests: [...(q.subquests || []), newSubquest] }
          : q
      )
    );
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);

    addNotification(`Subquest added to "${parent.name}": ${name}`, "quest");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "notification":
        return (
          <div className="p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-400 drop-shadow-glow">
                Notifications
              </h2>
              {unreadNotifications > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-sm bg-purple-700 px-3 py-1 rounded hover:bg-purple-600 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[...notifications].reverse().map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border ${
                      notification.read
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-900 border-purple-500"
                    } backdrop-blur-md`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        {notification.type === "level" && (
                          <span className="mr-2 text-yellow-400">🌟</span>
                        )}
                        {notification.type === "achievement" && (
                          <span className="mr-2 text-green-400">🏆</span>
                        )}
                        {notification.type === "penalty" && (
                          <span className="mr-2 text-red-400">⚠️</span>
                        )}
                        {notification.type === "warning" && (
                          <span className="mr-2 text-yellow-400">⚠️</span>
                        )}
                        <div>
                          <p
                            className={
                              notification.read ? "text-gray-300" : "text-white"
                            }
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
            canStartQuest={canStartQuest}
            addNotification={addNotification}
          />
        );
      case "achievements":
        return (
          <div className="p-4 animate-fade-in">
            <h2 className="text-xl font-bold text-purple-400 mb-4 drop-shadow-glow">
              Achievements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-gray-400">
                  No achievements earned yet
                </div>
              ) : (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.type === "positive"
                        ? "border-green-500 bg-green-900/20"
                        : "border-red-500 bg-red-900/20"
                    } backdrop-blur-md`}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{achievement.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">
                          {achievement.name}
                        </h3>
                        <p className="text-gray-300">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Earned on:{" "}
                          {new Date(achievement.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div
        ref={particlesContainerRef}
        id="particles-js"
        className="absolute inset-0 z-0"
      />
      <div className="container mx-auto p-4 max-w-2xl relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[90vh]">
            <div className="backdrop-blur-xl bg-gradient-to-b from-gray-900/50 to-gray-800/50 border border-white/10 rounded-xl p-8 shadow-2xl max-w-xs w-full flex flex-col items-center animate-pop-in">
              <div className="animate-pulse">
                <svg
                  className="w-14 h-14 text-purple-300 drop-shadow-glow"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.5 3l11 11M3 6.5L14 17.5M19 5l-5 5m-2 2l-4 4-1 4 4-1 4-4"
                  />
                </svg>
              </div>
              <p className="mt-4 text-center text-purple-200 font-bold text-lg animate-bounce">
                Loading the fantasy world...
              </p>
            </div>
          </div>
        ) : (
          <>
            {showLevelUp && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"></div>
                <div className="relative bg-gradient-to-r from-purple-600/30 to-blue-500/30 border border-white/20 rounded-xl p-8 shadow-2xl max-w-md w-full text-center backdrop-blur-xl animate-pop-in">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    LEVEL UP!
                  </h2>
                  <p className="text-5xl font-bold text-yellow-400 mb-6">
                    {newLevel}
                  </p>
                  <p className="text-purple-200">
                    You've grown stronger! Max HP and Mana increased.
                  </p>
                </div>
              </div>
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
            <Charts
              xp={xp}
              maxXP={maxXP}
              hp={hp}
              maxHp={maxHp}
              mana={mana}
              maxMana={maxMana}
              completedQuests={quests.filter((q) => q.status === "completed")}
            />
            <div className="mb-6 bg-gray-800 bg-opacity-50 rounded-lg pt-2 px-1 backdrop-blur-md border border-white/10">
              {Object.entries(tabNames).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === key
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {name}
                </button>
              ))}
              <div className="px-2 py-4">{renderTabContent()}</div>
            </div>
            <Journal />
            <Modals
              showQuestModal={showQuestModal}
              setShowQuestModal={setShowQuestModal}
              currentQuestType={currentQuestType}
              onQuestConfirm={handleQuestConfirm}
              showSubquestModal={showSubquestModal}
              setShowSubquestModal={setShowSubquestModal}
              onSubquestConfirm={handleSubquestConfirm}
              showShopModal={showShopModal}
              setShowShopModal={setShowShopModal}
              shopItems={shopItems}
              coins={coins}
              onBuy={buyItem}
              showInventoryModal={showInventoryModal}
              setShowInventoryModal={setShowInventoryModal}
              inventory={inventory}
              applyItem={applyItem}
              quests={quests}
            />
            {showPenaltyModal && currentPenalty && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div
                  className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-md"
                  onClick={() => setShowPenaltyModal(false)}
                ></div>
                <div className="relative bg-gray-800 bg-opacity-50 rounded-lg p-6 max-w-md w-full backdrop-blur-xl border border-white/10">
                  <h2 className="text-2xl font-bold text-red-400 mb-4 drop-shadow-glow">
                    Penalty Details
                  </h2>
                  <p className="text-gray-300 mb-4">
                    You have been penalized for not completing your Every Day
                    Quests on time.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Penalties applied:
                    <ul className="list-disc ml-5">
                      <li>HP and Mana reduced by 80%</li>
                      <li>20% of coins deducted</li>
                      <li>Experience gain reduced by 20%</li>
                      <li>Store prices increased</li>
                    </ul>
                  </p>
                  <p className="text-gray-300 mb-4">
                    Penalty ends on:{" "}
                    {new Date(currentPenalty.endTime).toLocaleString()}
                  </p>
                  <p className="text-gray-300 mb-4">
                    Additional tasks:
                    <ul className="list-disc ml-5">
                      {currentPenalty.tasks.map((task, index) => (
                        <li key={index}>
                          {task.name} -{" "}
                          {task.completed ? "Completed" : "Pending"}
                          {!task.completed && (
                            <button
                              onClick={() =>
                                completePenaltyTask(currentPenalty.id, index)
                              }
                              className="ml-2 text-sm bg-green-500 px-2 py-1 rounded"
                            >
                              Complete
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </p>
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">
                      Apology/Reason:
                    </label>
                    <textarea
                      className="w-full p-2 bg-gray-700 rounded"
                      value={currentPenalty.apology || ""}
                      onChange={(e) =>
                        updateApology(currentPenalty.id, e.target.value)
                      }
                    />
                  </div>
                  <button
                    onClick={() => setShowPenaltyModal(false)}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;