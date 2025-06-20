import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import CustomButton from "./CustomButton";
import Modals from "./Modals"; // Import your modals component

// Initialize Dexie database
const db = new Dexie("life_rpg");
db.version(1).stores({
  gameState: "id",
  quests: "id",
  inventory: "id",
});

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [userLevel, setUserLevel] = useState(5);
  const [now, setNow] = useState(new Date());

  // Modal states
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [editingQuest, setEditingQuest] = useState(null);

  // Fetch quests from IndexedDB
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const questsData = await db.quests.toArray();
        setQuests(questsData);
      } catch (error) {
        console.error("Error fetching quests:", error);
      }
    };

    fetchQuests();

    // Periodic refresh
    const intervalId = setInterval(fetchQuests, 2000);
    return () => clearInterval(intervalId);
  }, []);

  // Ticking clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Difficulty emoji helper
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

  const formatDeadline = (deadline) => {
    try {
      return deadline.toDate ? deadline.toDate() : new Date(deadline);
    } catch {
      return new Date();
    }
  };

  const calculateRemainingTime = (quest) => {
    if (
      quest.type === "daily" &&
      quest.status === "in_progress" &&
      quest.deadline
    ) {
      const deadlineDate = formatDeadline(quest.deadline);
      const diff = deadlineDate.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        return `${h}h ${m}m ${s}s`;
      }
      return "Expired";
    }
    return null;
  };

  // Start quest handler
  const startQuest = async (questId) => {
    try {
      await db.quests.update(questId, { status: "in_progress" });
      // Optimistic UI update
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: "in_progress" } : q
        )
      );
    } catch (e) {
      console.error("Error starting quest:", e);
    }
  };

  // Complete quest handler
  const completeQuest = async (questId) => {
    try {
      await db.quests.update(questId, { status: "completed" });
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: "completed" } : q))
      );
    } catch (e) {
      console.error("Error completing quest:", e);
    }
  };

  // Open new quest modal
  const openNewQuestModal = (type = "daily") => {
    setCurrentQuestType(type);
    setEditingQuest(null); // Reset editing quest for new
    setShowQuestModal(true);
  };

  // Open edit quest modal
  const openEditQuestModal = (quest) => {
    setCurrentQuestType(quest.type || "daily");
    setEditingQuest(quest);
    setShowQuestModal(true);
  };

  // Handle quest confirm (create or edit)
  const handleQuestConfirm = async (questData) => {
    if (!questData.name) {
      console.log("Quest name not provided");
      return;
    }
    try {
      if (editingQuest) {
        // Update existing quest in DB
        await db.quests.put({ ...editingQuest, ...questData });
        setQuests((prev) =>
          prev.map((q) =>
            q.id === editingQuest.id ? { ...q, ...questData } : q
          )
        );
      } else {
        // Add new quest to DB
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
        setQuests((prev) => [...prev, newQuest]);
      }
      setShowQuestModal(false);
      setEditingQuest(null);
    } catch (e) {
      console.error("Error saving quest:", e);
    }
  };

  // Cancel editing quest
  const handleQuestCancel = () => {
    setEditingQuest(null);
    setShowQuestModal(false);
  };

  // Render single quest
  const renderQuest = (quest) => {
    const canStart = userLevel >= (quest.levelRequired || 1);
    const isStarted = quest.status === "in_progress";
    const isCompleted = quest.status === "completed";
    const remainingTime = calculateRemainingTime(quest);

    // Gray overlay style if locked by level (only for not completed quests)
    const lockedClass =
      !canStart && !isCompleted ? "opacity-50 cursor-not-allowed" : "";

    return (
      <div
        key={quest.id}
        className={`quest-item bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg p-4 mb-4 shadow-lg hover:scale-105 transition-transform relative ${lockedClass}`}
        aria-disabled={!canStart && !isCompleted}
      >
        <h3 className="text-xl font-bold text-white">{quest.name}</h3>
        <p className="text-purple-300 mb-2 uppercase text-sm">
          {quest.type} • {getDifficultyEmoji(quest.difficulty)} •{" "}
          {quest.status || "not_started"}
        </p>

        {quest.description && (
          <p className="text-gray-300 mb-2">{quest.description}</p>
        )}

        {quest.deadline && (
          <p className="text-red-300">
            Deadline: {formatDeadline(quest.deadline).toLocaleString()}
          </p>
        )}

        <p className="text-sm">
          🪙 {quest.coins || 0} • {quest.xp || 0} XP
        </p>
        <p className="text-red-300 mb-2">
          Required Level • {quest.levelRequired || 1}
        </p>

        {/* Show action buttons ONLY if NOT completed */}
        {!isCompleted && (
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isStarted && (
                <CustomButton
                  onClick={() => canStart && startQuest(quest.id)}
                  className={`bg-green-500 px-4 py-2 rounded hover:bg-green-400 transition ${
                    !canStart
                      ? "opacity-50 cursor-not-allowed hover:bg-green-500"
                      : ""
                  }`}
                  disabled={!canStart}
                  tabIndex={canStart ? 0 : -1}
                >
                  Start
                </CustomButton>
              )}

              {isStarted && (
                <CustomButton
                  onClick={() => completeQuest(quest.id)}
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

            {/* Timer Display */}
            {remainingTime && (
              <p className="text-sm text-orange-300 font-mono select-none">
                🕒 {remainingTime}
              </p>
            )}
          </div>
        )}

        {/* Level requirement warning, only if not completed */}
        {!isCompleted && !canStart && (
          <p className="text-red-500 mt-2 select-none">
            سطح کافی برای شروع این کوئست را ندارید.
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* New Quest Button */}
      <div className="flex justify-end mb-4">
        <CustomButton
          onClick={() => openNewQuestModal("daily")}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-500 transition"
        >
          + New Quest
        </CustomButton>
      </div>

      <div className="backdrop-blur-md bg-gray-800 bg-opacity-90 rounded-lg p-6 shadow-lg">
        {quests.length === 0 ? (
          <p className="text-gray-400 text-center">No quests available.</p>
        ) : (
          quests.sort((a, b) => b.priority - a.priority).map(renderQuest)
        )}
      </div>

      {/* Modals */}
      <Modals
        showQuestModal={showQuestModal}
        setShowQuestModal={setShowQuestModal}
        currentQuestType={currentQuestType}
        onQuestConfirm={handleQuestConfirm}
        editingQuest={editingQuest}
        onQuestCancel={handleQuestCancel}
        // ... other modals props as needed
      />
    </div>
  );
};

export default Quests;
