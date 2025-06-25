import React, { useState, useEffect, useRef } from "react";

const digitShapes = {
  '0': Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * 2 * Math.PI;
    return [25 + 20 * Math.cos(angle), 30 + 25 * Math.sin(angle)];
  }),
  '1': Array.from({ length: 50 }, (_, i) => [25, 5 + (i / 49) * 50]),
  '2': Array.from({ length: 50 }, (_, i) => {
    if (i < 17) return [5 + (i / 16) * 40, 5];
    if (i < 34) return [45 - ((i - 17) / 16) * 40, 5 + ((i - 17) / 16) * 50];
    return [5 + ((i - 34) / 15) * 40, 55];
  }),
  '3': Array.from({ length: 50 }, (_, i) => {
    if (i < 25) return [25 + 20 * Math.cos((i / 25) * Math.PI), 5 + (i / 24) * 50];
    return [25 + 20 * Math.cos((i - 25) / 25 * Math.PI + Math.PI), 55 - ((i - 25) / 24) * 50];
  }),
  '4': Array.from({ length: 50 }, (_, i) => {
    if (i < 25) return [25, 5 + (i / 24) * 50];
    return [5 + ((i - 25) / 24) * 40, 30];
  }),
  '5': Array.from({ length: 50 }, (_, i) => {
    if (i < 17) return [5 + (i / 16) * 40, 5];
    if (i < 34) return [45 - ((i - 17) / 16) * 40, 5 + ((i - 17) / 16) * 25];
    return [5 + ((i - 34) / 15) * 40, 30 + ((i - 34) / 15) * 25];
  }),
  '6': Array.from({ length: 50 }, (_, i) => {
    if (i < 25) return [25 + 20 * Math.cos((i / 25) * Math.PI + Math.PI), 5 + (i / 24) * 50];
    return [25 + 20 * Math.sin(((i - 25) / 24) * Math.PI * 1.5 + Math.PI / 2), 30 + ((i - 25) / 24) * 25];
  }),
  '7': Array.from({ length: 50 }, (_, i) => [45 - (i / 49) * 40, 5 + (i / 49) * 50]),
  '8': Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * 2 * Math.PI;
    return [25 + 15 * Math.cos(angle) * (i < 25 ? 1 : 0.8), 30 + 20 * Math.sin(angle)];
  }),
  '9': Array.from({ length: 50 }, (_, i) => {
    if (i < 25) return [25 + 20 * Math.cos((i / 25) * Math.PI), 5 + (i / 24) * 50];
    return [25 - 20 * Math.sin(((i - 25) / 24) * Math.PI * 1.5 + Math.PI / 2), 5 + ((i - 25) / 24) * 25];
  }),
};

const getDigitPoints = (digit, xOffset) => {
  return digitShapes[digit].map(([x, y]) => [x + xOffset, y]);
};

const CountdownTimer = ({
  deadline,
  onExpire,
  onWarning,
  addNotification,
  questName,
  warningSent,
  onWarningSent,
}) => {
  const canvasRef = useRef(null);
  const [display, setDisplay] = useState("00:00:00");
  const particlesRef = useRef([]);
  const colonParticlesRef = useRef([]);
  const warnedRef = useRef(warningSent);

  useEffect(() => {
    const canvasWidth = 400;
    const canvasHeight = 100;
    particlesRef.current = Array.from({ length: 6 }, (_, i) =>
      Array.from({ length: 50 }, () => ({
        x: Math.random() * 50 + i * 60,
        y: Math.random() * canvasHeight,
        targetX: 0,
        targetY: 0,
        color: "rgba(0,255,0,0.8)",
      }))
    );
    colonParticlesRef.current = [
      Array.from({ length: 4 }, (_, i) => ({
        x: 115 + (i % 2) * 5,
        y: 30 + (i > 1 ? 20 : 0),
        alpha: 1,
      })),
      Array.from({ length: 4 }, (_, i) => ({
        x: 265 + (i % 2) * 5,
        y: 30 + (i > 1 ? 20 : 0),
        alpha: 1,
      })),
    ];

    const animate = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      particlesRef.current.forEach((digitParticles) => {
        digitParticles.forEach((p) => {
          p.x += (p.targetX - p.x) * 0.15;
          p.y += (p.targetY - p.y) * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      });

      colonParticlesRef.current.forEach((colonParticles, idx) => {
        colonParticles.forEach((p) => {
          p.alpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.002 + idx);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.fill();
        });
      });

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(deadline) - Date.now();
      if (diff <= 0) {
        setDisplay("00:00:00");
        onExpire();
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setDisplay(
          `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        );

        if (!warnedRef.current && diff <= 4 * 3600 * 1000) {
          warnedRef.current = true;
          onWarning();
          addNotification(
            `Only 4 hours left to complete "${questName}"!`,
            "warning"
          );
          onWarningSent();
        }

        const color =
          diff > 4 * 3600 * 1000
            ? "rgba(0,255,0,0.8)"
            : diff > 3600 * 1000
            ? "rgba(255,255,0,0.8)"
            : "rgba(255,0,0,0.8)";
        particlesRef.current.forEach((digitParticles) =>
          digitParticles.forEach((p) => (p.color = color))
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, onExpire, onWarning, addNotification, questName, onWarningSent]);

  useEffect(() => {
    const digits = display.replace(/:/g, "").split("");
    digits.forEach((digit, idx) => {
      const xOffset = idx * 60 + (idx > 1 ? 20 : 0) + (idx > 3 ? 20 : 0);
      const points = getDigitPoints(digit, xOffset);
      particlesRef.current[idx].forEach((p, i) => {
        if (i < points.length) {
          [p.targetX, p.targetY] = points[i];
        } else {
          p.targetX = p.targetY = -100;
        }
      });
    });
  }, [display]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      style={{
        filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
        background: "radial-gradient(circle, rgba(20,20,20,0.8), rgba(0,0,0,1))",
      }}
    />
  );
};

export default CountdownTimer;