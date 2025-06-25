import { useState } from "react";

export const usePlayerState = () => {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [maxXP, setMaxXP] = useState(980);
  const [coins, setCoins] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [mana, setMana] = useState(120);
  const [maxMana, setMaxMana] = useState(120);
  const [badges, setBadges] = useState([]);
  const [penaltyCount, setPenaltyCount] = useState(0);
  const [penaltyCoins, setPenaltyCoins] = useState(0);
  const [isPenaltyActive, setIsPenaltyActive] = useState(false);
  const [currentPenalty, setCurrentPenalty] = useState(null);

  return {
    level, setLevel, xp, setXp, maxXP, setMaxXP,
    coins, setCoins, hp, setHp, maxHp, setMaxHp,
    mana, setMana, maxMana, setMaxMana, badges, setBadges,
    penaltyCount, setPenaltyCount, penaltyCoins, setPenaltyCoins,
    isPenaltyActive, setIsPenaltyActive, currentPenalty, setCurrentPenalty
  };
};
