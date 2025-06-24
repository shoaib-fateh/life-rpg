import React, { useState, useEffect, useCallback, useRef } from "react";
import Dexie from "dexie";
import CustomButton from "./CustomButton";
import Modals from "./Modals";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { gsap } from "gsap";

// Initialize Dexie DB
const db = new Dexie("life_rpg");
db.version(1).stores({
  gameState: "id",
  quests: "id",
});

// --- CountdownTimer Component ---
const CountdownTimer = ({
  deadline,
  onExpire,
  onWarning,
  addNotification,
  questName,
  warningSent,
  onWarningSent,
}) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(deadline) - Date.now();
    return diff > 0 ? diff : 0;
  });
  const [warned, setWarned] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    if (!warned && !warningSent && timeLeft <= 4 * 60 * 60 * 1000) {
      setWarned(true);
      onWarning();
      addNotification(
        `Only 4 hours left to complete "${questName}"!`,
        "warning"
      );
      onWarningSent();
    }

    timerRef.current = setInterval(() => {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timerRef.current);
        onExpire();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    timeLeft,
    deadline,
    onExpire,
    onWarning,
    warned,
    addNotification,
    questName,
    warningSent,
    onWarningSent,
  ]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  };

  return (
    <span className="font-mono text-red-400 drop-shadow-glow">
      {formatTime(timeLeft)}
    </span>
  );
};

