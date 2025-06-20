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
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(10);
  const [maxXP, setMaxXP] = useState(980);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mana, setMana] = useState(120);
  const [maxMana, setMaxMana] = useState(120);
  const [quests, setQuests] = useState([]);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [currentSubquestParentId, setCurrentSubquestParentId] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showSubquestModal, setShowSubquestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventory, setInventory] = useState({});
  const particlesContainerRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Quests");
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

  // Initialize state from IndexedDB
  useEffect(() => {
    const loadState = async () => {
      try {
        const [playerState, questsData, inventoryItems] = await Promise.all([
          db.gameState.get('playerState'),
          db.quests.toArray(),
          db.inventory.toArray()
        ]);

        // Load player state
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

        // Load quests
        const formattedQuests = questsData.map(quest => ({
          ...quest,
          status: quest.status || "not_started",
          dependencies: quest.dependencies || [],
          deadline: quest.deadline || null,
          subquests: quest.subquests || [],
        }));
        setQuests(formattedQuests);

        // Load inventory
        const inventoryData = {};
        inventoryItems.forEach(item => {
          let effectFn = () => {};
          if (item.name === "HP Potion") {
            effectFn = () => setHp(prev => Math.min(prev + 50, maxHp));
          } else if (item.name === "Mana Potion") {
            effectFn = () => setMana(prev => Math.min(prev + 50, maxMana));
          } else if (item.name === "1-Hour Break") {
            effectFn = () => console.log("1-hour break used");
          }
          inventoryData[item.id] = { ...item, effect: effectFn };
        });
        setInventory(inventoryData);
      } catch (error) {
        console.error("Error loading data from database:", error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const regenerate = () => {
      const now = new Date();
      const hour = now.getUTCHours() + 4;
      const baseRate = 0.01;
      let regenRate = baseRate;
      if (hour >= 20 || hour < 6) regenRate = baseRate * 2;
      if (hp < maxHp * 0.3 || mana < maxMana * 0.3) regenRate *= 1.5;
      setHp((prev) => Math.min(prev + maxHp * regenRate, maxHp));
      setMana((prev) => Math.min(prev + maxMana * regenRate, maxMana));
    };
    const interval = setInterval(regenerate, 3600000);
    regenerate();
    return () => clearInterval(interval);
  }, [hp, maxHp, mana, maxMana]);

  // Check quest deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date().toISOString();
      const prev = questsRef.current;
      let hasChanges = false;

      const updated = prev.map((q) => {
        if (q.deadline && q.deadline < now && q.status !== "completed") {
          hasChanges = true;
          return { ...q, status: "failed" };
        }
        return q;
      });

      if (hasChanges) {
        setQuests(updated);
      }
    };

    const interval = setInterval(checkDeadlines, 60000);
    checkDeadlines();
    return () => clearInterval(interval);
  }, []);

  // Initialize particles.js after loading and when container is ready
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
  }, [loading, particlesContainerRef]);

  // Auto-update player state to IndexedDB
  useEffect(() => {
    const updatePlayerState = async () => {
      try {
        await db.gameState.put({
          id: 'playerState',
          level,
          xp,
          maxXP,
          coins,
          hp,
          maxHp,
          mana,
          maxMana,
        });
      } catch (error) {
        console.error("Error updating player state:", error);
      }
    };
    if (!loading) updatePlayerState();
  }, [level, xp, maxXP, coins, hp, maxHp, mana, maxMana, loading]);

  // Auto-update quests to IndexedDB
  useEffect(() => {
    const updateQuests = async () => {
      try {
        await db.quests.bulkPut(quests);
      } catch (error) {
        console.error("Error updating quests:", error);
      }
    };
    if (!loading) updateQuests();
  }, [quests, loading]);

  // Auto-update inventory to IndexedDB
  useEffect(() => {
    const updateInventory = async () => {
      try {
        const items = Object.values(inventory);
        await db.inventory.bulkPut(items);
      } catch (error) {
        console.error("Error updating inventory:", error);
      }
    };
    if (!loading) updateInventory();
  }, [inventory, loading]);

  // Check if quest can be started based on dependencies
  const canStartQuest = (quest) => {
    if (!quest.dependencies || quest.dependencies.length === 0) return true;
    return quest.dependencies.every((depId) => {
      const depQuest = quests.find((q) => q.id === depId);
      return depQuest && depQuest.status === "completed";
    });
  };

  // Start Quest
  const startQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.status !== "not_started" || !canStartQuest(quest))
      return;
    setQuests(
      quests.map((q) => (q.id === id ? { ...q, status: "in_progress" } : q))
    );
  };

  // Complete Quest
  const completeQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (
      !quest ||
      quest.status === "completed" ||
      quest.status === "failed" ||
      !canStartQuest(quest)
    )
      return;

    let baseXP =
      quest.type === "main" ? 1000 : quest.type === "challenge" ? 1500 : 30;
    let baseCoins =
      quest.type === "main" ? 500 : quest.type === "challenge" ? 750 : 50;
    let hpCost =
      quest.type === "main" ? 20 : quest.type === "challenge" ? 30 : 5;
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

    if (hp < hpCost || mana < manaCost) {
      console.log("Not enough resources (HP or Mana)");
      return;
    }

    let newXp = xp + baseXP;
    let newLevel = level;
    let newMaxXP = maxXP;
    while (newXp >= newMaxXP) {
      newXp -= newMaxXP;
      newLevel += 1;
      newMaxXP = Math.floor(newMaxXP * 1.18);
      setMaxHp((prev) => Math.floor(prev * 1.1));
      setMaxMana((prev) => Math.floor(prev * 1.1));
    }
    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins(coins + baseCoins);
    setHp(Math.max(0, hp - hpCost));
    setMana(Math.max(0, mana - manaCost));

    if (quest.type === "repeatable") {
      setQuests(
        quests.map((q) => (q.id === id ? { ...q, status: "not_started" } : q))
      );
    } else {
      setQuests(
        quests.map((q) => (q.id === id ? { ...q, status: "completed" } : q))
      );
    }
  };

  // Complete Subquest
  const completeSubquest = async (parentId, subId) => {
    const parent = quests.find((q) => q.id === parentId);
    if (!parent || !parent.subquests) return;
    const sub = parent.subquests.find((sq) => sq.id === subId);
    if (!sub || sub.done) return;

    if (mana < 5) {
      console.log("Not enough resources (Mana)");
      return;
    }

    setCoins(coins + 20);
    setMana(Math.max(0, mana - 5));
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
  };

  // Open Quest Form
  const openQuestForm = (type) => {
    console.log("Opening quest form with type:", type);
    if (
      type === "daily" &&
      quests.filter((q) => q.type === "daily").length >= 5
    ) {
      console.log("Daily quest limit reached (max 5)");
      return;
    }
    setCurrentQuestType(type);
    setShowQuestModal(true);
  };

  // Open Subquest Form
  const openSubquestForm = (parentId) => {
    console.log("Opening subquest form for parentId:", parentId);
    setCurrentSubquestParentId(parentId);
    setShowSubquestModal(true);
  };

  // Buy Item
  const buyItem = async (id) => {
    const item = shopItems.find((i) => i.id === id);
    if (!item || coins < item.cost) {
      console.log("Not enough coins or item not found");
      return;
    }

    setCoins(coins - item.cost);

    const itemKey = `item_${item.id}`;
    const existingItem = inventory[itemKey];
    const newCount = existingItem ? existingItem.count + 1 : 1;
    
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
      count: newCount,
      purchasedPrice: item.cost,
      timestamp: Date.now(),
      effect: effectFn
    };

    setInventory(prev => ({ ...prev, [itemKey]: newItem }));
  };

  // Apply Item
  const applyItem = async (id) => {
    const item = inventory[id];
    if (!item || item.count <= 0) {
      console.log("Item not available or not enough quantity");
      return;
    }

    if (item.name === "HP Potion") {
      setHp((prev) => Math.min(prev + 50, maxHp));
    } else if (item.name === "Mana Potion") {
      setMana((prev) => Math.min(prev + 50, maxMana));
    } else if (item.name === "1-Hour Break") {
      setHp((prev) => Math.min(prev + 20, maxHp));
    }

    const newCount = item.count - 1;
    if (newCount <= 0) {
      setInventory(prev => {
        const newInventory = { ...prev };
        delete newInventory[id];
        return newInventory;
      });
    } else {
      setInventory(prev => ({
        ...prev,
        [id]: { ...item, count: newCount }
      }));
    }
  };

  // Subquest Modal Confirmation
  const handleSubquestConfirm = async ({ name, description }) => {
    if (!name) {
      console.log("Subquest name not provided");
      return;
    }
    const parent = quests.find((q) => q.id === currentSubquestParentId);
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
      quests.map((q) =>
        q.id === currentSubquestParentId
          ? { ...q, subquests: [...(q.subquests || []), newSubquest] }
          : q
      )
    );
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case tabNames.notification:
        return (
          <div className="p-4 text-gray-300">
            Notification content goes here.
          </div>
        );
      case tabNames.quests:
        return (
          <Quests
            quests={quests}
            openQuestForm={openQuestForm}
            openSubquestForm={openSubquestForm}
            completeQuest={completeQuest}
            completeSubquest={completeSubquest}
            startQuest={startQuest}
          />
        );
      case tabNames.achievements:
        return (
          <div className="p-4 text-gray-300">
            Achievements content goes here.
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
      ></div>
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

              {/* Loading Text */}
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
              {[
                tabNames.notification,
                tabNames.quests,
                tabNames.achievements,
              ].map((tab) => (
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
              onQuestConfirm={async ({
                name,
                description,
                difficulty,
                type,
                deadline,
                dependencies,
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
                  priority:
                    quests.reduce(
                      (max, q) => (q.priority > max ? q.priority : max),
                      0
                    ) + 1,
                  deadline: deadline || null,
                  dependencies: dependencies || [],
                  repeatable: type === "repeatable",
                };
                setQuests([...quests, newQuest]);
                setShowQuestModal(false);
              }}
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