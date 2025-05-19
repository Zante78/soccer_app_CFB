import React from 'react';
import { Team } from '../../../types/core/team';
import { X } from 'lucide-react';

interface TeamFormHeaderProps {
  team?: Team;
  onClose: () => void;
}

export function TeamFormHeader({ team, onClose }: TeamFormHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {team ? 'Team bearbeiten' : 'Neues Team'}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>
    </div>
  );
}