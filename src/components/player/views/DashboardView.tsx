import React from 'react';
import { Player } from '../../../types/player';

interface DashboardViewProps {
  player: Player;
}

export function DashboardView({ player }: DashboardViewProps) {
  const averageRating = player.skills.length > 0 
    ? player.skills.reduce((sum, skill) => sum + skill.value, 0) / player.skills.length
    : 0;

  const getValueColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-gray-600">{player.position || 'Keine Position'}</p>
        </div>
        <div className={`text-2xl font-bold ${getValueColor(averageRating)}`}>
          {averageRating.toFixed(1)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(
          player.skills.reduce((acc, skill) => {
            acc[skill.category] = acc[skill.category] || [];
            acc[skill.category].push(skill);
            return acc;
          }, {} as Record<string, typeof player.skills>)
        ).map(([category, skills]) => {
          const avgValue = skills.reduce((sum, s) => sum + s.value, 0) / skills.length;
          return (
            <div key={category} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                <span className={`text-sm font-bold ${getValueColor(avgValue)}`}>
                  {avgValue.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    avgValue >= 16 ? 'bg-green-500' :
                    avgValue >= 12 ? 'bg-blue-500' :
                    avgValue >= 8 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${(avgValue / 20) * 100}%` }}
                />
              </div>
              <div className="mt-2 space-y-1">
                {skills.slice(0, 3).map(skill => (
                  <div key={skill.name} className="flex justify-between text-xs">
                    <span className="text-gray-600">{skill.name}</span>
                    <span className={getValueColor(skill.value)}>{skill.value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}