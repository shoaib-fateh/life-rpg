import React, { useState, useEffect, useCallback } from "react";
import Dexie from "dexie";
import CustomButton from "./CustomButton";
import Modals from "./Modals";

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
}) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(deadline) - Date.now();
    return diff > 0 ? diff : 0;
  });

  const [warned, setWarned] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    if (!warned && timeLeft <= 4 * 60 * 60 * 1000) {
      setWarned(true);
      onWarning();
      addNotification(
        `Only 4 hours left to complete "${questName}"!`,
        "warning"
      );
    }

    const timerId = setInterval(() => {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timerId);
        onExpire();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [
    timeLeft,
    deadline,
    onExpire,
    onWarning,
    warned,
    addNotification,
    questName,
  ]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    // Pad zeros so you always get 2 digits
    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
  };

  return <span className="font-mono text-red-400">{formatTime(timeLeft)}</span>;
};

// --- InfoPopup Component (In-App Notification) ---
const InfoPopup = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onClose, 6000); // Show for 6 seconds
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-yellow-400 text-black px-5 py-3 rounded shadow-lg z-50 max-w-xs animate-fadeIn">
      <strong>Warning: </strong> {message}
      <button
        onClick={onClose}
        className="mr-3 font-bold hover:text-red-700 transition"
        aria-label="Close notification"
      >
        ✖
      </button>
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
}) => {
  const [userLevel, setUserLevel] = useState(1);
  const [now, setNow] = useState(new Date());

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [editingQuest, setEditingQuest] = useState(null);

  const [infoMessage, setInfoMessage] = useState(null);

  // TAB state
  const [activeTab, setActiveTab] = useState("everyDay");

  // Calculate time until daily reset (next midnight)
  const calculateTimeUntilReset = useCallback(() => {
    const now = new Date();
    const resetTime = new Date();

    // Set reset time to next day 00:00:00
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);

    return resetTime.getTime() - now.getTime();
  }, []);

  const [resetTimeLeft, setResetTimeLeft] = useState(calculateTimeUntilReset());

  // Update reset timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setResetTimeLeft(calculateTimeUntilReset());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeUntilReset]);

  // Format time for reset timer (HH:MM:SS)
  const formatResetTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch quests from DB
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const data = await db.quests.toArray();
        if (JSON.stringify(data) !== JSON.stringify(quests)) {
          setQuests(data);
        }
      } catch (err) {
        console.error("Failed to fetch quests:", err);
      }
    };

    fetchQuests();
    const interval = setInterval(fetchQuests, 5000);
    return () => clearInterval(interval);
  }, [quests]);

  // Update current time every second (for syncing timer UI if needed)
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Difficulty Emoji helper
  const getDifficultyEmoji = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪️";
    }
  };

  // Start quest
  const startQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.status !== "not_started") return;
    if (!canStartQuest(quest)) return;

    try {
      await db.quests.update(questId, {
        status: "in_progress",
        deadline: quest.is24Hour
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : quest.deadline,
      });

      addNotification(`Quest started: "${quest.name}"`, "quest");
    } catch (err) {
      console.error("Failed to start quest:", err);
    }
  };

  // Complete quest
  const completeQuestHandler = async (questId) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return;

    try {
      // 1. Mark as completed
      await db.quests.update(questId, { status: "completed" });

      addNotification(`Quest completed: "${quest.name}"`, "success");
    } catch (err) {
      console.error("Failed to complete quest:", err);
    }
  };

  // Apply penalty and reset quest on expiration
  const applyPenaltyAndResetQuest = useCallback(
    async (questId) => {
      const ps = (await db.gameState.get("playerState")) || {};
      let {
        hp = 100,
        maxHp = 100,
        mana = 100,
        maxMana = 100,
        coins = 0,
        xp = 0,
        level = 1,
        maxXP = 100,
      } = ps;

      hp = Math.max(0, hp - Math.floor(hp * 0.85));
      mana = Math.max(0, mana - Math.floor(mana * 0.85));
      coins = Math.max(0, coins - Math.floor(coins * 0.15));

      await db.gameState.put({
        id: "playerState",
        hp,
        maxHp,
        mana,
        maxMana,
        coins,
        xp,
        level,
        maxXP,
      });

      // Reset quest: status not_started, deadline 24h later
      const newDeadline = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      await db.quests.update(questId, {
        status: "not_started",
        deadline: newDeadline,
      });

      addNotification(
        `⏰ Quest timer expired! Penalties applied:\n- 85% HP and Mana reduction\n- 15% Coins reduction`,
        "penalty"
      );
    },
    [addNotification]
  );

  // Open new quest modal
  const openNewQuestModal = (type = "daily") => {
    setCurrentQuestType(type);
    setEditingQuest(null);
    setShowQuestModal(true);
  };

  // Open edit quest modal
  const openEditQuestModal = (quest) => {
    setCurrentQuestType(quest.type || "daily");
    setEditingQuest(quest);
    setShowQuestModal(true);
  };

  // Handle confirm in quest modal
  const handleQuestConfirm = async (questData) => {
    if (!questData.name) return;

    try {
      if (editingQuest) {
        await db.quests.put({ ...editingQuest, ...questData });
      } else {
        const newQuest = {
          ...questData,
          id: Date.now().toString(),
          status: "not_started",
          subquests: [],
          priority:
            quests.reduce(
              (max, q) => (q.priority > max ? q.priority : max),
              0
            ) + 1,
        };
        await db.quests.add(newQuest);
      }
      setShowQuestModal(false);
      setEditingQuest(null);
    } catch (err) {
      console.error("Failed to save quest:", err);
    }
  };

  // Handle cancel in quest modal
  const handleQuestCancel = () => {
    setEditingQuest(null);
    setShowQuestModal(false);
  };

  // Warning callback for timer (4h left)
  const onWarning = (questName) => {
    setInfoMessage(`⌛ Only 4 hours left to complete "${questName}"!`);
  };

  // Render each quest item
  const renderQuest = (quest) => {
    const requiredLevel = quest.requiredLevel || 1;
    const canStart = userLevel >= requiredLevel;
    const isStarted = quest.status === "in_progress";
    const isCompleted = quest.status === "completed";

    const lockedClass =
      !canStart && !isCompleted ? "opacity-50 cursor-not-allowed" : "";

    if (isCompleted) return null;

    return (
      <div
        key={quest.id}
        className={`quest-item bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg p-4 mb-4 shadow-lg hover:scale-[0.96] transition-transform relative group ${lockedClass}`}
        aria-disabled={!canStart && !isCompleted}
      >
        <h3 className="text-xl font-bold text-white">{quest.name}</h3>
        <p className="text-purple-300 mb-2 uppercase text-sm">
          {quest.type} • {getDifficultyEmoji(quest.difficulty)} • {quest.status}
          {quest.repeatable && quest.type === "daily" && " 🔁"}
        </p>
        {quest.description && (
          <p className="text-gray-300 mb-2">{quest.description}</p>
        )}

        {/* Show countdown timer for daily reset in Every Day tab */}
        {activeTab === "everyDay" && quest.repeatable && (
          <div className="mt-2 flex items-center">
            <span className="text-xs text-gray-400 mr-2">Reset in:</span>
            <span className="font-mono text-red-400 bg-black bg-opacity-30 px-2 py-1 rounded">
              {formatResetTime(resetTimeLeft)}
            </span>
          </div>
        )}

        {/* Show regular deadline for other tabs */}
        {quest.deadline && (
          <p className="text-red-300 text-sm">
            Deadline: {new Date(quest.deadline).toLocaleString()}
          </p>
        )}

        <p className="text-sm">
          🪙 {quest.coins || 0} • {quest.xp || 0} XP
        </p>
        <p className="text-red-300 mb-2">Required Level • {requiredLevel}</p>

        {!isCompleted && (
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <div className="flex gap-2">
              {!isStarted && (
                <CustomButton
                  onClick={() => canStart && startQuestHandler(quest.id)}
                  className={`bg-green-500 px-4 py-2 rounded hover:bg-green-400 transition ${
                    !canStart ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!canStart}
                >
                  Start
                </CustomButton>
              )}
              {isStarted && (
                <CustomButton
                  onClick={() => completeQuestHandler(quest.id)}
                  className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-400 transition"
                >
                  Complete
                </CustomButton>
              )}
              {!isStarted && canStart && (
                <CustomButton
                  onClick={() => openEditQuestModal(quest)}
                  className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400 transition"
                >
                  Edit
                </CustomButton>
              )}
            </div>

            {quest.deadline && isStarted && (
              <CountdownTimer
                deadline={quest.deadline}
                onExpire={() => applyPenaltyAndResetQuest(quest.id)}
                onWarning={() => onWarning(quest.name)}
                addNotification={addNotification}
                questName={quest.name}
              />
            )}
          </div>
        )}

        {/* Tooltip */}
        {!isCompleted && (
          <div
            className={`absolute bottom-1 right-2 group-hover:opacity-100 opacity-0 text-xs px-2 py-1 rounded shadow z-10
              transition-opacity duration-300
              whitespace-nowrap
              ${
                canStart ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
          >
            {canStart
              ? `✅ Ready! Your Level: ${userLevel}`
              : `⚠️ Requires Level ${requiredLevel}`}
          </div>
        )}
      </div>
    );
  };

  // Group quests by category
  const questsByCategory = {
    everyDay: quests
      .filter(
        (q) =>
          q.type === "daily" &&
          q.repeatable === true &&
          q.status !== "completed"
      )
      .sort((a, b) => b.priority - a.priority),
    daily: quests
      .filter(
        (q) => q.type === "daily" && !q.repeatable && q.status !== "completed"
      )
      .sort((a, b) => b.priority - a.priority),
    subquest: quests
      .filter((q) => q.type === "subquest" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
    main: quests
      .filter((q) => q.type === "main" && q.status !== "completed")
      .sort((a, b) => b.priority - a.priority),
  };

  const tabLabels = [
    { key: "everyDay", label: "🔄 Every Day Quests" },
    { key: "daily", label: "🗓️ Daily Quests" },
    { key: "subquest", label: "🧩 Sub Quests" },
    { key: "main", label: "🏆 Main Quests" },
  ];

  return (
    <div>
      {/* Info popup */}
      <InfoPopup message={infoMessage} onClose={() => setInfoMessage(null)} />

      {/* New Quest button */}
      <div className="flex justify-end mb-4">
        <CustomButton
          onClick={() => openNewQuestModal("daily")}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-500 transition"
        >
          + New Quest
        </CustomButton>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-lg shadow-lg p-4">
        <div className="flex border-b border-gray-700 mb-4">
          {tabLabels.map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 -mb-px text-sm font-semibold rounded-t-md
                ${
                  activeTab === key
                    ? "bg-gray-700 text-white border border-b-0 border-gray-600"
                    : "text-gray-400 hover:text-white"
                }`}
              onClick={() => setActiveTab(key)}
              aria-selected={activeTab === key}
              role="tab"
              tabIndex={activeTab === key ? 0 : -1}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="max-h-[420px] overflow-y-auto custom-scrollbar"
        >
          {questsByCategory[activeTab].length > 0 ? (
            questsByCategory[activeTab].map(renderQuest)
          ) : (
            <p className="text-gray-400 text-center py-10">
              No quests in this category.
            </p>
          )}
        </div>
      </div>

      {/* Quest Modal */}
      {showQuestModal && (
        <Modals
          showQuestModal={showQuestModal}
          setShowQuestModal={setShowQuestModal}
          currentQuestType={currentQuestType}
          onQuestConfirm={handleQuestConfirm}
          editingQuest={editingQuest}
          onQuestCancel={handleQuestCancel}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.7);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.9);
        }
      `}</style>
    </div>
  );
};

export default Quests;
