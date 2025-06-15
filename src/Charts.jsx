import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const Charts = ({ xp, maxXP, hp, maxHp, mana, maxMana }) => {
  const xpChartRef = useRef(null);
  const hpChartRef = useRef(null);
  const manaChartRef = useRef(null);

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

  return (
    <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-lg p-4 shadow-lg flex space-x-4">
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
  );
};

export default Charts;