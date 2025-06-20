import React, { useState, useEffect } from "react";
import Dexie from 'dexie';
import CustomButton from "./CustomButton";

// Initialize Dexie database
const db = new Dexie('life_rpg');
db.version(1).stores({
  gameState: 'id',
  quests: 'id',
  inventory: 'id'
});

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [userLevel, setUserLevel] = useState(5);
  const [now, setNow] = useState(new Date());

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
    
    // Set up interval to periodically fetch quests
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

  // Helpers
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

  const startQuest = async (questId) => {
    await db.quests.update(questId, { status: 'in_progress' });
  };

  const completeQuest = async (questId) => {
    await db.quests.update(questId, { status: 'completed' });
  };

  const renderQuest = (quest) => {
    const canStart = userLevel >= (quest.requiredLevel || 0);
    const isStarted = quest.status === "in_progress";
    const remainingTime = calculateRemainingTime(quest);

    return (
      <div
        key={quest.id}
        className="quest-item bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg p-4 mb-4 shadow-lg hover:scale-105 transition-transform"
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
          Required Level • {quest.requiredLevel || 1}
        </p>

        <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isStarted && canStart && (
              <CustomButton
                onClick={() => startQuest(quest.id)}
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-400 transition"
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
                onClick={() => {
                  console.log("Edit quest:", quest.id);
                  // TODO: hook up edit modal
                }}
                className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-400 transition"
              >
                Edit
              </CustomButton>
            )}
          </div>

          {/* Timer Display */}
          {remainingTime && (
            <p className="text-sm text-orange-300 font-mono">
              🕒 {remainingTime}
            </p>
          )}
        </div>

        {!canStart && (
          <p className="text-red-500 mt-2">
            Insufficient level to start this quest.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="backdrop-blur-md bg-gray-800 bg-opacity-90 rounded-lg p-6 shadow-lg">
      {quests.map(renderQuest)}
    </div>
  );
};

export default Quests;