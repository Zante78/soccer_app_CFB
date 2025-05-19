```tsx
import React, { useState } from 'react';
import { Skill, SkillCategory } from '../../types/core/skills';
import { PlayerPosition } from '../../types/core/player';

interface SkillFormProps {
  categories: SkillCategory[];
  onSave: (skill: Omit<Skill, 'id'>) => void;
  onCancel: () => void;
}

const POSITIONS: PlayerPosition[] = [
  'goalkeeper',
  'defender',
  'midfielder',
  'forward',
  'centerBack',
  'fullBack',
  'defensiveMid',
  'attackingMid',
  'winger',
  'striker'
];

export function SkillForm({ categories, onSave, onCancel }: SkillFormProps) {
  const [formData, setFormData] = useState<Omit<Skill, 'id'>>({
    categoryId: categories[0]?.id || '',
    name: '',
    description: '',
    weight: 1.0,
    customizable: true,
    applicablePositions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const togglePosition = (position: PlayerPosition) => {
    setFormData(prev => ({
      ...prev,
      applicablePositions: prev.applicablePositions?.includes(position)
        ? prev.applicablePositions.filter(p => p !== position)
        : [...(prev.applicablePositions || []), position]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Kategorie
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fähigkeitsname
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Beschreibung
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Anwendbare Positionen
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {POSITIONS.map(position => (
            <label key={position} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.applicablePositions?.includes(position)}
                onChange={() => togglePosition(position)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {position}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Speichern
        </button>
      </div>
    </form>
  );
}
```