import React, { memo } from 'react';
import { Line } from 'react-chartjs-2';
import { Player } from '../../../types/player';
import './ChartConfig';

interface SkillsChartProps {
  player: Player;
}

const SkillsChart = memo(function SkillsChart({ player }: SkillsChartProps) {
  const data = {
    labels: player.skills.map(s => s.name),
    datasets: [{
      label: 'Fähigkeiten',
      data: player.skills.map(s => s.value),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.3
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 20
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Line data={data} options={options} />
    </div>
  );
});

export default SkillsChart;