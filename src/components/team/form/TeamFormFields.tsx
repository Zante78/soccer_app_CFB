import React from 'react';
import { Team } from '../../../types/core/team';

interface TeamFormFieldsProps {
  formData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;
  onChange: (field: string, value: any) => void;
}

export function TeamFormFields({ formData, onChange }: TeamFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Teamname</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Kategorie</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          placeholder="z.B. U19, Erste Mannschaft"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Saison</label>
        <input
          type="text"
          value={formData.season}
          onChange={(e) => onChange('season', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Foto URL</label>
        <input
          type="url"
          value={formData.photoUrl}
          onChange={(e) => onChange('photoUrl', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Primärfarbe</label>
          <input
            type="color"
            value={formData.colors.primary}
            onChange={(e) => onChange('colors', { ...formData.colors, primary: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sekundärfarbe</label>
          <input
            type="color"
            value={formData.colors.secondary}
            onChange={(e) => onChange('colors', { ...formData.colors, secondary: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
      </div>
    </>
  );
}