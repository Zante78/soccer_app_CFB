import React from 'react';
import { PlayerHistory } from '../../types/statistics';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SkillsHistoryProps {
  history: PlayerHistory[];
  selectedSkills: string[];
}

export default function SkillsHistory({ history, selectedSkills }: SkillsHistoryProps) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedHistory.map(h => 
    new Date(h.date).toLocaleDateString()
  );

  const datasets = selectedSkills.map(skillName => {
    const data = sortedHistory.map(h => 
      h.skills.find(s => s.name === skillName)?.value || 0
    );

    return {
      label: skillName,
      data,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.3,
    };
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Entwicklung der Fähigkeiten',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 20,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
}