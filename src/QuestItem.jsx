import React from "react";
import CustomButton from "./CustomButton";
import CountdownTimer from "./CountdownTimer";

const QuestItem = ({
  quest,
  db,
  userLevel,
  activeTab,
  startQuestHandler,
  completeQuestHandler,
  setEditingQuest,
  applyPenaltyAndResetQuest,
  setInfoMessage,
  addNotification,
}) => {
  const requiredLevel = quest.levelRequired || 1;
  const canStart = userLevel >= requiredLevel;
  console.log("userLevel", userLevel);
  console.log("requiredLevel", requiredLevel);
  
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

  const getDifficultyEmoji = (difficulty) => {
    switch (difficulty) {
      case "easy": return "😊";
      case "medium": return "😐";
      case "hard": return "😰";
      default: return "❓";
    }
  };

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

      <div className="flex justify-start items-center mb-3">
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
        <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full shadow z-10 transition-opacity duration-300 ${
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

export default QuestItem;