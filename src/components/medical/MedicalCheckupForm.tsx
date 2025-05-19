import React, { useState } from 'react';
import { MedicalCheckup } from '../../types/core/medical';

interface MedicalCheckupFormProps {
  onSave: (checkup: Omit<MedicalCheckup, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function MedicalCheckupForm({ onSave, onCancel }: MedicalCheckupFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'routine' as MedicalCheckup['type'],
    findings: '',
    recommendations: '',
    nextCheckupDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium text-gray-700">Art der Untersuchung</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MedicalCheckup['type'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="routine">Routine</option>
            <option value="injury-related">Verletzungsbedingt</option>
            <option value="pre-season">Saisonvorbereitung</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Befunde</label>
        <textarea
          value={formData.findings}
          onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Empfehlungen</label>
        <textarea
          value={formData.recommendations}
          onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nächste Untersuchung</label>
        <input
          type="date"
          value={formData.nextCheckupDate}
          onChange={(e) => setFormData({ ...formData, nextCheckupDate: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-4">
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