import { useState, useEffect, useRef } from 'react';
import Particles from 'particles.js';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Header from './Header';
import Quests from './Quests';
import Charts from './Charts';
import Modals from './Modals';

const App = () => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [maxXP, setMaxXP] = useState(980);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mana, setMana] = useState(120);
  const [maxMana, setMaxMana] = useState(120);
  const [quests, setQuests] = useState([]);
  const [currentQuestType, setCurrentQuestType] = useState('daily');
  const [currentSubquestParentId, setCurrentSubquestParentId] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showSubquestModal, setShowSubquestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventory, setInventory] = useState({});
  const particlesContainerRef = useRef(null);

  const shopItems = [
    { id: 1, name: 'HP Potion', desc: 'Restores 50 HP', cost: 100 },
    { id: 2, name: 'Mana Potion', desc: 'Restores 50 Mana', cost: 100 },
    { id: 3, name: '1-Hour Break', desc: 'Take a 1-hour break', cost: 500 },
  ];

  // Initialize state from Firebase
  useEffect(() => {
    const loadState = async () => {
      try {
        const [stateDocSnap, questsSnapshot] = await Promise.all([
          getDoc(doc(db, 'gameState', 'playerState')),
          getDocs(collection(db, 'quests')),
        ]);

        // Load player state
        if (stateDocSnap.exists()) {
          const data = stateDocSnap.data();
          setLevel(data.level || 1);
          setXp(data.xp || 0);
          setMaxXP(data.maxXP || 980);
          setCoins(data.coins || 0);
          setHp(data.hp || 100);
          setMaxHp(data.maxHp || 100);
          setMana(data.mana || 100);
          setMaxMana(data.maxMana || 120);
        } else {
          await setDoc(doc(db, 'gameState', 'playerState'), {
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
        const questsData = questsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuests(questsData);
      } catch (error) {
        console.error("خطا در لود داده‌ها از دیتابیس:", error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  // Initialize particles.js after loading and when container is ready
  useEffect(() => {
    if (!loading && particlesContainerRef.current) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#5a5af0' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: '#5a5af0', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false },
        },
        interactivity: {
          detect_on: 'canvas',
          events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 } },
        },
        retina_detect: true,
      });
    }
  }, [loading, particlesContainerRef]);

  // Auto-update player state to Firebase
  useEffect(() => {
    const updatePlayerState = async () => {
      try {
        const stateDoc = doc(db, 'gameState', 'playerState');
        await updateDoc(stateDoc, {
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
        console.error("خطا در آپدیت وضعیت بازیکن:", error);
      }
    };
    if (!loading) updatePlayerState();
  }, [level, xp, maxXP, coins, hp, maxHp, mana, maxMana, loading]);

  // Auto-update quests to Firebase
  useEffect(() => {
    const updateQuests = async () => {
      try {
        await Promise.all(
          quests.map(async (quest) => {
            const questDocRef = doc(db, 'quests', quest.id);
            const questSnap = await getDoc(questDocRef);
            if (questSnap.exists()) {
              await updateDoc(questDocRef, {
                name: quest.name,
                description: quest.description,
                difficulty: quest.difficulty,
                type: quest.type,
                done: quest.done,
                subquests: quest.subquests || [],
                priority: quest.priority,
              });
            } else {
              await setDoc(questDocRef, {
                name: quest.name,
                description: quest.description,
                difficulty: quest.difficulty,
                type: quest.type,
                done: quest.done,
                subquests: quest.subquests || [],
                priority: quest.priority,
              });
            }
          })
        );
      } catch (error) {
        console.error("خطا در آپدیت کوئست‌ها:", error);
      }
    };
    if (!loading) updateQuests();
  }, [quests, loading]);

  // Auto-update inventory to Firebase
  useEffect(() => {
    const updateInventory = async () => {
      try {
        await Promise.all(
          Object.entries(inventory).map(async ([id, item]) => {
            const inventoryDocRef = doc(db, 'inventory', id);
            const inventorySnap = await getDoc(inventoryDocRef);
            if (inventorySnap.exists()) {
              await updateDoc(inventoryDocRef, {
                name: item.name,
                desc: item.desc,
                count: item.count,
                purchasedPrice: item.purchasedPrice,
                timestamp: item.timestamp,
              });
            } else {
              await setDoc(inventoryDocRef, {
                name: item.name,
                desc: item.desc,
                count: item.count,
                purchasedPrice: item.purchasedPrice,
                timestamp: item.timestamp,
              });
            }
          })
        );
      } catch (error) {
        console.error("خطا در آپدیت انبار:", error);
      }
    };
    if (!loading) updateInventory();
  }, [inventory, loading]);

  // Load inventory from Firebase
  useEffect(() => {
    const loadInventory = async () => {
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const data = {};
      inventorySnapshot.forEach(docSnap => {
        const raw = docSnap.data();
        const id = docSnap.id;

        let effectFn = () => { };
        if (raw.name === 'HP Potion') {
          effectFn = () => setHp(prev => Math.min(prev + 50, maxHp));
        } else if (raw.name === 'Mana Potion') {
          effectFn = () => setMana(prev => Math.min(prev + 50, maxMana));
        } else if (raw.name === '1-Hour Break') {
          effectFn = () => console.log("1-hour break used (implement logic here)");
        }

        data[id] = { ...raw, effect: effectFn };
      });
      setInventory(data);
      setLoading(false);
    };
    loadInventory();
  }, []);

  // Complete Quest
  const completeQuest = async (id) => {
    const quest = quests.find((q) => q.id === id);
    if (!quest || quest.done) return;

    let baseXP = quest.type === 'main' ? 1000 : 30;
    let baseCoins = quest.type === 'main' ? 500 : 50;
    let hpCost = quest.type === 'main' ? 20 : 5;
    let manaCost = quest.difficulty === 'hard' ? 15 : 5;
    if (quest.difficulty === 'medium') {
      baseXP *= 1.1;
      baseCoins *= 1.1;
      hpCost *= 1.1;
      manaCost *= 1.1;
    }
    if (quest.difficulty === 'hard') {
      baseXP *= 1.35;
      baseCoins *= 1.35;
      hpCost *= 1.35;
      manaCost *= 1.35;
    }

    if (hp < hpCost || mana < manaCost) {
      // In-app notification logic to be added later
      return;
    }

    let newXp = xp + baseXP;
    let newLevel = level;
    let newMaxXP = maxXP;
    while (newXp >= newMaxXP) {
      newXp -= newMaxXP;
      newLevel += 1;
      newMaxXP = Math.floor(newMaxXP * 1.18);
      setMaxHp((prev) => Math.floor(prev * 1.10));
      setMaxMana((prev) => Math.floor(prev * 1.10));
    }
    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins(coins + baseCoins);
    setHp(Math.max(0, hp - hpCost));
    setMana(Math.max(0, mana - manaCost));
    setQuests(quests.map((q) => (q.id === id ? { ...q, done: true } : q)));
  };

  // Complete Subquest
  const completeSubquest = async (parentId, subId) => {
    const parent = quests.find((q) => q.id === parentId);
    if (!parent || !parent.subquests) return;
    const sub = parent.subquests.find((sq) => sq.id === subId);
    if (!sub || sub.done) return;

    if (mana < 5) {
      // In-app notification logic to be added later
      return;
    }

    setCoins(coins + 20);
    setMana(Math.max(0, mana - 5));
    setQuests(
      quests.map((q) =>
        q.id === parentId
          ? { ...q, subquests: q.subquests.map((sq) => (sq.id === subId ? { ...sq, done: true } : sq)) }
          : q
      )
    );
  };

  // Open Quest Form
  const openQuestForm = (type) => {
    if (type === 'daily' && quests.filter((q) => q.type === 'daily').length >= 5) {
      // In-app notification logic to be added later
      return;
    }
    setCurrentQuestType(type);
    setShowQuestModal(true);
  };

  // Open Subquest Form
  const openSubquestForm = (parentId) => {
    setCurrentSubquestParentId(parentId);
    setShowSubquestModal(true);
  };

  // Buy Item
  const buyItem = async (id) => {
    const item = shopItems.find(i => i.id === id);
    if (!item || coins < item.cost) return;

    setCoins(coins - item.cost);

    const itemKey = `item_${item.id}`;
    const inventoryDocRef = doc(db, 'inventory', itemKey);
    const inventorySnap = await getDoc(inventoryDocRef);

    if (inventorySnap.exists()) {
      const currentItem = inventory[itemKey] || { count: 0 };
      const newCount = currentItem.count + 1;
      const updatedItem = {
        name: item.name,
        desc: item.desc,
        count: newCount,
        purchasedPrice: item.cost,
        timestamp: Date.now(),
        effect: item.effect || (() => { })
      };
      setInventory(prev => ({ ...prev, [itemKey]: updatedItem }));
      await updateDoc(inventoryDocRef, { count: newCount });
    } else {
      const newItem = {
        name: item.name,
        desc: item.desc,
        count: 1,
        purchasedPrice: item.cost,
        timestamp: Date.now(),
        effect: item.effect || (() => { })
      };
      const itemToSave = { ...newItem };
      delete itemToSave.effect;
      setInventory(prev => ({ ...prev, [itemKey]: newItem }));
      await setDoc(inventoryDocRef, itemToSave);
    }
  };

  // Apply Item
  const applyItem = async (id) => {
    const item = inventory[id];
    if (!item || item.count <= 0) return;

    if (item.name === 'HP Potion') {
      setHp(prev => Math.min(prev + 50, maxHp));
    } else if (item.name === 'Mana Potion') {
      setMana(prev => Math.min(prev + 50, maxMana));
    } else if (item.name === '1-Hour Break') {
      setHp(prev => Math.min(prev + 20, maxHp));
    }

    const newCount = item.count - 1;
    const inventoryDocRef = doc(db, 'inventory', id);
    setInventory(prev => {
      const newInventory = { ...prev };
      if (newCount <= 0) {
        delete newInventory[id];
        deleteDoc(inventoryDocRef);
      } else {
        newInventory[id] = { ...item, count: newCount };
        updateDoc(inventoryDocRef, { count: newCount });
      }
      return newInventory;
    });
  };

  // Subquest Modal Confirmation
  const handleSubquestConfirm = async ({ name, description }) => {
    if (!name) {
      // In-app notification logic to be added later
      return;
    }
    const parent = quests.find((q) => q.id === currentSubquestParentId);
    if (!parent) return;
    const newSubquest = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      name,
      description,
      done: false,
    };
    setQuests(
      quests.map((q) =>
        q.id === currentSubquestParentId ? { ...q, subquests: [...(q.subquests || []), newSubquest] } : q
      )
    );
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div ref={particlesContainerRef} id="particles-js" className="absolute inset-0 z-0"></div>
      <div className="container mx-auto p-4 max-w-2xl relative z-10">
        {loading ? (
          <div className="text-white text-center">در حال بارگذاری...</div>
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
            <Quests
              quests={quests}
              openQuestForm={openQuestForm}
              openSubquestForm={openSubquestForm}
              completeQuest={completeQuest}
              completeSubquest={completeSubquest}
            />
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
              onQuestConfirm={async ({ name, description, difficulty, type }) => {
                if (!name) return;
                const newQuestRef = await addDoc(collection(db, 'quests'), {
                  name,
                  description,
                  difficulty,
                  type,
                  done: false,
                  subquests: [],
                  priority: quests.reduce((max, q) => (q.priority > max ? q.priority : max), 0) + 1,
                });
                const newQuest = {
                  id: newQuestRef.id,
                  name,
                  description,
                  difficulty,
                  type,
                  done: false,
                  subquests: [],
                  priority: quests.reduce((max, q) => (q.priority > max ? q.priority : max), 0) + 1,
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
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;