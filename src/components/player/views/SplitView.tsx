import React from 'react';
import { Player } from '../../../types/player';
import { Users, Calendar, Ruler, Weight } from 'lucide-react';

interface SplitViewProps {
  player: Player;
}

export function SplitView({ player }: SplitViewProps) {
  const getValueColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const topSkills = [...player.skills]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {player.firstName} {player.lastName}
        </h3>
        <p className="text-gray-600">{player.position || 'Keine Position'}</p>
        
        {/* Team information */}
        {player.teamName ? (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <Users className="w-4 h-4 mr-1" />
            <span>Team: {player.teamName}</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500 italic">Keinem Team zugewiesen</p>
        )}
        
        {/* Additional Player Info */}
        {player.dateOfBirth && (
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>Geboren: {new Date(player.dateOfBirth).toLocaleDateString()}</span>
          </div>
        )}
        {player.height && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Ruler className="w-4 h-4 mr-1" />
            <span>Größe: {player.height} cm</span>
          </div>
        )}
        {player.weight && (
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <Weight className="w-4 h-4 mr-1" />
            <span>Gewicht: {player.weight} kg</span>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Top Fähigkeiten</h4>
        <div className="space-y-2">
          {topSkills.map(skill => (
            <div key={skill.name} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 truncate">{skill.name}</span>
                  <span className={`text-sm font-medium ${getValueColor(skill.value)}`}>
                    {skill.value.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      skill.value >= 16 ? 'bg-green-500' :
                      skill.value >= 12 ? 'bg-blue-500' :
                      skill.value >= 8 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(skill.value / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}