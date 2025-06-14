// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import Particles from 'particles.js';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
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
  const [nextXP, setNextXP] = useState(560);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [mana, setMana] = useState(100);
  const [quests, setQuests] = useState([]);
  const [currentQuestType, setCurrentQuestType] = useState('daily');
  const [currentSubquestParentId, setCurrentSubquestParentId] = useState(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showSubquestModal, setShowSubquestModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const chartRef = useRef(null); // Reference to store chart instance

  const shopItems = [
    { id: 1, name: 'معجون HP', desc: 'بازگرداندن 50 HP', cost: 100 },
    { id: 2, name: 'معجون Mana', desc: 'بازگرداندن 50 Mana', cost: 100 },
    { id: 3, name: 'استراحت ۱ ساعته', desc: 'یک ساعت استراحت', cost: 500 },
  ];

  // Initialize Particles.js
  useEffect(() => {
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

    // Load quests from Firestore
    const fetchQuests = async () => {
      const querySnapshot = await getDocs(collection(db, 'quests'));
      const questsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuests(questsData);
    };
    fetchQuests();

    // Cleanup chart on component unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  // Update UI
  const updateUI = async () => {
    // Save to Firestore
    await Promise.all(
      quests.map(quest =>
        updateDoc(doc(db, 'quests', quest.id), {
          name: quest.name,
          description: quest.description,
          difficulty: quest.difficulty,
          type: quest.type,
          done: quest.done,
          subquests: quest.subquests,
          priority: quest.priority,
        })
      )
    );
  };

  // Render Quests
  const renderQuests = () => {
    const dailyQuests = quests.filter(q => q.type === 'daily');
    if (dailyQuests.length > 5) {
      alert('حداکثر ۵ کوئست روزانه مجاز است.');
      return;
    }

    return ['daily', 'main'].map(type => (
      <div key={type}>
        <h2 className="text-lg font-bold mb-2">{type === 'daily' ? 'کوئست‌های روزانه' : 'کوئست‌های اصلی'}</h2>
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
                      +ساب‌کوئست
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
      alert('HP یا Mana کافی نیست!');
      return;
    }

    setXp(prev => {
      let newXp = prev + baseXP;
      let newLevel = level;
      let newNextXP = nextXP;
      while (newXp >= newNextXP) {
        newXp -= newNextXP;
        newLevel++;
        newNextXP = Math.floor(newNextXP * 1.18);
        setHp(prev => prev + 5); // Increase max HP per level
        setMana(prev => prev + 5); // Increase max Mana per level
      }
      setLevel(newLevel);
      setNextXP(newNextXP);
      return newXp;
    });
    setCoins(coins + baseCoins);
    setHp(hp - hpCost);
    setMana(mana - manaCost);
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
      alert('Mana کافی نیست!');
      return;
    }

    setCoins(coins + 20);
    setMana(mana - 5);
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
      alert('حداکثر ۵ کوئست روزانه مجاز است.');
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

  // Chart Data
  const chartData = {
    labels: ['XP', 'HP', 'Mana'],
    datasets: [
      {
        label: 'وضعیت',
        data: [xp, hp, mana],
        backgroundColor: ['#5a5af0', '#ff4d4d', '#4da8ff'],
        borderColor: ['#5a5af0', '#ff4d4d', '#4da8ff'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div id="particles-js" className="absolute inset-0 z-0"></div>
      <div className="container mx-auto p-4 max-w-2xl relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-400">🧠 Life-RPG</h1>
              <p>
                سطح: <span>{level}</span> | سکه‌ها: <span>{coins}</span> | HP: <span>{hp}</span> | Mana: <span>{mana}</span>
              </p>
              <div className="w-full bg-gray-700 h-2 rounded mt-2">
                <div
                  className="bg-purple-500 h-2 rounded transition-all duration-300"
                  style={{ width: `${Math.min((xp / nextXP) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            <button
              onClick={() => setShowShopModal(true)}
              className="bg-yellow-600 px-3 py-1 rounded text-sm hover:bg-yellow-500 transition"
            >
              🛒 فروشگاه
            </button>
          </div>
        </header>

        {/* Quests */}
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 mb-6 shadow-lg">
          <button
            onClick={() => openQuestForm('daily')}
            className="bg-purple-500 px-4 py-2 rounded mb-4 hover:bg-purple-400 transition"
          >
            �[. . .] کوئست جدید
          </button>
          {renderQuests()}
        </div>

        {/* Chart */}
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 shadow-lg">
          <Bar
            data={chartData}
            options={{
              scales: { y: { beginAtZero: true, max: Math.max(nextXP, hp, mana) } },
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        {/* Modals */}
        <QuestModal
          show={showQuestModal}
          onClose={() => setShowQuestModal(false)}
          type={currentQuestType}
          onConfirm={async ({ name, description, difficulty, type }) => {
            if (!name) {
              alert('نام کوئست الزامی است.');
              return;
            }
            const maxPriority = quests.reduce((max, q) => q.priority > max ? q.priority : max, 0);
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
          onConfirm={async ({ name, description }) => {
            if (!name) {
              alert('نام ساب‌کوئست الزامی است.');
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
                q.id === currentSubquestParentId ? { ...q, subquests: [...q.subquests, newSubquest] } : q
              )
            );
            setShowSubquestModal(false);
            setCurrentSubquestParentId(null);
            await updateUI();
          }}
        />
        <ShopModal
          show={showShopModal}
          onClose={() => setShowShopModal(false)}
          items={shopItems}
          coins={coins}
          onBuy={async id => {
            const item = shopItems.find(i => i.id === id);
            if (!item || coins < item.cost) {
              alert('سکه کافی نیست!');
              return;
            }
            setCoins(coins - item.cost);
            if (item.name.includes('HP')) setHp(Math.min(hp + 50, 100 + (level - 1) * 5));
            if (item.name.includes('Mana')) setMana(Math.min(mana + 50, 100 + (level - 1) * 5));
            alert(`خریداری شد: ${item.name}`);
            await updateUI();
          }}
        />
      </div>
    </div>
  );
};

export default App;