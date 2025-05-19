import React from 'react';
import { Plus } from 'lucide-react';

interface TeamListHeaderProps {
  onAddTeam: () => void;
}

export function TeamListHeader({ onAddTeam }: TeamListHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
      <button
        onClick={onAddTeam}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        <Plus size={16} />
        Neues Team
      </button>
    </div>
  );
}