import React from 'react';
import { Skill } from '../../types/core/skills';
import { HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface SkillRatingInputProps {
  skill: Skill;
  value: number;
  onChange: (value: number) => void;
  previousValue?: number;
}

export function SkillRatingInput({ skill, value, onChange, previousValue }: SkillRatingInputProps) {
  const getValueColor = (val: number) => {
    if (val >= 16) return 'bg-green-500';
    if (val >= 12) return 'bg-blue-500';
    if (val >= 8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (val: number) => {
    if (val >= 16) return 'text-green-600';
    if (val >= 12) return 'text-blue-600';
    if (val >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!previousValue) return null;
    const diff = value - previousValue;
    if (diff > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (diff < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getTrendPercentage = () => {
    if (!previousValue) return null;
    const diff = value - previousValue;
    const percentage = (diff / previousValue) * 100;
    return percentage.toFixed(1);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">{skill.name}</span>
            {skill.description && (
              <div className="group/tooltip relative">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover/tooltip:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-800"></div>
                  {skill.description}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              {getTrendPercentage() && (
                <span className={`text-xs font-medium ${value > previousValue! ? 'text-green-500' : 'text-red-500'}`}>
                  {value > previousValue! ? '+' : ''}{getTrendPercentage()}%
                </span>
              )}
            </div>
            <span className={`text-sm font-bold ${getTextColor(value)}`}>
              {value.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out transform scale-x-0 group-hover:scale-x-100 ${getValueColor(value)} opacity-50`}
            style={{ width: `${(value / 20) * 100}%`, transformOrigin: 'left' }}
          />
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getValueColor(value)}`}
            style={{ width: `${(value / 20) * 100}%` }}
          />
        </div>
        
        <div className="relative pt-1 pb-2">
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-transparent appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-blue-600 
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-webkit-slider-thumb]:hover:bg-blue-700
              [&::-webkit-slider-thumb]:active:scale-95
              
              [&::-moz-range-thumb]:h-4
              [&::-moz-range-thumb]:w-4
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-600
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:hover:scale-110
              [&::-moz-range-thumb]:hover:bg-blue-700
              [&::-moz-range-thumb]:active:scale-95
              
              [&::-ms-thumb]:h-4
              [&::-ms-thumb]:w-4
              [&::-ms-thumb]:rounded-full
              [&::-ms-thumb]:bg-blue-600
              [&::-ms-thumb]:border-0
              [&::-ms-thumb]:shadow-md
              [&::-ms-thumb]:transition-all
              [&::-ms-thumb]:hover:scale-110
              [&::-ms-thumb]:hover:bg-blue-700
              [&::-ms-thumb]:active:scale-95"
          />
          <div className="absolute -bottom-1 left-0 w-full flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20</span>
          </div>
        </div>
      </div>
    </div>
  );
}