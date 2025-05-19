import React from 'react';
import { Skill, SkillCategory } from '../../types/core/skills';
import { Star } from 'lucide-react';

interface EvaluationSummaryProps {
  skills: Skill[];
  categories: SkillCategory[];
  overallRating: number;
}

export function EvaluationSummary({ skills, categories, overallRating }: EvaluationSummaryProps) {
  const getValueColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Gesamtbewertung</h3>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          <span className={`text-3xl font-bold ${getValueColor(overallRating)}`}>
            {overallRating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(category => {
          const categorySkills = skills.filter(s => s.categoryId === category.id);
          const avgValue = categorySkills.reduce((sum, skill) => sum + skill.value, 0) / categorySkills.length;
          
          return (
            <div key={category.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
                <div className="text-xs text-gray-500">Gewichtung: {(category.weight * 100).toFixed(0)}%</div>
              </div>
              <span className={`text-lg font-semibold ${getValueColor(avgValue)}`}>
                {avgValue.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}