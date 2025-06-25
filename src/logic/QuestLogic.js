export const canStartQuest = (quest, level, quests, hp, mana, isPenaltyActive) => {
  if (hp <= 0 || mana <= 0) return false;
  if (isPenaltyActive && quest.type === "daily" && quest.repeatable) return false;
  if (!quest.dependencies || quest.dependencies.length === 0) return true;
  if (quest.requiredLevel && level < quest.requiredLevel) return false;

  return quest.dependencies.every((depId) => {
    const depQuest = quests.find((q) => q.id === depId);
    return depQuest && depQuest.status === "completed";
  });
};
