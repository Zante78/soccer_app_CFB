```tsx
import React, { useState } from 'react';
import { SkillCategory, Skill } from '../../types/core/skills';
import { SkillCategoryForm } from './SkillCategoryForm';
import { SkillForm } from './SkillForm';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface SkillManagerProps {
  categories: SkillCategory[];
  skills: Skill[];
  onAddCategory: (category: Omit<SkillCategory, 'id'>) => void;
  onAddSkill: (skill: Omit<Skill, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteSkill: (id: string) => void;
}

export function SkillManager({
  categories,
  skills,
  onAddCategory,
  onAddSkill,
  onDeleteCategory,
  onDeleteSkill
}: SkillManagerProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Kategorien</h3>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Neue Kategorie
          </button>
        </div>

        {showCategoryForm && (
          <div className="mb-4">
            <SkillCategoryForm
              onSave={(category) => {
                onAddCategory(category);
                setShowCategoryForm(false);
              }}
              onCancel={() => setShowCategoryForm(false)}
            />
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map(category => (
              <li key={category.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Gewichtung: {category.weight}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Fähigkeiten</h3>
          <button
            onClick={() => setShowSkillForm(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} />
            Neue Fähigkeit
          </button>
        </div>

        {showSkillForm && (
          <div className="mb-4">
            <SkillForm
              categories={categories}
              onSave={(skill) => {
                onAddSkill(skill);
                setShowSkillForm(false);
              }}
              onCancel={() => setShowSkillForm(false)}
            />
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {skills.map(skill => (
              <li key={skill.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {skill.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {skill.description}
                    </p>
                    {skill.applicablePositions && skill.applicablePositions.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {skill.applicablePositions.map(position => (
                          <span
                            key={position}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {position}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteSkill(skill.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```