// --- InfoPopup Component ---
const InfoPopup = ({ message, onClose }) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    
    gsap.from(popupRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    const timeout = setTimeout(onClose, 6000);
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div 
      ref={popupRef}
      className="fixed bottom-5 right-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-5 py-3 rounded-xl shadow-2xl z-50 max-w-xs border-2 border-white/20"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl mr-2">⚠️</span>
          <div>
            <strong className="text-black">Warning: </strong> 
            <span className="text-gray-900">{message}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 font-bold hover:text-red-700 transition"
          aria-label="Close notification"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

// --- Main Quests Component ---
const Quests = ({
  quests,
  setQuests,
  openQuestForm,
  openSubquestForm,
  completeQuest,
  completeSubquest,
  startQuest,
  canStartQuest,
  addNotification,
  userLevel,
}) => {
  const [now, setNow] = useState(new Date());
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [editingQuest, setEditingQuest] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("everyDay");
  const questsContainerRef = useRef(null);
  
  const timerRefs = useRef({});

  // Calculate time until daily reset
  const calculateTimeUntilReset = useCallback(() => {
    const resetTime = new Date();
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    return resetTime.getTime() - Date.now();
  }, []);

  const [resetTimeLeft, setResetTimeLeft] = useState(calculateTimeUntilReset());

  // Update reset timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResetTimeLeft(calculateTimeUntilReset());
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateTimeUntilReset]);

  // Update current time
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Difficulty Emoji helper
  const getDifficultyEmoji = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy": return "🟢";
      case "medium": return "🟡";
      case "hard": return "🔴";
      default: return "⚪️";
    }
  };

  // Enhanced start quest function
  const startQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    try {
      // Animate the quest card
      const questElement = document.querySelector(`[data-quest-id="${questId}"]`);
      if (questElement) {
        gsap.to(questElement, {
          scale: 0.95,
          backgroundColor: "#4B5563",
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });
      }

      await db.quests.update(questId, { status: "in_progress" });
      
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, status: "in_progress" } : q
      ));
      
      addNotification(`🚀 Quest started: "${quest.name}"`, "quest");
    } catch (err) {
      console.error("Failed to start quest:", err);
      addNotification(`❌ Failed to start quest: "${quest.name}"`, "error");
    }
  };

  // Enhanced complete quest function
  const completeQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    try {
      // Celebration animation
      const questElement = document.querySelector(`[data-quest-id="${questId}"]`);
      if (questElement) {
        gsap.to(questElement, {
          scale: 1.05,
          backgroundColor: "#10B981",
          duration: 0.5,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.to(questElement, { opacity: 0, duration: 0.5 });
          }
        });
      }

      await completeQuest(questId);
      
      setQuests(prev => prev.map(q => 
        q.id === questId ? { ...q, status: "completed" } : q
      ));
    } catch (err) {
      console.error("Failed to complete quest:", err);
      addNotification(`❌ Failed to complete quest: "${quest.name}"`, "error");
    }
  };

  // Enhanced penalty function
  const applyPenaltyAndResetQuest = useCallback(
    async (questId) => {
      const quest = quests.find(q => q.id === questId);
      if (!quest) return;

      try {
        const ps = (await db.gameState.get("playerState")) || {};
        let { hp, maxHp, mana, maxMana, coins } = ps;

        hp = Math.max(0, hp - Math.floor(hp * 0.85));
        mana = Math.max(0, mana - Math.floor(mana * 0.85));
        coins = Math.max(0, coins - Math.floor(coins * 0.15));

        await db.gameState.put({ ...ps, hp, mana, coins });

        const newDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        await db.quests.update(questId, {
          status: "not_started",
          deadline: newDeadline,
          warningSentForCurrentPeriod: false,
        });

        setQuests(prev => prev.map(q => 
          q.id === questId ? { 
            ...q, 
            status: "not_started", 
            deadline: newDeadline,
            warningSentForCurrentPeriod: false
          } : q
        ));

        addNotification(
          `💀 Quest "${quest.name}" expired! Penalties applied:\n- 85% HP/Mana loss\n- 15% Coins lost`,
          "penalty"
        );
      } catch (err) {
        console.error("Error applying penalty:", err);
      }
    },
    [addNotification, quests, setQuests]
  );

  // Reset all daily quests
  const resetEveryDayQuests = async () => {
    const everyDayQuests = quests.filter(
      q => q.type === "daily" && q.repeatable && q.status !== "completed"
    );
    
    if (everyDayQuests.length > 0) {
      try {
        const ps = await db.gameState.get("playerState");
        let { hp, maxHp, mana, maxMana, coins } = ps;
        
        // Apply penalties
        hp = Math.max(0, hp - Math.floor(maxHp * 0.85));
        mana = Math.max(0, mana - Math.floor(maxMana * 0.85));
        coins = Math.max(0, coins - Math.floor(coins * 0.15));
        await db.gameState.put({ ...ps, hp, mana, coins });

        // Reset quests
        const newDeadline = new Date();
        newDeadline.setDate(newDeadline.getDate() + 1);
        newDeadline.setHours(0, 0, 0, 0);
        
        const updates = everyDayQuests.map(q => 
          db.quests.update(q.id, {
            status: "not_started",
            deadline: newDeadline.toISOString(),
            warningSentForCurrentPeriod: false,
          })
        );
        
        await Promise.all(updates);
        
        setQuests(prev => prev.map(q => 
          everyDayQuests.some(eq => eq.id === q.id) ? { 
            ...q, 
            status: "not_started",
            deadline: newDeadline.toISOString(),
            warningSentForCurrentPeriod: false
          } : q
        ));

        addNotification(
          `🔄 Daily quests reset! Penalties applied for incomplete quests.`,
          "penalty"
        );
      } catch (err) {
        console.error("Error resetting daily quests:", err);
      }
    }
  };

  // Group quests by category
  const questsByCategory = {
    everyDay: quests
      .filter(q => q.type === "daily" && q.repeatable && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
    daily: quests
      .filter(q => q.type === "daily" && !q.repeatable && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
    subquest: quests
      .filter(q => q.type === "subquest" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
    main: quests
      .filter(q => q.type === "main" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
  };

  const tabLabels = [
    { key: "everyDay", label: "🔄 Every Day" },
    { key: "daily", label: "🗓️ Daily" },
    { key: "subquest", label: "🧩 Sub Quests" },
    { key: "main", label: "🏆 Main Quests" },
  ];

  // Render each quest item
  const renderQuest = (quest) => {
    const requiredLevel = quest.levelRequired || 1;
    const canStart = userLevel >= requiredLevel;
    const isStarted = quest.status === "in_progress";
    const isCompleted = quest.status === "completed";

    if (isCompleted) return null;

    // Calculate time left for active quests
    let timeLeft = null;
    if (quest.deadline && isStarted && activeTab !== "everyDay") {
      const diff = new Date(quest.deadline) - new Date();
      if (diff > 0) {
        timeLeft = (
          <CountdownTimer
            deadline={quest.deadline}
            onExpire={() => applyPenaltyAndResetQuest(quest.id)}
            onWarning={() => setInfoMessage(`⌛ Only 4 hours left to complete "${quest.name}"!`)}
            addNotification={addNotification}
            questName={quest.name}
            warningSent={quest.warningSentForCurrentPeriod || false}
            onWarningSent={() =>
              db.quests.update(quest.id, {
                warningSentForCurrentPeriod: true,
              })
            }
          />
        );
      }
    }

    return (
      <div
        key={quest.id}
        data-quest-id={quest.id}
        className={`quest-item bg-gradient-to-br from-gray-800/90 to-gray-700/90 backdrop-blur-lg rounded-xl p-5 mb-4 shadow-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 ${
          !canStart && !isCompleted ? "opacity-60" : ""
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">{quest.name}</h3>
            <p className="text-purple-300/90 uppercase text-xs tracking-wider mb-2">
              {quest.type} • {getDifficultyEmoji(quest.difficulty)} • {quest.status}
              {quest.repeatable && " 🔁"}
            </p>
          </div>
          <span className="text-xs bg-black/30 px-2 py-1 rounded-full border border-white/10">
            Lv. {requiredLevel}
          </span>
        </div>

        {quest.description && (
          <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
        )}

        <div className="flex justify-between items-center mb-3">
          <span className="text-yellow-400 text-sm flex items-center">
            🪙 {quest.coins || 0}
          </span>
          <span className="text-green-400 text-sm flex items-center">
            ⚡ {quest.xp || 0} XP
          </span>
        </div>

        {!isCompleted && (
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <div className="flex gap-2">
              {!isStarted ? (
                <CustomButton
                  onClick={() => startQuestHandler(quest.id)}
                  variant={canStart ? "primary" : "secondary"}
                  disabled={!canStart}
                  className="px-4 py-2 text-sm"
                >
                  {canStart ? "Start Quest" : "Level Required"}
                </CustomButton>
              ) : (
                <CustomButton
                  onClick={() => completeQuestHandler(quest.id)}
                  variant="success"
                  className="px-4 py-2 text-sm"
                >
                  Complete
                </CustomButton>
              )}
              
              {!isStarted && canStart && (
                <CustomButton
                  onClick={() => setEditingQuest(quest)}
                  variant="secondary"
                  className="px-4 py-2 text-sm"
                >
                  Edit
                </CustomButton>
              )}
            </div>

            {timeLeft && (
              <div className="bg-black/30 px-3 py-1 rounded-full border border-red-500/20">
                {timeLeft}
              </div>
            )}
          </div>
        )}

        {!isCompleted && (
          <div className={`absolute -bottom-2 -right-2 text-xs px-2 py-1 rounded-full shadow z-10 transition-opacity duration-300 ${
            canStart ? "bg-green-600/90 text-white" : "bg-red-600/90 text-white"
          }`}>
            {canStart
              ? `✅ Level ${userLevel}`
              : `🔒 Needs Lv. ${requiredLevel}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Info popup */}
      <InfoPopup message={infoMessage} onClose={() => setInfoMessage(null)} />

      {/* Header with new quest button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Quest Journal
        </h2>
        <CustomButton
          onClick={() => {
            setCurrentQuestType("daily");
            setEditingQuest(null);
            setShowQuestModal(true);
          }}
          variant="primary"
          className="px-6 py-3"
        >
          + New Quest
        </CustomButton>
      </div>

      {/* Tabs */}
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="flex border-b border-gray-700/50">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              className={`px-5 py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === key
                  ? "text-white bg-gradient-to-b from-purple-500/20 to-transparent border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div 
          ref={questsContainerRef}
          className="p-5 max-h-[500px] overflow-y-auto custom-scrollbar"
        >
          {/* Countdown for daily reset */}
          {activeTab === "everyDay" && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-white/10">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-bold text-white mb-3">Daily Reset In:</h3>
                <div className="flex justify-center items-center space-x-4">
                  {/* Hours */}
                  <div className="relative">
                    <CountdownCircleTimer
                      key={`hours-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={24 * 60 * 60}
                      initialRemainingTime={Math.floor(resetTimeLeft / 1000)}
                      colors={[["#EF4444"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={70}
                      rotation="counterclockwise"
                      onComplete={() => {
                        resetEveryDayQuests();
                        return { shouldRepeat: false };
                      }}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-xl font-bold text-red-400">
                            {Math.floor(remainingTime / 3600).toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">HOURS</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>

                  {/* Minutes */}
                  <div className="relative">
                    <CountdownCircleTimer
                      key={`minutes-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={3600}
                      initialRemainingTime={Math.floor((resetTimeLeft / 1000) % 3600)}
                      colors={[["#F59E0B"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={60}
                      rotation="counterclockwise"
                      onComplete={() => ({ shouldRepeat: true })}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {Math.floor(remainingTime / 60).toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">MINUTES</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>

                  {/* Seconds */}
                  <div className="relative">
                    <CountdownCircleTimer
                      key={`seconds-${Math.floor(resetTimeLeft / 1000)}`}
                      isPlaying
                      duration={60}
                      initialRemainingTime={Math.floor((resetTimeLeft / 1000) % 60)}
                      colors={[["#10B981"]]}
                      trailColor="#374151"
                      strokeWidth={6}
                      size={50}
                      rotation="counterclockwise"
                      onComplete={() => ({ shouldRepeat: true })}
                    >
                      {({ remainingTime }) => (
                        <div className="flex flex-col items-center">
                          <div className="text-base font-bold text-green-400">
                            {remainingTime.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-400">SECONDS</div>
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Uncompleted quests will reset with penalties
                </p>
              </div>
            </div>
          )}

          {/* Quests list */}
          {questsByCategory[activeTab].length > 0 ? (
            <div className="grid gap-4">
              {questsByCategory[activeTab].map(renderQuest)}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">No quests in this category</p>
              <CustomButton
                onClick={() => {
                  setCurrentQuestType(activeTab === "everyDay" ? "daily" : activeTab);
                  setEditingQuest(null);
                  setShowQuestModal(true);
                }}
                variant="secondary"
                className="px-6 py-2"
              >
                Create New Quest
              </CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* Quest Modal */}
      {showQuestModal && (
        <Modals
          showQuestModal={showQuestModal}
          setShowQuestModal={setShowQuestModal}
          currentQuestType={currentQuestType}
          onQuestConfirm={async (questData) => {
            if (!questData.name) return;
            
            try {
              if (editingQuest) {
                await db.quests.update(editingQuest.id, questData);
                setQuests(prev => prev.map(q => 
                  q.id === editingQuest.id ? { ...q, ...questData } : q
                ));
              } else {
                const newQuest = {
                  ...questData,
                  id: Date.now().toString(),
                  status: "not_started",
                  subquests: [],
                  priority: quests.reduce((max, q) => Math.max(max, q.priority), 0) + 1,
                  warningSentForCurrentPeriod: false,
                };
                await db.quests.add(newQuest);
                setQuests(prev => [...prev, newQuest]);
              }
              setShowQuestModal(false);
              setEditingQuest(null);
            } catch (err) {
              console.error("Failed to save quest:", err);
              addNotification("Failed to save quest", "error");
            }
          }}
          editingQuest={editingQuest}
          onQuestCancel={() => {
            setEditingQuest(null);
            setShowQuestModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Quests;  