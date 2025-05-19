import React from 'react';
import { Player } from '../../../types/player';

interface TabViewProps {
  player: Player;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabView({ player, activeTab, onTabChange }: TabViewProps) {
  const getSkillColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        {['übersicht', 'fähigkeiten', 'statistiken'].map(tab => (
          <button
            key={tab}
            onClick={(e) => {
              e.stopPropagation();
              onTabChange(tab);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === tab 
                ? 'bg-blue-100 text-blue-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'übersicht' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-gray-600 mt-1">{player.position || 'Keine Position'}</p>
            {player.dateOfBirth && (
              <p className="text-sm text-gray-500 mt-2">
                {new Date(player.dateOfBirth).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {activeTab === 'fähigkeiten' && (
          <div className="space-y-4">
            {Object.entries(
              player.skills.reduce((acc, skill) => {
                acc[skill.category] = acc[skill.category] || [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, typeof player.skills>)
            ).map(([category, skills]) => (
              <div key={category} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h4>
                <div className="space-y-2">
                  {skills.map(skill => (
                    <div key={skill.name} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 truncate">{skill.name}</span>
                          <span className={`text-sm font-medium ${getSkillColor(skill.value)}`}>
                            {skill.value.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-blue-600"
                            style={{ width: `${(skill.value / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'statistiken' && (
          <div className="text-center text-gray-500 py-8">
            Keine Statistiken verfügbar
          </div>
        )}
      </div>
    </div>
  );
}