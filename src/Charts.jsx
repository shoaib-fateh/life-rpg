import React, { useRef } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, LineElement, PointElement);

const Charts = ({ xp, maxXP, hp, maxHp, mana, maxMana, completedQuests = [] }) => {
  const xpChartRef = useRef(null);
  const hpChartRef = useRef(null);
  const manaChartRef = useRef(null);
  const progressChartRef = useRef(null);

  const xpChartData = {
    labels: ['XP'],
    datasets: [
      {
        label: 'XP',
        data: [xp],
        backgroundColor: ['#5a5af0'],
        borderColor: ['#5a5af0'],
        borderWidth: 1,
      },
    ],
  };

  const hpChartData = {
    labels: ['HP'],
    datasets: [
      {
        label: 'HP',
        data: [hp],
        backgroundColor: ['#ff4d4d'],
        borderColor: ['#ff4d4d'],
        borderWidth: 1,
      },
    ],
  };

  const manaChartData = {
    labels: ['Mana'],
    datasets: [
      {
        label: 'Mana',
        data: [mana],
        backgroundColor: ['#8a2be2'],
        borderColor: ['#8a2be2'],
        borderWidth: 1,
      },
    ],
  };

  const sortedQuests = [...completedQuests].sort((a, b) => new Date(a.completionTimestamp || 0) - new Date(b.completionTimestamp || 0));
  const cumulativeXP = sortedQuests.reduce((acc, quest) => {
    const last = acc.length ? acc[acc.length - 1] : 0;
    return [...acc, last + (quest.xp || 0)];
  }, [0]);

  const progressChartData = {
    labels: ['Start', ...sortedQuests.map((_, i) => `Quest ${i + 1}`)],
    datasets: [
      {
        label: 'Cumulative XP',
        data: cumulativeXP,
        fill: false,
        borderColor: '#5a5af0',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 shadow-lg mb-2">
      <div className="flex space-x-4 mb-4">
        <div className="w-1/3">
          <Bar
            ref={xpChartRef}
            data={xpChartData}
            options={{
              scales: { y: { beginAtZero: true, max: maxXP } },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
        <div className="w-1/3">
          <Bar
            ref={hpChartRef}
            data={hpChartData}
            options={{
              scales: { y: { beginAtZero: true, max: maxHp } },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
        <div className="w-1/3">
          <Bar
            ref={manaChartRef}
            data={manaChartData}
            options={{
              scales: { y: { beginAtZero: true, max: maxMana } },
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-purple-400 mb-2">Quest Progress</h3>
        {sortedQuests.length > 0 ? (
          <Line
            ref={progressChartRef}
            data={progressChartData}
            options={{
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'XP' } },
                x: { title: { display: true, text: 'Completed Quests' } },
              },
              plugins: { legend: { display: true } },
            }}
          />
        ) : (
          <p className="text-gray-400 text-center">No completed quests yet.</p>
        )}
      </div>
    </div>
  );
};

export default Charts;