import React, { useState, useEffect } from "react";
import Dexie from "dexie";
import CustomButton from "./CustomButton";
import Modals from "./Modals";

// Initialize Dexie DB
const db = new Dexie("life_rpg");
db.version(1).stores({
  gameState: "id",
  quests: "id",
  inventory: "id",
});

const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [now, setNow] = useState(new Date());

  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuestType, setCurrentQuestType] = useState("daily");
  const [editingQuest, setEditingQuest] = useState(null);

  // Fetch quests from DB
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const data = await db.quests.toArray();
        setQuests(data);
      } catch (err) {
        console.error("Failed to fetch quests:", err);
      }
    };

    fetchQuests();
    const interval = setInterval(fetchQuests, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update current time every second
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Utils
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
      const end = formatDeadline(quest.deadline);
      const diff = end.getTime() - now.getTime();

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
    try {
      await db.quests.update(questId, { status: "in_progress" });
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: "in_progress" } : q
        )
      );
    } catch (err) {
      console.error("Failed to start quest:", err);
    }
  };

  const completeQuest = async (questId) => {
    try {
      // 1. Mark as completed
      await db.quests.update(questId, { status: "completed" });
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: "completed" } : q))
      );

      // 2. Get player state
      const ps = (await db.gameState.get("playerState")) || {};
      let {
        xp = 0,
        level = 1,
        maxXP = 100,
        hp = 100,
        maxHp = 100,
        mana = 100,
        maxMana = 100,
        coins = 0,
      } = ps;

      // 3. Get the quest directly from DB (fixes sync issue)
      const quest = await db.quests.get(questId);
      if (!quest) return;

      const difficulty = (quest.difficulty || "easy").toLowerCase();
      const ranges = {
        easy: [5, 10],
        medium: [10, 20],
        hard: [20, 35],
      };

      const [minD, maxD] = ranges[difficulty] || [5, 10];
      const rand = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const drain = rand(minD, maxD);
      const hpDrain = Math.floor(drain * (1 + level * 0.05));
      const manaDrain = Math.floor(drain * (1 + level * 0.03));

      if (hp < hpDrain || mana < manaDrain) {
        alert("⚠️ Not enough HP or Mana.");
        return;
      }

      // 4. Apply drain
      hp = Math.max(0, hp - hpDrain);
      mana = Math.max(0, mana - manaDrain);

      // 5. Reward
      xp += quest.xp || 0;
      coins += quest.coins || 0;

      // 6. Level up logic
      let leveledUp = false;
      while (xp >= maxXP) {
        xp -= maxXP;
        level++;
        maxXP = Math.floor(maxXP * 1.14);
        leveledUp = true;
      }

      if (leveledUp) {
        maxHp = 100 + level * 15;
        maxMana = 100 + level * 12;
        hp = maxHp;
        mana = maxMana;
        coins += level * 10 + rand(0, 5);
      }

      // 7. Save state
      const updatedState = {
        id: "playerState",
        xp,
        level,
        maxXP,
        hp,
        maxHp,
        mana,
        maxMana,
        coins,
      };
      await db.gameState.put(updatedState);

      setUserLevel(level); // ✅ fixed: updated only after full calc
    } catch (err) {
      console.error("Error completing quest:", err);
    }
  };

  const openNewQuestModal = (type = "daily") => {
    setCurrentQuestType(type);
    setEditingQuest(null);
    setShowQuestModal(true);
  };

  const openEditQuestModal = (quest) => {
    setCurrentQuestType(quest.type || "daily");
    setEditingQuest(quest);
    setShowQuestModal(true);
  };

  const handleQuestConfirm = async (questData) => {
    if (!questData.name) return;

    try {
      if (editingQuest) {
        await db.quests.put({ ...editingQuest, ...questData });
        setQuests((prev) =>
          prev.map((q) =>
            q.id === editingQuest.id ? { ...q, ...questData } : q
          )
        );
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
        setQuests((prev) => [...prev, newQuest]);
      }
      setShowQuestModal(false);
      setEditingQuest(null);
    } catch (err) {
      console.error("Failed to save quest:", err);
    }
  };

  const handleQuestCancel = () => {
    setEditingQuest(null);
    setShowQuestModal(false);
  };

  const renderQuest = (quest) => {
    const requiredLevel = quest.levelRequired || 1;
    const canStart = userLevel >= requiredLevel;
    const isStarted = quest.status === "in_progress";
    const isCompleted = quest.status === "completed";
    const remaining = calculateRemainingTime(quest);
    const lockedClass =
      !canStart && !isCompleted ? "opacity-50 cursor-not-allowed" : "";

    if (isCompleted) return null;

    return (
      <div
        key={quest.id}
        className={`quest-item bg-gradient-to-r from-gray-800 to-gray-700 backdrop-blur-md rounded-lg p-4 mb-4 shadow-lg hover:scale-105 transition-transform relative group ${lockedClass}`}
        aria-disabled={!canStart && !isCompleted}
      >
        <h3 className="text-xl font-bold text-white">{quest.name}</h3>
        <p className="text-purple-300 mb-2 uppercase text-sm">
          {quest.type} • {getDifficultyEmoji(quest.difficulty)} • {quest.status}
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
        <p className="text-red-300 mb-2">Required Level • {requiredLevel}</p>

        {!isCompleted && (
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <div className="flex gap-2">
              {!isStarted && (
                <CustomButton
                  onClick={() => canStart && startQuest(quest.id)}
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
            {remaining && (
              <p className="text-purple-300 text-sm">{remaining}</p>
            )}
          </div>
        )}
        {!isCompleted && (
          <div
            className="absolute bottom-1 right-2 group-hover:opacity-100 opacity-0 text-xs px-2 py-1 rounded shadow z-10
    transition-opacity duration-300
    whitespace-nowrap 
    ${
      canStart
        ? 'bg-green-600 text-white'
        : 'bg-red-600 text-white'
    }"
          >
            {canStart
              ? `✅ Ready! Your Level: ${userLevel}`
              : `⚠️ Requires Level ${quest.levelRequired || 1}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
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
          ["daily", "subquest", "main"].map((type) => {
            const filtered = quests
              .filter((q) => q.type === type && q.status !== "completed")
              .sort((a, b) => b.priority - a.priority);

            if (filtered.length === 0) return null;

            return (
              <div key={type} className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2 capitalize">
                  {type === "daily"
                    ? "🗓️ Daily Quests"
                    : type === "subquest"
                    ? "🧩 Sub Quests"
                    : "🏆 Main Quests"}
                </h2>
                {filtered.map(renderQuest)}
              </div>
            );
          })
        )}
      </div>

      <Modals
        showQuestModal={showQuestModal}
        setShowQuestModal={setShowQuestModal}
        currentQuestType={currentQuestType}
        onQuestConfirm={handleQuestConfirm}
        editingQuest={editingQuest}
        onQuestCancel={handleQuestCancel}
      />
    </div>
  );
};

export default Quests;
