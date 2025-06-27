import React, { useState, useEffect } from 'react';
import { Player } from '../../../types/player';
import { X, Search, UserPlus, Plus, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../../../store/playerStore';
import { PlayerForm } from '../../player/PlayerForm';
import { TeamErrorBoundary } from '../../common/TeamErrorBoundary';
import { TeamService } from '../../../services/team.service';

interface AddMemberFormProps {
  teamId: string;
  onAdd: (playerId: string, role: 'player' | 'captain' | 'viceCaptain') => Promise<void>;
  onClose: () => void;
}

export function AddMemberForm({ teamId, onAdd, onClose }: AddMemberFormProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [role, setRole] = useState<'player' | 'captain' | 'viceCaptain'>('player');
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  
  const { players, initialize, addPlayer } = usePlayerStore();
  const teamService = TeamService.getInstance();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const canManage = await teamService.canManageTeamMembers();
        setCanManageMembers(canManage);
        
        if (!canManage) {
          setError('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
        }
      } catch (error) {
        setError('Fehler beim Überprüfen der Berechtigungen');
      } finally {
        setCheckingPermissions(false);
      }
    };

    checkPermissions();
    initialize().catch(console.error);
  }, [initialize, teamService]);

  // Filter available players (those without an active team membership)
  const availablePlayers = players.filter(player => {
    const hasActiveTeam = player.teamMemberships?.some(
      m => !m.endDate || new Date(m.endDate) > new Date()
    );
    return !hasActiveTeam;
  });

  // Filter players based on search
  const filteredPlayers = availablePlayers.filter(player => {
    const searchLower = search.toLowerCase();
    return (
      player.firstName.toLowerCase().includes(searchLower) ||
      player.lastName.toLowerCase().includes(searchLower) ||
      player.position?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) {
      setError('Bitte wählen Sie einen Spieler aus');
      return;
    }

    if (!canManageMembers) {
      setError('Sie haben keine Berechtigung, Teammitglieder zu verwalten');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAdd(selectedPlayer, role);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlayer = async (player: Omit<Player, 'id'>) => {
    try {
      const newPlayer = await addPlayer(player);
      setSelectedPlayer(newPlayer.id);
      setShowNewPlayerForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Erstellen des Spielers');
    }
  };

  if (checkingPermissions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Überprüfe Berechtigungen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canManageMembers) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Keine Berechtigung</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Sie haben keine Berechtigung, Teammitglieder zu verwalten. Wenden Sie sich an einen Administrator.</p>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showNewPlayerForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Neuer Spieler</h2>
              <button 
                onClick={() => setShowNewPlayerForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <TeamErrorBoundary>
              <PlayerForm
                onSave={handleCreatePlayer}
                onClose={() => setShowNewPlayerForm(false)}
              />
            </TeamErrorBoundary>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Spieler hinzufügen
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <TeamErrorBoundary>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Verfügbare Spieler
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPlayerForm(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Neuer Spieler
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Spieler suchen..."
                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  size={5}
                >
                  <option value="">Bitte wählen...</option>
                  {filteredPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.lastName}, {player.firstName}
                      {player.position ? ` (${player.position})` : ''}
                    </option>
                  ))}
                </select>
                {filteredPlayers.length === 0 && search && (
                  <p className="mt-2 text-sm text-gray-500">
                    Keine Spieler gefunden. Versuchen Sie einen anderen Suchbegriff.
                  </p>
                )}
                {availablePlayers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Alle Spieler sind bereits einem Team zugewiesen.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rolle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="player">Spieler</option>
                  <option value="captain">Kapitän</option>
                  <option value="viceCaptain">Vize-Kapitän</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedPlayer || !canManageMembers}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Wird hinzugefügt...' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </TeamErrorBoundary>
        </div>
      </div>
    </div>
  );
}