import React, { useState, useEffect } from 'react';
import { Team } from '../../types/core/team';
import { TeamList } from './list/TeamList';
import { TeamForm } from './form/TeamForm';
import { TeamDetails } from './TeamDetails';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader, UserPlus, Plus } from 'lucide-react';
import { SkipLink } from '../common/SkipLink';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useStore } from '../../store/store';
import { TeamService } from '../../services/team.service';
import { PlayerList } from '../player/PlayerList';
import { PlayerForm } from '../player/PlayerForm';
import { usePlayerStore } from '../../store/playerStore';
import { AddMemberForm } from './members/AddMemberForm';
import { TeamEditModal } from './modals/TeamEditModal';
import { Player } from '../../types/player';
import { TeamErrorBoundary } from '../common/TeamErrorBoundary';

export function TeamManagement() {
  const { teams, isLoading, error, initialize, addTeam, updateTeam, removeTeam } = useStore();
  const { players, loading: playersLoading, error: playersError, initialize: initializePlayers, addPlayer, updatePlayer, removePlayer, mergePlayers, deletePlayers } = usePlayerStore();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDuplicatePlayer, setSelectedDuplicatePlayer] = useState<Player | null>(null);

  const teamService = TeamService.getInstance();

  const navigationRef = useKeyboardNavigation({
    onSelect: (element) => {
      const teamId = element.getAttribute('data-team-id');
      if (teamId) {
        const team = teams.find(t => t.id === teamId);
        if (team) setSelectedTeam(team);
      }
    }
  });

  useEffect(() => {
    initialize().catch(console.error);
  }, [initialize]);

  useEffect(() => {
    if (showPlayers) {
      initializePlayers().catch(console.error);
    }
  }, [showPlayers, initializePlayers]);

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    if (showPlayers) {
      setShowPlayerForm(true);
      return;
    }

    if (selectedTeam) {
      setShowAddMemberForm(true);
    } else {
      setLocalError('Bitte wählen Sie zuerst ein Team aus');
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const onSave = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLocalError(null);
      
      if (editingPlayer) {
        // Update existing player
        await updatePlayer(editingPlayer.id, playerData);
      } else {
        // Add new player
        await addPlayer(playerData);
      }
      
      setShowPlayerForm(false);
      setEditingPlayer(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Speichern des Spielers';
      setLocalError(errorMessage);
      throw err;
    }
  };

  const handleViewDuplicate = (duplicatePlayer: Player) => {
    setSelectedDuplicatePlayer(duplicatePlayer);
    setEditingPlayer(duplicatePlayer);
    setShowPlayerForm(true);
  };

  const handleMergePlayers = async (masterPlayer: Player, duplicatePlayers: Player[]) => {
    try {
      setLocalError(null);
      await mergePlayers(masterPlayer, duplicatePlayers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Zusammenführen der Spieler';
      setLocalError(errorMessage);
      throw err;
    }
  };

  const handleDeletePlayers = async (playerIds: string[]) => {
    try {
      setLocalError(null);
      await deletePlayers(playerIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Löschen der Spieler';
      setLocalError(errorMessage);
      throw err;
    }
  };

  if (error?.includes('Failed to fetch') || error?.includes('Datenbankverbindung')) {
    return <DatabaseConnectionError />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Teams werden geladen...</p>
        </div>
      </div>
    );
  }

  if (showPlayers) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowPlayers(false)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Zurück zu Teams
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPlayer}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Neuer Spieler
            </button>
          </div>
        </div>

        {(playersError || localError) && (
          <TeamErrorBoundary>
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {playersError || localError}
            </div>
          </TeamErrorBoundary>
        )}

        {playersLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <PlayerList
            players={players}
            onAddPlayer={handleAddPlayer}
            onSelectPlayer={() => {}}
            onEditPlayer={handleEditPlayer}
            onDelete={async (id) => {
              if (window.confirm('Möchten Sie diesen Spieler wirklich löschen?')) {
                try {
                  await removePlayer(id);
                } catch (err) {
                  console.error('Fehler beim Löschen des Spielers:', err);
                }
              }
            }}
            onViewDuplicate={handleViewDuplicate}
          />
        )}

        {showPlayerForm && (
          <PlayerForm
            player={editingPlayer}
            onSave={onSave}
            onClose={() => {
              setShowPlayerForm(false);
              setEditingPlayer(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={navigationRef}>
      <SkipLink targetId="team-list" />
      {(error || localError) && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error || localError}
        </div>
      )}

      {showForm && (
        <TeamForm
          onSave={async (team) => {
            try {
              await addTeam(team);
              setShowForm(false);
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Teams');
            }
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {showAddMemberForm && selectedTeam && (
        <AddMemberForm
          teamId={selectedTeam.id}
          onAdd={async (playerId, role) => {
            try {
              await teamService.addTeamMember(selectedTeam.id, playerId, role);
              setShowAddMemberForm(false);
              window.location.reload(); // Refresh to update UI
            } catch (err) {
              console.error('Failed to add team member:', err);
              throw err;
            }
          }}
          onClose={() => setShowAddMemberForm(false)}
        />
      )}

      {showEditModal && selectedTeam && (
        <TeamEditModal
          team={selectedTeam}
          onSave={async (updates) => {
            try {
              await updateTeam(selectedTeam.id, updates);
              setShowEditModal(false);
            } catch (err) {
              throw err;
            }
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <div id="team-list">
        <TeamList
          teams={teams}
          onAddTeam={() => setShowForm(true)}
          onSelectTeam={setSelectedTeam}
          onEditTeam={(team) => {
            setSelectedTeam(team);
            setShowEditModal(true);
          }}
          onDeleteTeam={async (id) => {
            try {
              if (window.confirm('Möchten Sie dieses Team wirklich löschen?')) {
                await teamService.deleteTeam(id);
                removeTeam(id);
              }
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Fehler beim Löschen des Teams');
            }
          }}
          onUpdateTeam={async (id, updates) => {
            try {
              setLocalError(null);
              await updateTeam(id, updates);
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Teams');
              throw err;
            }
          }}
          onShowPlayers={() => setShowPlayers(true)}
        />
      </div>
    </div>
  );
}