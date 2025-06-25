export const applyItemEffect = (item, setHp, maxHp, setMana, maxMana, addBadge) => {
  if (item.name === "HP Potion") {
    setHp((prev) => Math.min(prev + 50, maxHp));
    addBadge("HP+", 3000);
  } else if (item.name === "Mana Potion") {
    setMana((prev) => Math.min(prev + 50, maxMana));
    addBadge("MA+", 3000);
  } else if (item.name === "1-Hour Break") {
    setHp((prev) => Math.min(prev + 20, maxHp));
    addBadge("REST", 5000);
  }
};
