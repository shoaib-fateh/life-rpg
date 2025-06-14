import { useState, useEffect, useRef } from 'react';
import Particles from 'particles.js';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';
import QuestModal from './QuestModal';
import SubquestModal from './SubquestModal';
import ShopModal from './ShopModal';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

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
  const xpChartRef = useRef(null);
  const hpChartRef = useRef(null);
  const manaChartRef = useRef(null);

  const shopItems = [
    { id: 1, name: 'HP Potion', desc: 'Restores 50 HP', cost: 100 },
    { id: 2, name: 'Mana Potion', desc: 'Restores 50 Mana', cost: 100 },
    { id: 3, name: '1-Hour Break', desc: 'Take a 1-hour break', cost: 500 },
  ];

  // Initialize state from Firebase
  useEffect(() => {
    const loadState = async () => {
      const stateDoc = doc(db, 'gameState', 'playerState');
      const docSnap = await getDoc(stateDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLevel(data.level || 1);
        setXp(data.xp || 0);
        setMaxXP(data.maxXP || 980);
        setCoins(data.coins || 0);
        setHp(data.hp || 100);
        setMaxHp(data.maxHp || 100);
        setMana(data.mana || 100);
        setMaxMana(data.maxMana || 120);
      } else {
        await setDoc(stateDoc, {
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
    };
    loadState();

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

    // Initialize Firebase quests collection if it doesn't exist
    const initializeQuests = async () => {
      const questsCollection = collection(db, 'quests');
      const querySnapshot = await getDocs(questsCollection);
      if (querySnapshot.empty) {
        await setDoc(doc(db, 'quests', 'initial'), { placeholder: true });
        await deleteDoc(doc(db, 'quests', 'initial')); // Clean up placeholder
      }
      const questsData = await getDocs(questsCollection);
      setQuests(questsData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    initializeQuests();

    // Cleanup charts on unmount
    return () => {
      if (xpChartRef.current) xpChartRef.current.destroy();
      if (hpChartRef.current) hpChartRef.current.destroy();
      if (manaChartRef.current) manaChartRef.current.destroy();
    };
  }, []);

  // Save state to Firebase
  const saveState = async () => {
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
  };

  // Update UI in Firebase with document existence check
  const updateUI = async () => {
    try {
      await Promise.all(
        quests.map(async quest => {
          const questDocRef = doc(db, 'quests', quest.id);
          const questDocSnap = await getDoc(questDocRef);
          if (questDocSnap.exists()) {
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
      await saveState();
    } catch (error) {
      console.error("خطا در آپدیت دیتابیس Firebase:", error);
    }
  };

  // Render Quests
  const renderQuests = () => {
    const dailyQuests = quests.filter(q => q.type === 'daily');
    if (dailyQuests.length > 5) {
      // In-app notification logic to be added later
      return;
    }

    return ['daily', 'main'].map(type => (
      <div key={type}>
        <h2 className="text-lg font-bold mb-2">{type === 'daily' ? 'Daily Quests' : 'Main Quests'}</h2>
        <ul className="space-y-2">
          {quests
            .filter(q => q.type === type)
            .sort((a, b) => a.priority - b.priority)
            .map(q => (
              <li key={q.id} className={`quest-item ${q.done ? 'done' : ''}`}>
                <div>
                  <div>
                    <strong>{q.name}</strong> [{q.difficulty}]
                  </div>
                  <div className="text-gray-400 text-xs">{q.description || ''}</div>
                  {q.subquests?.length > 0 && (
                    <div className="subquests-list">
                      {q.subquests.map(sq => (
                        <div key={sq.id} className={`subquest-item ${sq.done ? 'done' : ''}`}>
                          <div>
                            <strong>{sq.name}</strong> - {sq.description || ''}
                          </div>
                          {!sq.done && (
                            <button onClick={() => completeSubquest(q.id, sq.id)} className="btn-small">
                              ✔
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {!q.done && (
                    <button onClick={() => completeQuest(q.id)} className="btn-small">
                      ✔
                    </button>
                  )}
                  {!q.done && type === 'main' && (
                    <button onClick={() => openSubquestForm(q.id)} className="btn-small">
                      +Subquest
                    </button>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    ));
  };

  // Complete Quest
  const completeQuest = async id => {
    const quest = quests.find(q => q.id === id);
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
      setMaxHp(prev => Math.floor(prev * 1.10)); // 10% boost to max HP
      setMaxMana(prev => Math.floor(prev * 1.10)); // 10% boost to max Mana
    }
    setLevel(newLevel);
    setXp(newXp);
    setMaxXP(newMaxXP);
    setCoins(coins + baseCoins);
    setHp(Math.max(0, hp - hpCost));
    setMana(Math.max(0, mana - manaCost));
    setQuests(quests.map(q => (q.id === id ? { ...q, done: true } : q)));
    await updateUI();
  };

  // Complete Subquest
  const completeSubquest = async (parentId, subId) => {
    const parent = quests.find(q => q.id === parentId);
    if (!parent || !parent.subquests) return;
    const sub = parent.subquests.find(sq => sq.id === subId);
    if (!sub || sub.done) return;

    if (mana < 5) {
      // In-app notification logic to be added later
      return;
    }

    setCoins(coins + 20);
    setMana(Math.max(0, mana - 5));
    setQuests(
      quests.map(q =>
        q.id === parentId
          ? { ...q, subquests: q.subquests.map(sq => (sq.id === subId ? { ...sq, done: true } : sq)) }
          : q
      )
    );
    await updateUI();
  };

  // Open Quest Form
  const openQuestForm = type => {
    if (type === 'daily' && quests.filter(q => q.type === 'daily').length >= 5) {
      // In-app notification logic to be added later
      return;
    }
    setCurrentQuestType(type);
    setShowQuestModal(true);
  };

  // Open Subquest Form
  const openSubquestForm = parentId => {
    setCurrentSubquestParentId(parentId);
    setShowSubquestModal(true);
  };

  // Subquest Modal Confirmation
  const handleSubquestConfirm = async ({ name, description }) => {
    if (!name) {
      // In-app notification logic to be added later
      return;
    }
    const parent = quests.find(q => q.id === currentSubquestParentId);
    if (!parent) return;
    const newSubquest = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      name,
      description,
      done: false,
    };
    setQuests(
      quests.map(q =>
        q.id === currentSubquestParentId ? { ...q, subquests: [...(q.subquests || []), newSubquest] } : q
      )
    );
    setShowSubquestModal(false);
    setCurrentSubquestParentId(null);
    await updateUI();
  };

  // Chart Data
  const xpChartData = {
    labels: ['XP'],
    datasets: [
      {
        label: 'XP',
        data: [xp],
        backgroundColor: ['#5a5af0'],
        borderColor: ['#5a5af0'],
        borderWidth: 1,
      },
    ],
  };

  const hpChartData = {
    labels: ['HP'],
    datasets: [
      {
        label: 'HP',
        data: [hp],
        backgroundColor: ['#ff4d4d'],
        borderColor: ['#ff4d4d'],
        borderWidth: 1,
      },
    ],
  };

  const manaChartData = {
    labels: ['Mana'],
    datasets: [
      {
        label: 'Mana',
        data: [mana],
        backgroundColor: ['#8a2be2'], // Purple color for Mana
        borderColor: ['#8a2be2'],
        borderWidth: 1,
      },
    ],
  };

  // Progress Bars
  const progressBarStyle = (value, max) => ({
    width: `${(value / max) * 100}%`,
    height: '20px',
    backgroundColor: value === max ? '#00ff00' : (value < max * 0.3 ? '#ff0000' : '#ffff00'),
    borderRadius: '5px',
    transition: 'width 0.3s ease-in-out',
  });

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div id="particles-js" className="absolute inset-0 z-0"></div>
      <div className="container mx-auto p-4 max-w-2xl relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-400">🧠 Void</h1>
              <p>
                Level: {level} • 🪙{coins}
              </p>
              <div className="flex space-x-4 mt-2">
                <div>
                  <span className="mr-2">HP</span>
                  <div className="w-32 bg-gray-700 h-2 rounded overflow-hidden">
                    <div
                      className="bg-red-500 h-2 rounded transition-all duration-300"
                      style={progressBarStyle(hp, maxHp)}
                    ></div>
                  </div>
                </div>
                <div>
                  <span className="mr-2">MA</span>
                  <div className="w-32 bg-gray-700 h-2 rounded overflow-hidden">
                    <div
                      className="bg-purple-700 h-2 rounded transition-all duration-300"
                      style={progressBarStyle(mana, maxMana)}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded transition-all duration-300"
                  style={progressBarStyle(xp, maxXP)}
                ></div>
              </div>
            </div>
            <button
              onClick={() => setShowShopModal(level >= 8 ? () => setShowShopModal(true) : null)}
              className={`bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-500 transition ${
                level < 8 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={level < 8}
            >
              🛒 Store
            </button>
          </div>
        </header>

        {/* Quests */}
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
          <button
            onClick={() => openQuestForm('daily')}
            className="bg-purple-500 px-4 py-2 rounded mb-4 hover:bg-purple-400 transition"
          >
            ➕ New Quest
          </button>
          {renderQuests()}
        </div>

        {/* Charts */}
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 shadow-lg flex space-x-4">
          <div className="w-1/3">
            <Bar
              ref={xpChartRef}
              data={xpChartData}
              options={{
                scales: { y: { beginAtZero: true, max: maxXP } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="w-1/3">
            <Bar
              ref={hpChartRef}
              data={hpChartData}
              options={{
                scales: { y: { beginAtZero: true, max: maxHp } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="w-1/3">
            <Bar
              ref={manaChartRef}
              data={manaChartData}
              options={{
                scales: { y: { beginAtZero: true, max: maxMana } },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Modals */}
        <QuestModal
          show={showQuestModal}
          onClose={() => setShowQuestModal(false)}
          type={currentQuestType}
          onConfirm={async ({ name, description, difficulty, type }) => {
            if (!name) {
              // In-app notification logic to be added later
              return;
            }
            const maxPriority = quests.reduce((max, q) => (q.priority > max ? q.priority : max), 0);
            const newQuest = {
              id: Date.now().toString() + Math.random().toString(16).slice(2),
              name,
              description,
              difficulty,
              type,
              done: false,
              subquests: [],
              priority: maxPriority + 1,
            };
            await addDoc(collection(db, 'quests'), newQuest);
            setQuests([...quests, newQuest]);
            setShowQuestModal(false);
            await updateUI();
          }}
        />
        <SubquestModal
          show={showSubquestModal}
          onClose={() => setShowSubquestModal(false)}
          onConfirm={handleSubquestConfirm}
        />
        <ShopModal
          show={showShopModal}
          onClose={() => setShowShopModal(false)}
          items={shopItems}
          coins={coins}
          onBuy={async id => {
            const item = shopItems.find(i => i.id === id);
            if (!item || coins < item.cost) {
              // In-app notification logic to be added later
              return;
            }
            setCoins(coins - item.cost);
            if (item.name.includes('HP')) setHp(Math.min(hp + 50, maxHp));
            if (item.name.includes('Mana')) setMana(Math.min(mana + 50, maxMana));
            await updateUI();
          }}
        />
      </div>
    </div>
  );
};

export default App;