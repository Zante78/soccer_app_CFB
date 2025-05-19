import React, { memo } from 'react';
import { Radar } from 'react-chartjs-2';
import { Player } from '../../../types/player';
import './ChartConfig';

interface SkillsRadarProps {
  player: Player;
}

const SkillsRadar = memo(function SkillsRadar({ player }: SkillsRadarProps) {
  const data = {
    labels: player.skills.map(s => s.name),
    datasets: [{
      label: 'Fähigkeiten',
      data: player.skills.map(s => s.value),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 20
      }
    }
  };

  return (
    <div className="h-[300px]">
      <Radar data={data} options={options} />
    </div>
  );
});

export default SkillsRadar;