```tsx
import React, { useState } from 'react';
import { SkillCategory } from '../../types/core/skills';
import { Plus, Minus } from 'lucide-react';

interface SkillCategoryFormProps {
  onSave: (category: Omit<SkillCategory, 'id'>) => void;
  onCancel: () => void;
}

export function SkillCategoryForm({ onSave, onCancel }: SkillCategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: 1.0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Kategoriename
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
          Gewichtung (0-1)
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              weight: Math.max(0, prev.weight - 0.1)
            }))}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
            step="0.1"
            min="0"
            max="1"
            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              weight: Math.min(1, prev.weight + 0.1)
            }))}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Plus size={16} />
          </button>
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