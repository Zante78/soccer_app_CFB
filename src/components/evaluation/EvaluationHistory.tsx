```tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { PlayerHistory } from '../../types/statistics';
import { Skill, SkillCategory } from '../../types/core/skills';

interface EvaluationHistoryProps {
  history: PlayerHistory[];
  skills: Skill[];
  categories: SkillCategory[];
  selectedSkills: string[];
  onSelectSkill: (skillId: string) => void;
}

export function EvaluationHistory({
  history,
  skills,
  categories,
  selectedSkills,
  onSelectSkill
}: EvaluationHistoryProps) {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedHistory.map(h => new Date(h.date).toLocaleDateString()),
    datasets: selectedSkills.map(skillId => {
      const skill = skills.find(s => s.id === skillId);
      return {
        label: skill?.name || '',
        data: sortedHistory.map(h => 
          h.skills.find(s => s.name === skill?.name)?.value || 0
        ),
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        tension: 0.3
      };
    })
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Entwicklung der Fähigkeiten'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 20
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Fähigkeiten auswählen
        </h3>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category.id}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {category.name}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {skills
                  .filter(skill => skill.categoryId === category.id)
                  .map(skill => (
                    <label key={skill.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => onSelectSkill(skill.id)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {skill.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
```