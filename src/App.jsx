import { useState, useEffect, useRef } from "react";
import Particles from "particles.js";
import Dexie from 'dexie';
import Header from "./Header";
import Quests from "./Quests";
import Charts from "./Charts";
import Modals from "./Modals";

// Initialize Dexie database
const db = new Dexie('life_rpg');
db.version(1).stores({
  gameState: 'id',
  quests: 'id',
  inventory: 'id'
});

const App = () => {
  // Player state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(10);
  const [maxXP, setMaxXP] = useState(980);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mana, setMana] = useState(120);
  const [maxMana, setMaxMana] = useState(120);

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

  const particlesContainerRef = useRef(null);
  const questsRef = useRef([]);

  useEffect(() => {
    questsRef.current = quests;
  }, [quests]);

  const shopItems = [
    { id: 1, name: "HP Potion", desc: "Restores 50 HP", cost: 100 },
    { id: 2, name: "Mana Potion", desc: "Restores 50 Mana", cost: 100 },
    { id: 3, name: "1-Hour Break", desc: "Take a 1-hour break", cost: 500 },
  ];

  const tabNames = {
    notification: "Notification",
    quests: "Quests",
    achievements: "Achievements",
  };

  // Load state from IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        const [playerState, questsData, inventoryItems] = await Promise.all([
          db.gameState.get('playerState'),
          db.quests.toArray(),
          db.inventory.toArray()
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
        } else {
          await db.gameState.put({
            id: 'playerState',
            level: 1,
            xp: 0,
            maxXP: 980,
            coins: 0,
            hp: 100,
            maxHp: 100,
            mana: 100,
            maxMana: 120,
          });
        }

        const formattedQuests = questsData.map(q => ({
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
        }));
        setQuests(formattedQuests);

        const invData = {};
        inventoryItems.forEach(item => {
          let effectFn = () => {};
          if (item.name === "HP Potion") {
            effectFn = () => setHp(prev => Math.min(prev + 50, maxHp));
          } else if (item.name === "Mana Potion") {
            effectFn = () => setMana(prev => Math.min(prev + 50, maxMana));
          } else if (item.name === "1-Hour Break") {
            effectFn = () => console.log("1-hour break used");
          }
          invData[item.id] = { ...item, effect: effectFn };
        });
        setInventory(invData);

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
      const now = new Date();
      const hour = (now.getUTCHours() + 4) % 24; // timezone offset UTC+4
      const baseRate = 0.01;
      let regenRate = baseRate;
      if (hour >= 20 || hour < 6) regenRate = baseRate * 2;
      if (hp < maxHp * 0.3 || mana < maxMana * 0.3) regenRate *= 1.5;

      setHp(prev => Math.min(prev + maxHp * regenRate, maxHp));
      setMana(prev => Math.min(prev + maxMana * regenRate, maxMana));
    };

    const interval = setInterval(regenerate, 3600000);
    regenerate();
    return () => clearInterval(interval);
  }, [hp, maxHp, mana, maxMana]);

  // Check quest deadlines every minute
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date().toISOString();
      let updated = false;
      const newQuests = questsRef.current.map(q => {
        if (q.deadline && q.deadline < now && q.status !== "completed" && q.status !== "failed") {
          updated = true;
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
    db.gameState.put({
      id: 'playerState',
      level,
      xp,
      maxXP,
      coins,
      hp,
      maxHp,
      mana,
      maxMana,
    }).catch(e => console.error("Error updating player state:", e));
  }, [level, xp, maxXP, coins, hp, maxHp, mana, maxMana, loading]);

  // Auto-save quests
  useEffect(() => {
    if (loading) return;
    db.quests.bulkPut(quests).catch(e => console.error("Error updating quests:", e));
  }, [quests, loading]);

  // Auto-save inventory
  useEffect(() => {
    if (loading) return;
    db.inventory.bulkPut(Object.values(inventory)).catch(e => console.error("Error updating inventory:", e));
  }, [inventory, loading]);

  // Check if a quest can be started (dependencies & level)
  const canStartQuest = (quest) => {
    if (!quest.dependencies || quest.dependencies.length === 0) return true;
    if (quest.requiredLevel && level < quest.requiredLevel) return false;

    return quest.dependencies.every(depId => {
      const depQuest = quests.find(q => q.id === depId);
      return depQuest && depQuest.status === "completed";
    });
  };

  // Start quest with deadline handling for 24h quests
  const startQuest = async (id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    let newDeadline = quest.deadline;
    if (quest.type === "daily" && !quest.deadline && quest.is24Hour) {
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      newDeadline = deadlineDate.toISOString();
    }

    setQuests(quests.map(q =>
      q.id === id ? { ...q, status: "in_progress", deadline: newDeadline } : q
    ));
  };

  // Complete quest with resource and reward calculations
  const completeQuest = async (id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    if (quest.status === "completed" || quest.status === "failed") return;
    if (!canStartQuest(quest)) return;

    // Base reward and cost values with multipliers
    let baseXP = quest.xp || (quest.type === "main" ? 1000 : quest.type === "challenge" ? 1500 : 30);
    let baseCoins = quest.coins || (quest.type === "main" ? 500 : quest.type === "challenge" ? 750 : 50);
    let hpCost = quest.type === "main" ? 20 : quest.type === "challenge" ? 30 : 5;
    let manaCost = quest.difficulty === "hard" ? 15 : 5;

    if (quest.difficulty === "medium") {
      baseXP *= 1.1;
      baseCoins *= 1.1;
      hpCost *= 1.1;
      manaCost *= 1.1;
    }
    if (quest.difficulty === "hard") {
      baseXP *= 1.35;
      baseCoins *= 1.35;
      hpCost *= 1.35;
      manaCost *= 1.35;
    }

    // Check resources
    if (hp < hpCost || mana < manaCost) {
      console.log("Not enough HP or Mana to complete the quest");
      return;
    }

    // Deduct resources and add rewards
    let newXp = xp + Math.floor(baseXP);
    let newLevel = level;
    let newMaxXP = maxXP;

    while (newXp >= newMaxXP) {
      newXp -= newMaxXP;
      newLevel++;
      newMaxXP = Math.floor(newMaxXP * 1.18);
      setMaxHp(prev => Math.floor(prev * 1.1));
      setMaxMana(prev => Math.floor(prev * 1.1));
    }

    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins(prev => prev + Math.floor(baseCoins));
    setHp(prev => Math.max(0, prev - Math.floor(hpCost)));
    setMana(prev => Math.max(0, prev - Math.floor(manaCost)));

    // Update quest status
    if (quest.repeatable) {
      setQuests(quests.map(q => q.id === id ? { ...q, status: "not_started" } : q));
    } else {
      setQuests(quests.map(q => q.id === id ? { ...q, status: "completed" } : q));
    }
  };

  // Complete subquest logic
  const completeSubquest = async (parentId, subId) => {
    const parent = quests.find(q => q.id === parentId);
    if (!parent || !parent.subquests) return;
    const sub = parent.subquests.find(sq => sq.id === subId);
    if (!sub || sub.done) return;

    if (mana < 5) {
      console.log("Not enough Mana to complete subquest");
      return;
    }

    setCoins(prev => prev + 20);
    setMana(prev => Math.max(0, prev - 5));
    setQuests(quests.map(q => q.id === parentId ? {
      ...q,
      subquests: q.subquests.map(sq => sq.id === subId ? { ...sq, done: true } : sq)
    } : q));
  };

  // Open quest creation modal, enforcing daily quest limit
  const openQuestForm = (type) => {
    if (type === "daily" && quests.filter(q => q.type === "daily").length >= 5) {
      console.log("Daily quest limit reached (max 5)");
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
    const item = shopItems.find(i => i.id === id);
    if (!item || coins < item.cost) {
      console.log("Not enough coins or item not found");
      return;
    }

    setCoins(prev => prev - item.cost);

    // Create unique key by id + timestamp to allow multiple stacks
    const itemKey = `item_${item.id}_${Date.now()}`;

    let effectFn = () => {};
    if (item.name === "HP Potion") {
      effectFn = () => setHp(prev => Math.min(prev + 50, maxHp));
    } else if (item.name === "Mana Potion") {
      effectFn = () => setMana(prev => Math.min(prev + 50, maxMana));
    } else if (item.name === "1-Hour Break") {
      effectFn = () => console.log("1-hour break used");
    }

    const newItem = {
      id: itemKey,
      name: item.name,
      desc: item.desc,
      count: 1,
      purchasedPrice: item.cost,
      timestamp: Date.now(),
      effect: effectFn
    };

    setInventory(prev => ({ ...prev, [itemKey]: newItem }));
  };

  // Applying an item effect and adjusting inventory count
  const applyItem = async (id) => {
    const item = inventory[id];
    if (!item || item.count <= 0) {
      console.log("Item not available or insufficient quantity");
      return;
    }

    if (item.name === "HP Potion") {
      setHp(prev => Math.min(prev + 50, maxHp));
    } else if (item.name === "Mana Potion") {
      setMana(prev => Math.min(prev + 50, maxMana));
    } else if (item.name === "1-Hour Break") {
      setHp(prev => Math.min(prev + 20, maxHp));
      // Could add more break logic here
    }

    // Remove or decrement count
    const newCount = item.count - 1;
    if (newCount <= 0) {
      setInventory(prev => {
        const newInv = { ...prev };
        delete newInv[id];
        return newInv;
      });
    } else {
      setInventory(prev => ({ ...prev, [id]: { ...item, count: newCount } }));
    }
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
      console.log("Quest name not provided");
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
      priority: quests.reduce((max, q) => (q.priority > max ? q.priority : max), 0) + 1,
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
  };

  // Handling subquest confirmation from modal
  const handleSubquestConfirm = async ({ name, description }) => {
    if (!name) {
      console.log("Subquest name not provided");
      return;
    }
    const parent = quests.find(q => q.id === currentSubquestParentId);
    if (!parent) {
      console.log("Parent quest not found");
      return;
    }
    const newSubquest = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      name,
      description,
      done: false,
    };
    setQuests(
      quests.map(q =>
        q.id === currentSubquestParentId
          ? { ...q, subquests: [...(q.subquests || []), newSubquest] }
          : q
      )
    );
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);
  };

  // Render content depending on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case tabNames.notification:
        return <div className="p-4 text-gray-300">Notification content goes here.</div>;
      case tabNames.quests:
        return (
          <Quests
            quests={quests}
            openQuestForm={openQuestForm}
            openSubquestForm={openSubquestForm}
            completeQuest={completeQuest}
            completeSubquest={completeSubquest}
            startQuest={startQuest}
            canStartQuest={canStartQuest}
          />
        );
      case tabNames.achievements:
        return <div className="p-4 text-gray-300">Achievements content goes here.</div>;
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
            />
            <div className="mb-6 bg-gray-800 rounded-lg pt-2 px-1">
              {[tabNames.notification, tabNames.quests, tabNames.achievements].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      activeTab === tab
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
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