import React, { useRef, useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "chartjs-plugin-gradient";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  ChartDataLabels
);

const RadialProgress = ({
  value,
  maxValue,
  color,
  gradientColors,
  label,
  pulseRate = 3000,
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const particlesInit = async (main) => await loadFull(main);

  useEffect(() => {
    let animationFrame;
    const duration = 1500;
    const startTime = performance.now();
    const startValue = currentValue;
    const valueChange = value - startValue;

    const animateValue = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = 0.5 * (1 - Math.cos(progress * Math.PI));
      setCurrentValue(startValue + easedProgress * valueChange);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateValue);
      }
    };

    animationFrame = requestAnimationFrame(animateValue);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createRadialGradient(
      canvasRef.current.width / 2,
      canvasRef.current.height / 2,
      0,
      canvasRef.current.width / 2,
      canvasRef.current.height / 2,
      canvasRef.current.width / 2
    );
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(0.7, gradientColors[1]);
    gradient.addColorStop(1, gradientColors[2] || gradientColors[1]);

    chartRef.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [currentValue, maxValue - currentValue],
            backgroundColor: [gradient, "rgba(255, 255, 255, 0.05)"],
            borderWidth: 0,
            borderRadius: 12,
            cutout: "80%",
            circumference: 360,
            rotation: 270,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          datalabels: { display: false },
          tooltip: { enabled: false },
        },
        animation: false,
      },
    });

    const interval = setInterval(() => {
      if (!isHovered && chartRef.current) {
        chartRef.current.data.datasets[0].backgroundColor[0] = color;
        chartRef.current.update();
        setTimeout(() => {
          chartRef.current.data.datasets[0].backgroundColor[0] = gradient;
          chartRef.current.update();
        }, 500);
      }
    }, pulseRate);

    return () => {
      chartRef.current?.destroy();
      clearInterval(interval);
    };
  }, [maxValue, color, gradientColors, pulseRate]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.datasets[0].data = [
        currentValue,
        maxValue - currentValue,
      ];
      chartRef.current.update("none");
    }
  }, [currentValue, maxValue]);

  const canvas = chartRef.current;
  if (!canvas || !canvas.ownerDocument) return;

  return (
    <motion.div
      className="relative flex flex-col items-center group transition-all duration-300 will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 10 }}
      whileHover={{ scale: 1.05, rotate: 2 }}
    >
      {currentValue > maxValue * 0.8 && (
        <Particles
          id={`particles-${label}`}
          init={particlesInit}
          className="absolute inset-0 pointer-events-none"
          options={{
            particles: {
              number: { value: currentValue > maxValue * 0.9 ? 15 : 8 },
              color: { value: color },
              size: { value: 2, random: true },
              move: {
                enable: true,
                speed: 0.5,
                direction: "outside",
                out_mode: "out",
              },
              links: { enable: false },
              shape: { type: "circle" },
              opacity: { value: 0.8, random: true },
            },
            interactivity: {
              detect_on: "canvas",
              events: { onhover: { enable: false } },
            },
            retina_detect: true,
          }}
        />
      )}

      <motion.canvas
        ref={canvasRef}
        className={`w-28 h-28 transition-all duration-500 ${
          isHovered ? "scale-110" : "scale-100"
        } will-change-transform`}
        whileHover={{ rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          className={`text-2xl font-bold transition-all duration-300 ${
            isHovered ? "text-3xl" : "text-2xl"
          }`}
          style={{
            color: color,
            textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
        >
          {Math.round(currentValue)}
        </motion.span>
        <motion.span
          className={`text-xs uppercase tracking-wider transition-all duration-300 ${
            isHovered ? "text-sm text-white" : "text-gray-300"
          }`}
          animate={{ opacity: isHovered ? 1 : 0.8 }}
        >
          {label}
        </motion.span>
      </div>
      {isHovered && (
        <motion.div
          className="absolute -bottom-6 bg-black/90 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Math.round(currentValue)} / {maxValue}
        </motion.div>
      )}
      <motion.div
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isHovered ? "opacity-30" : "opacity-20"
        }`}
        style={{
          background: color,
          boxShadow: `0 0 30px ${color}`,
        }}
        animate={{
          boxShadow: [
            `0 0 30px ${color}`,
            `0 0 50px ${color}`,
            `0 0 30px ${color}`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

const Charts = ({
  xp,
  maxXP,
  hp,
  maxHp,
  mana,
  maxMana,
  completedQuests = [],
}) => {
  const progressChartRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const neonPalette = {
    xp: {
      solid: "#00f0ff",
      gradient: ["#00f0ff", "#0055ff", "#0022ff"],
      line: ["#00f0ff", "#0088ff"],
    },
    hp: {
      solid: "#ff3a3a",
      gradient: ["#ff0000", "#ff5500", "#ff8800"],
      line: ["#ff3a3a", "#ff6b6b"],
    },
    mana: {
      solid: "#ff00ff",
      gradient: ["#ff00ff", "#aa00ff", "#7700ff"],
      line: ["#ff00ff", "#cc44ff"],
    },
  };

  const createGlassGradient = (ctx, colors) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    const color1 = colors[0].startsWith("rgba") ? colors[0] : `${colors[0]}ff`;
    const color2 = colors[1].startsWith("rgba") ? colors[1] : `${colors[1]}ff`;
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color1);
    return gradient;
  };

  const sortedQuests = [...completedQuests].sort(
    (a, b) =>
      new Date(a.completionTimestamp || 0) -
      new Date(b.completionTimestamp || 0)
  );

  const cumulativeXP = sortedQuests.reduce(
    (acc, quest) => {
      const last = acc.length ? acc[acc.length - 1] : 0;
      return [...acc, last + (quest.xp || 0)];
    },
    [0]
  );

  const progressChartData = {
    labels: sortedQuests.map((_, i) => `Quest ${i + 1}`),
    datasets: [
      {
        label: "Cumulative XP",
        data: cumulativeXP,
        fill: true,
        borderColor: (ctx) =>
          createGlassGradient(ctx.chart.ctx, neonPalette.xp.line),
        backgroundColor: (ctx) =>
          createGlassGradient(ctx.chart.ctx, [
            "rgba(0, 240, 255, 0.2)",
            "rgba(0, 136, 255, 0.4)",
          ]),
        borderWidth: 4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBackgroundColor: neonPalette.xp.solid,
        pointHoverBackgroundColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBorderWidth: 3,
        pointHoverBorderColor: neonPalette.xp.solid,
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      className="backdrop-blur-xl bg-gradient-to-b from-gray-900/80 to-gray-800/80 rounded-2xl p-6 shadow-2xl border border-white/10 mb-4 will-change-transform"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{
        boxShadow: "0 0 40px rgba(0,240,255,0.5)",
        transition: { duration: 0.3 },
      }}
    >
      <div className="flex justify-around mb-8 space-x-2">
        <RadialProgress
          value={xp}
          maxValue={maxXP}
          color={neonPalette.xp.solid}
          gradientColors={neonPalette.xp.gradient}
          label="XP"
          pulseRate={2500}
        />
        <RadialProgress
          value={hp}
          maxValue={maxHp}
          color={neonPalette.hp.solid}
          gradientColors={neonPalette.hp.gradient}
          label="HP"
          pulseRate={3500}
        />
        <RadialProgress
          value={mana}
          maxValue={maxMana}
          color={neonPalette.mana.solid}
          gradientColors={neonPalette.mana.gradient}
          label="Mana"
          pulseRate={4000}
        />
      </div>

      <div className="relative overflow-hidden rounded-xl p-4 bg-black/30 border border-white/10 transition-all duration-500 hover:border-cyan-400/30">
        <motion.h3
          className="text-xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider uppercase text-glow"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            textShadow: [
              "0 0 10px rgba(0,240,255,0.5)",
              "0 0 20px rgba(0,240,255,0.8)",
              "0 0 10px rgba(0,240,255,0.5)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ willChange: "background-position, text-shadow" }}
        >
          Quest Journey
        </motion.h3>

        {sortedQuests.length > 0 ? (
          <div className="relative h-64">
            <Line
              ref={progressChartRef}
              data={progressChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: "rgba(255, 255, 255, 0.05)",
                      borderDash: [5, 5],
                    },
                    ticks: {
                      color: "#ffffff90",
                      font: { size: 12 },
                      callback: (value) => `${value} XP`,
                    },
                    border: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "#ffffff60",
                      font: { size: 10 },
                      maxRotation: 45,
                      minRotation: 45,
                    },
                    border: { display: false },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    titleColor: neonPalette.xp.solid,
                    bodyColor: "#fff",
                    borderColor: neonPalette.xp.solid,
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      title: (items) => `Quest ${items[0].dataIndex + 1}`,
                      label: (context) => {
                        const currentXP = context.raw;
                        const prevXP =
                          context.dataset.data[context.dataIndex - 1] || 0;
                        const gained = currentXP - prevXP;
                        return [
                          `Total: ${currentXP} XP`,
                          gained > 0 ? `Gained: +${gained} XP` : "",
                        ];
                      },
                    },
                  },
                },
                interaction: {
                  intersect: false,
                  mode: "index",
                },
                animation: {
                  duration: 2000,
                  easing: "easeOutElastic",
                  onProgress: (animation) => {
                    const chart = animation.chart;
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.shadowColor = neonPalette.xp.solid;
                    ctx.shadowBlur = 15;
                    chart.draw();
                    ctx.restore();
                  },
                },
                elements: {
                  line: {
                    borderCapStyle: "round",
                    borderJoinStyle: "round",
                  },
                },
                onHover: (event, elements) => {
                  setHoveredPoint(elements[0]?.index);
                },
              }}
            />
            {hoveredPoint !== null && (
              <motion.div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${
                    (hoveredPoint / (sortedQuests.length - 1)) * 100
                  }% 50%, rgba(0, 240, 255, 0.2), transparent 70%)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {sortedQuests.map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  left: `${(i / (sortedQuests.length - 1)) * 100}%`,
                  bottom: `${
                    (cumulativeXP[i] / Math.max(...cumulativeXP)) * 100
                  }%`,
                  background: neonPalette.xp.solid,
                  boxShadow: `0 0 8px ${neonPalette.xp.solid}`,
                  willChange: "transform, opacity",
                }}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <div className="w-16 h-16 border-t-4 border-cyan-400 rounded-full"></div>
            </motion.div>
            <motion.p
              className="text-gray-400 text-center text-lg"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Begin your adventure to see progress!
            </motion.p>
          </div>
        )}
      </div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-600/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-600/10 rounded-full filter blur-3xl -z-10"></div>
    </motion.div>
  );
};

export default Charts;
