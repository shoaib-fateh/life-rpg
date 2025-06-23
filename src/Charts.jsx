import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { ArcElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { createGradient } from 'chartjs-plugin-gradient';

// ثبت پلاگین‌ها
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

// کامپوننت RadialProgress برای XP, HP, Mana
const RadialProgress = ({ value, maxValue, color, label, gradient }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    const chart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [value, maxValue - value],
            backgroundColor: [gradient, 'rgba(255, 255, 255, 0.1)'],
            borderWidth: 0,
            borderRadius: 10,
            cutout: '80%',
            circumference: 360,
            rotation: 270,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: { display: false },
          tooltip: { enabled: false },
        },
        animation: {
          duration: 2000,
          easing: 'easeOutElastic',
        },
      },
    });

    // افکت پالس
    const pulse = () => {
      chart.data.datasets[0].backgroundColor[0] = gradient;
      chart.update();
      setTimeout(() => {
        chart.data.datasets[0].backgroundColor[0] = color;
        chart.update();
      }, 500);
    };
    const interval = setInterval(pulse, 3000);

    return () => {
      chart.destroy();
      clearInterval(interval);
    };
  }, [value, maxValue, color, gradient]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas ref={canvasRef} className="w-24 h-24" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold text-white drop-shadow-glow">{value}</span>
        <span className="text-xs text-gray-300">{label}</span>
      </div>
      <div className="absolute inset-0 animate-pulse opacity-20 rounded-full" style={{ background: color }} />
    </div>
  );
};

const Charts = ({ xp, maxXP, hp, maxHp, mana, maxMana, completedQuests = [] }) => {
  const progressChartRef = useRef(null);

  // گرادیانت‌های نئونی
  const createChartGradient = (ctx, color1, color2) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
  };

  // داده‌های Quest Progress
  const sortedQuests = [...completedQuests].sort((a, b) =>
    new Date(a.completionTimestamp || 0) - new Date(b.completionTimestamp || 0)
  );
  const cumulativeXP = sortedQuests.reduce((acc, quest) => {
    const last = acc.length ? acc[acc.length - 1] : 0;
    return [...acc, last + (quest.xp || 0)];
  }, [0]);

  const progressChartData = {
    labels: Array(cumulativeXP.length).fill(''), // بدون لیبل
    datasets: [
      {
        label: 'Cumulative XP',
        data: cumulativeXP,
        fill: true,
        borderColor: (ctx) => createChartGradient(ctx.chart.ctx, '#5a5af0', '#ff00ff'),
        backgroundColor: (ctx) =>
          createChartGradient(ctx.chart.ctx, 'rgba(90, 90, 240, 0.3)', 'rgba(255, 0, 255, 0.1)'),
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="backdrop-blur-xl bg-gradient-to-b from-gray-900/50 to-gray-800/50 rounded-2xl p-6 shadow-2xl border border-white/10 mb-4 animate-fade-in">
      {/* چارت‌های XP, HP, Mana */}
      <div className="flex justify-around mb-8">
        <RadialProgress
          value={xp}
          maxValue={maxXP}
          color="#5a5af0"
          gradient="rgba(90, 90, 240, 0.8)"
          label="XP"
        />
        <RadialProgress
          value={hp}
          maxValue={maxHp}
          color="#ff4d4d"
          gradient="rgba(255, 77, 77, 0.8)"
          label="HP"
        />
        <RadialProgress
          value={mana}
          maxValue={maxMana}
          color="#8a2be2"
          gradient="rgba(138, 43, 226, 0.8)"
          label="Mana"
        />
      </div>

      {/* Quest Progress */}
      <div>
        <h3 className="text-xl font-bold text-purple-400 mb-4 text-center drop-shadow-glow">
          Quest Progress
        </h3>
        {sortedQuests.length > 0 ? (
          <div className="relative">
            <Line
              ref={progressChartRef}
              data={progressChartData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#fff', font: { size: 12 } },
                    title: { display: false },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { display: false },
                  },
                },
                plugins: {
                  datalabels: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#5a5af0',
                    borderWidth: 1,
                  },
                },
                animation: {
                  duration: 2000,
                  easing: 'easeOutQuad',
                  onProgress: (animation) => {
                    const chart = animation.chart;
                    const ctx = chart.ctx;
                    ctx.save();
                    ctx.shadowColor = '#5a5af0';
                    ctx.shadowBlur = 10;
                    chart.draw();
                    ctx.restore();
                  },
                },
                elements: {
                  line: { borderCapStyle: 'round' },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-gray-400 text-center animate-pulse">
            No completed quests yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Charts;