import React from 'react';
import { Line } from 'react-chartjs-2';
import { GameStatistics } from '../../types/statistics';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsChartProps {
  statistics: GameStatistics[];
  metric: 'goals' | 'assists' | 'minutesPlayed';
}

export function StatisticsChart({ statistics, metric }: StatisticsChartProps) {
  const sortedStats = [...statistics].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = {
    labels: sortedStats.map(stat => new Date(stat.date).toLocaleDateString()),
    datasets: [{
      label: metric === 'minutesPlayed' ? 'Spielminuten' : 
             metric === 'goals' ? 'Tore' : 'Assists',
      data: sortedStats.map(stat => stat[metric]),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.3
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${metric === 'minutesPlayed' ? 'Spielminuten' : 
               metric === 'goals' ? 'Tore' : 'Assists'} pro Spiel`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
}