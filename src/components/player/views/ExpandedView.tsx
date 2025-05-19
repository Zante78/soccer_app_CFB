import React, { useState } from 'react';
import { Player } from '../../../types/player';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandedViewProps {
  player: Player;
}

export function ExpandedView({ player }: ExpandedViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getValueColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-gray-600">{player.position || 'Keine Position'}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className={`space-y-4 overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {Object.entries(
          player.skills.reduce((acc, skill) => {
            acc[skill.category] = acc[skill.category] || [];
            acc[skill.category].push(skill);
            return acc;
          }, {} as Record<string, typeof player.skills>)
        ).map(([category, skills]) => (
          <div key={category} className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <div className="space-y-2">
              {skills.map(skill => (
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
        ))}
      </div>
    </div>
  );
}