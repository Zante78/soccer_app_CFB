import React from 'react';
import { SkillCategory, Skill } from '../../types/core/skills';
import { SkillRatingInput } from './SkillRatingInput';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CategoryEvaluationProps {
  category: SkillCategory;
  skills: Skill[];
  evaluations: Record<string, number>;
  previousEvaluations?: Record<string, number>;
  onSkillChange: (skillId: string, value: number) => void;
}

export function CategoryEvaluation({
  category,
  skills,
  evaluations,
  previousEvaluations,
  onSkillChange
}: CategoryEvaluationProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const calculateCategoryAverage = () => {
    const values = skills.map(skill => evaluations[skill.id] || 0);
    return values.length > 0
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
  };

  const getAverageColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const average = calculateCategoryAverage();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
          {category.description && (
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
              <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-800"></div>
                {category.description}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-lg font-medium ${getAverageColor(average)} transition-colors`}>
            Ø {average.toFixed(1)}
          </div>
          <div className="transition-transform duration-300">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-6 space-y-4 bg-gray-50">
          {skills.map(skill => (
            <SkillRatingInput
              key={skill.id}
              skill={skill}
              value={evaluations[skill.id] || 0}
              previousValue={previousEvaluations?.[skill.id]}
              onChange={(value) => onSkillChange(skill.id, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}