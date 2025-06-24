import React, { useState, useEffect, useRef } from "react";

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

export default CountdownTimer;