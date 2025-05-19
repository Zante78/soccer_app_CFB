import React, { useState } from 'react';
import { Team } from '../../types/core/team';
import { usePlayerStore } from '../../store/playerStore';
import { PlayerList } from '../player/PlayerList';
import { PlayerForm } from '../player/PlayerForm';
import { TeamName } from './TeamName';
import { UserPlus } from 'lucide-react';
import { AddMemberForm } from './members/AddMemberForm';
import { TeamService } from '../../services/team.service';
import { TeamErrorBoundary } from '../common/TeamErrorBoundary';

interface TeamDetailsProps {
  team: Team;
  onBack: () => void;
  onUpdate: (id: string, team: Partial<Team>) => Promise<void>;
}

export function TeamDetails({ team, onBack, onUpdate }: TeamDetailsProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(team);
  const { getPlayersByTeam } = usePlayerStore();
  
  let teamService: TeamService | null = null;
  try {
    teamService = new TeamService();
  } catch (err) {
    console.error('Failed to initialize TeamService:', err);
  }

  const teamPlayers = getPlayersByTeam(team.id);

  const handleNameChange = async (newName: string) => {
    try {
      await onUpdate(team.id, { name: newName });
      setCurrentTeam(prev => ({ ...prev, name: newName }));
    } catch (error) {
      throw error;
    }
  };

  const handleAddMember = async (playerId: string, role: 'player' | 'captain' | 'viceCaptain') => {
    try {
      if (!teamService) {
        throw new Error('TeamService nicht verfügbar');
      }
      await teamService.addTeamMember(team.id, playerId, role);
      window.location.reload(); // Reload to update the UI
    } catch (error) {
      throw error;
    }
  };

  return (
    <TeamErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <TeamName name={currentTeam.name} onSave={handleNameChange} />
            <p className="text-sm text-gray-500">{currentTeam.category} • Saison {currentTeam.season}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddMember(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
              title="Spieler hinzufügen"
            >
              <UserPlus className="w-5 h-5" />
            </button>
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Zurück zur Übersicht
            </button>
          </div>
        </div>

        <PlayerList
          players={teamPlayers}
          onAddPlayer={() => setShowAddMember(true)}
          onSelectPlayer={() => {}}
          onEditPlayer={(player) => {
            console.log('Edit player:', player);
          }}
        />

        {showAddMember && teamService && (
          <AddMemberForm
            teamId={team.id}
            onAdd={handleAddMember}
            onClose={() => setShowAddMember(false)}
          />
        )}
      </div>
    </TeamErrorBoundary>
  );
}