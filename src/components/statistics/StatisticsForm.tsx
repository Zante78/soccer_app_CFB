import React, { useState } from 'react';
import { GameStatistics } from '../../types/statistics';

interface StatisticsFormProps {
  onSave: (statistics: Omit<GameStatistics, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function StatisticsForm({ onSave, onCancel }: StatisticsFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    minutesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Datum</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Spielminuten</label>
        <input
          type="number"
          min="0"
          max="120"
          value={formData.minutesPlayed}
          onChange={(e) => setFormData({ ...formData, minutesPlayed: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tore</label>
          <input
            type="number"
            min="0"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assists</label>
          <input
            type="number"
            min="0"
            value={formData.assists}
            onChange={(e) => setFormData({ ...formData, assists: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Gelbe Karten</label>
          <input
            type="number"
            min="0"
            max="2"
            value={formData.yellowCards}
            onChange={(e) => setFormData({ ...formData, yellowCards: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rote Karten</label>
          <input
            type="number"
            min="0"
            max="1"
            value={formData.redCards}
            onChange={(e) => setFormData({ ...formData, redCards: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
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