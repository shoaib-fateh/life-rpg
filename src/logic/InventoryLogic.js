export const applyItemEffect = (
  item,
  setHp,
  maxHp,
  setMana,
  maxMana,
  addBadge,
  setActiveEffects,
  activeEffects,
  setQuests,
  quests,
  addNotification
) => {
  const quality = item.quality || 1;
  if (item.type === "consumable") {
    if (item.effect.hp) {
      setHp((prev) => Math.min(prev + item.effect.hp * quality, maxHp));
      addBadge("HP+", item.icon, 3000);
    } else if (item.effect.mana) {
      setMana((prev) => Math.min(prev + item.effect.mana * quality, maxMana));
      addBadge("MA+", item.icon, 3000);
    }
  } else if (item.type === "boost" && item.duration) {
    const expiresAt = new Date(Date.now() + item.duration).toISOString();
    setActiveEffects((prev) => [
      ...prev,
      { type: "xp_multiplier", value: item.effect.xp_multiplier, expiresAt, icon: item.icon },
    ]);
    addBadge("Boost", item.icon, item.duration);
    addNotification(`${item.name} active for ${item.duration / 60000} minutes`, "info");
  } else if (item.type === "special" && item.effect.skip_penalty) {
    const dailyQuest = quests.find((q) => q.type === "daily" && q.status !== "completed");
    if (dailyQuest) {
      setQuests((prev) =>
        prev.map((q) =>
          q.id === dailyQuest.id ? { ...q, status: "completed", completion_timestamp: new Date().toISOString() } : q
        )
      );
      addBadge("Day Off", item.icon, 5000);
      addNotification("Daily quest penalty skipped", "success");
    }
  }
};