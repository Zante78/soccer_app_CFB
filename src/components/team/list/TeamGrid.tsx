import React from 'react';
import { Team } from '../../../types/core/team';
import { TeamCard } from './TeamCard';

interface TeamGridProps {
  teams: Team[];
  onSelectTeam: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
  onUpdateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
}

export function TeamGrid({ 
  teams, 
  onSelectTeam, 
  onEditTeam, 
  onDeleteTeam,
  onUpdateTeam
}: TeamGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          onClick={() => onSelectTeam(team)}
          onEdit={() => onEditTeam(team)}
          onDelete={() => onDeleteTeam(team.id)}
          onUpdate={(updates) => onUpdateTeam(team.id, updates)}
        />
      ))}
    </div>
  );
}