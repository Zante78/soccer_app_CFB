```tsx
import React, { useState } from 'react';
import { Player } from '../../types/player';
import { Skill, SkillCategory } from '../../types/core/skills';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerEvaluationProps {
  player: Player;
  skills: Skill[];
  categories: SkillCategory[];
  onSave: (evaluations: { skillId: string; value: number }[]) => void;
}

export function PlayerEvaluation({ player, skills, categories, onSave }: PlayerEvaluationProps) {
  const [evaluations, setEvaluations] = useState<Record<string, number>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    categories.map(c => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSkillChange = (skillId: string, value: number) => {
    setEvaluations(prev => ({
      ...prev,
      [skillId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluationArray = Object.entries(evaluations).map(([skillId, value]) => ({
      skillId,
      value
    }));
    onSave(evaluationArray);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        {categories.map(category => (
          <div key={category.id} className="border-b border-gray-200 last:border-b-0">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              {expandedCategories.includes(category.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="px-4 pb-4 space-y-4">
                {skills
                  .filter(skill => skill.categoryId === category.id)
                  .map(skill => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {skill.name}
                        </label>
                        <span className="text-sm font-medium text-gray-900">
                          {evaluations[skill.id]?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={evaluations[skill.id] || 0}
                        onChange={(e) => handleSkillChange(skill.id, parseFloat(e.target.value))}
                        className="w-full"
                      />
                      {skill.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Bewertung speichern
        </button>
      </div>
    </form>
  );
}
```