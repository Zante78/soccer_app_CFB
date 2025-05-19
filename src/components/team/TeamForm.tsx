import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Team } from '../../types/core/team';

interface TeamFormProps {
  team?: Team;
  onSave: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

export function TeamForm({ team, onSave, onClose }: TeamFormProps) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    category: team?.category || '',
    season: team?.season || new Date().getFullYear().toString(),
    photo_url: team?.photo_url || '',
    colors: team?.colors || {
      primary: '#000000',
      secondary: '#ffffff'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {team ? 'Team bearbeiten' : 'Neues Team'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
              title="Schließen (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kategorie</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Saison</label>
              <input
                type="text"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Primärfarbe</label>
                <input
                  type="color"
                  value={formData.colors.primary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, primary: e.target.value }
                  })}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sekundärfarbe</label>
                <input
                  type="color"
                  value={formData.colors.secondary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, secondary: e.target.value }
                  })}
                  className="mt-1 block w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
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
        </div>
      </div>
    </div>
  );
}