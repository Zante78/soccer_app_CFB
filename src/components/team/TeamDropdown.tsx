import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Team } from '../../types/core/team';

interface TeamDropdownProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export function TeamDropdown({ teams, onSelectTeam }: TeamDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <Users size={16} />
        Teams
        {isOpen ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  onSelectTeam(team);
                  setIsOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span>{team.name}</span>
                  <span className="text-xs text-gray-500">{team.category}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}