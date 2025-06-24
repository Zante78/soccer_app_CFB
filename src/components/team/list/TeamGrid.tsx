import React from 'react';
import { Team } from '../../../types/core/team';
import { TeamCard } from './TeamCard';
import { ViewMode } from './TeamList';

interface TeamGridProps {
  teams: Team[];
  viewMode: ViewMode;
  onSelectTeam: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;
  onUpdateTeam: (id: string, updates: Partial<Team>) => Promise<void>;
}

export function TeamGrid({ 
  teams, 
  viewMode,
  onSelectTeam, 
  onEditTeam, 
  onDeleteTeam,
  onUpdateTeam
}: TeamGridProps) {
  return (
    <div className={`
      ${viewMode === 'large-grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
      ${viewMode === 'small-grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : ''}
      ${viewMode === 'list' ? 'space-y-4' : ''}
      ${viewMode === 'detail-list' ? 'space-y-4' : ''}
    `}>
      {teams.map(team => (
        <TeamCard
          key={team.id}
          team={team}
          viewMode={viewMode}
          onClick={() => onSelectTeam(team)}
          onEdit={() => onEditTeam(team)}
          onDelete={() => onDeleteTeam(team.id)}
          onUpdate={(updates) => onUpdateTeam(team.id, updates)}
        />
      ))}
    </div>
  );
}