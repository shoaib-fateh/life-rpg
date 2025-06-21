import { useState, useEffect, useRef } from "react";
import Particles from "particles.js";
import Dexie from "dexie";
import Header from "./Header";
import Quests from "./Quests";
import Charts from "./Charts";
import Modals from "./Modals";
import { useLiveQuery } from "dexie-react-hooks";

// Initialize Dexie database
const db = new Dexie("life_rpg");
db.version(1).stores({
  gameState: "id",
  quests: "id",
  inventory: "id",
  notifications: "++id, timestamp",
  achievements: "id",
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
    }
  }, [dbPlayerState]);

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
        });
      }
    };
    initPlayerStateIfNeeded();
  }, []);

  // Add notification to DB and state
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

  // Mark notification as read
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

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await db.notifications.toCollection().modify({ read: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (e) {
      console.error("Error marking all notifications as read:", e);
    }
  };

  // Add achievement
  const addAchievement = async (achievement) => {
    try {
      await db.achievements.put(achievement);
      setAchievements((prev) => [...prev, achievement]);

      // Show notification
      addNotification(
        `Achievement Unlocked: ${achievement.name}! ${achievement.description}`,
        "achievement"
      );

      // Apply achievement effects
      if (achievement.effect) {
        achievement.effect();
      }
    } catch (e) {
      console.error("Error adding achievement:", e);
    }
  };

  // Check achievements
  const checkAchievements = () => {
    // Level-based achievements
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

    // Streak achievements
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

    // Penalty achievement
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
          // Apply permanent penalty
          setMaxHp((prev) => Math.floor(prev * 0.98));
          setMaxMana((prev) => Math.floor(prev * 0.98));
          addNotification(
            "Careless achievement penalty: -2% max HP and Mana",
            "penalty"
          );
        },
      });
    }

    // First purchase achievement
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

    // Quest completion achievements
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

  // Show level up effect
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
      })
      .catch((e) => console.error("Error updating player state:", e));
  }, [level, xp, maxXP, coins, hp, maxHp, mana, maxMana, badges]);

  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  // Add badge with timeout
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
  ];

  const tabNames = {
    notification: `Notification${
      unreadNotifications > 0 ? ` (${unreadNotifications})` : ""
    }`,
    quests: "Quests",
    achievements: "Achievements",
  };

  // Load state from IndexedDB
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

        // Load notifications and achievements
        setNotifications(notificationsData);
        setAchievements(achievementsData);

        // Count unread notifications
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

  // Regenerate HP and Mana hourly with conditions
  useEffect(() => {
    const regenerate = () => {
      if (hp < maxHp || mana < maxMana) {
        const now = new Date();
        const hour = (now.getUTCHours() + 4) % 24;
        const baseRate = 0.01;
        let regenRate = baseRate;

        // Nighttime bonus (8pm-6am)
        if (hour >= 20 || hour < 6) regenRate = baseRate * 2;

        // Critical low bonus
        if (hp < maxHp * 0.3 || mana < maxMana * 0.3) regenRate *= 1.5;

        setHp((prev) => Math.min(prev + maxHp * regenRate, maxHp));
        setMana((prev) => Math.min(prev + maxMana * regenRate, maxMana));
      }
    };

    const interval = setInterval(regenerate, 3600000); // Every hour
    return () => clearInterval(interval);
  }, [hp, maxHp, mana, maxMana]);

  // Check quest deadlines every minute
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

  // Initialize particles.js
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

  // Auto-save player state
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
      })
      .catch((e) => console.error("Error updating player state:", e));
  }, [level, xp, maxXP, coins, hp, maxHp, mana, maxMana, badges, loading]);

  // Auto-save quests
  useEffect(() => {
    if (loading) return;
    db.quests
      .bulkPut(quests)
      .catch((e) => console.error("Error updating quests:", e));
  }, [quests, loading]);

  // Auto-save inventory
  useEffect(() => {
    if (loading) return;
    db.inventory
      .bulkPut(Object.values(inventory))
      .catch((e) => console.error("Error updating inventory:", e));
  }, [inventory, loading]);

  // Auto-save notifications
  useEffect(() => {
    if (loading) return;
    db.notifications
      .bulkPut(notifications)
      .catch((e) => console.error("Error updating notifications:", e));
  }, [notifications, loading]);

  // Auto-save achievements
  useEffect(() => {
    if (loading) return;
    db.achievements
      .bulkPut(achievements)
      .catch((e) => console.error("Error updating achievements:", e));
  }, [achievements, loading]);

  // Check achievements when state changes
  useEffect(() => {
    if (!loading) {
      checkAchievements();
    }
  }, [level, quests, inventory, notifications, loading]);

  // Check if a quest can be started (dependencies & level)
  const canStartQuest = (quest) => {
    if (!quest.dependencies || quest.dependencies.length === 0) return true;
    if (quest.requiredLevel && level < quest.requiredLevel) return false;

    return quest.dependencies.every((depId) => {
      const depQuest = quests.find((q) => q.id === depId);
      return depQuest && depQuest.status === "completed";
    });
  };

  // Start quest with deadline handling for 24h quests
  const startQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    let newDeadline = quest.deadline;

    // Handle 24-hour quests
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

  // Complete quest with resource and reward calculations
  const completeQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;
    if (quest.status === "completed" || quest.status === "failed") return;
    if (!canStartQuest(quest)) return;

    // Calculate resource costs based on quest difficulty
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

    // Check resources before deducting
    if (hp < hpCost || mana < manaCost) {
      addNotification("Not enough HP or Mana to complete the quest", "warning");
      return;
    }

    // Deduct resources first
    setHp((prev) => Math.max(0, prev - hpCost));
    setMana((prev) => Math.max(0, prev - manaCost));

    // Then calculate and apply rewards
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

    let newXp = xp + Math.floor(baseXP);
    let newLevel = level;
    let newMaxXP = maxXP;

    while (newXp >= newMaxXP) {
      newXp -= newMaxXP;
      newLevel++;
      newMaxXP = Math.floor(newMaxXP * 1.18);
      setMaxHp((prev) => Math.floor(prev * 1.1));
      setMaxMana((prev) => Math.floor(prev * 1.1));

      // Show level up animation for each level gained
      showLevelUpAnimation(newLevel);
      addNotification(`Level up! Reached level ${newLevel}`, "level");
    }

    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins((prev) => prev + Math.floor(baseCoins));

    // Update quest status
    setQuests(
      quests.map((q) =>
        q.id === id
          ? quest.repeatable
            ? { ...q, status: "not_started" }
            : { ...q, status: "completed" }
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

  // Complete subquest logic
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

  // Open quest creation modal, enforcing daily quest limit
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

  // Open subquest modal for parent quest
  const openSubquestForm = (parentId) => {
    setCurrentSubquestParentId(parentId);
    setShowSubquestModal(true);
  };

  // Buying an item logic with unique inventory keys
  const buyItem = async (id) => {
    const item = shopItems.find((i) => i.id === id);
    if (!item || coins < item.cost) {
      addNotification("Not enough coins or item not found", "warning");
      return;
    }

    setCoins((prev) => prev - item.cost);

    // Create unique key by id + timestamp to allow multiple stacks
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

  // Applying an item effect and adjusting inventory count
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
      // Could add more break logic here
    }

    // Remove or decrement count
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

  // Handling quest confirmation from modal
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

  // Handling subquest confirmation from modal
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

  // Render content depending on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "notification":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-400">
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
                    }`}
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
          <div className="p-4">
            <h2 className="text-xl font-bold text-purple-400 mb-4">
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
                    }`}
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
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-xl max-w-xs w-full flex flex-col items-center">
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
            />
            <div className="mb-6 bg-gray-800 rounded-lg pt-2 px-1">
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
            <Charts
              xp={xp}
              maxXP={maxXP}
              hp={hp}
              maxHp={maxHp}
              mana={mana}
              maxMana={maxMana}
            />
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
          </>
        )}
      </div>
    </div>
  );
};

export default App;
