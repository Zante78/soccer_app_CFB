import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Team } from '../../../types/core/team';
import { TeamGrid } from './TeamGrid';

interface TeamListProps {
  teams: Team[];
  onAddTeam: () => void;
  onSelectTeam: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
  onUpdateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
  onShowPlayers: () => void;
}

export function TeamList({ 
  teams = [], 
  onAddTeam, 
  onSelectTeam, 
  onEditTeam,
  onDeleteTeam,
  onUpdateTeam,
  onShowPlayers
}: TeamListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
        <div className="flex gap-4">
          <button
            onClick={onShowPlayers}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Users className="w-4 h-4" />
            Spielerverwaltung
          </button>
          <button
            onClick={onAddTeam}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Neues Team
          </button>
        </div>
      </div>
      
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Noch keine Teams vorhanden</p>
          <button
            onClick={onAddTeam}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Erstellen Sie Ihr erstes Team
          </button>
        </div>
      ) : (
        <TeamGrid 
          teams={teams}
          onSelectTeam={onSelectTeam}
          onEditTeam={onEditTeam}
          onDeleteTeam={onDeleteTeam}
          onUpdateTeam={onUpdateTeam}
        />
      )}
    </div>
  );
}