import React, { useState, useEffect } from 'react';
import { X, Users, Check, Loader, AlertCircle } from 'lucide-react';
import { Player } from '../../types/player';
import { Team } from '../../types/core/team';
import { useStore } from '../../store/store';

interface TeamAssignmentModalProps {
  player: Player;
  onClose: () => void;
  onAssign: (teamId: string, role: string) => Promise<void>;
}

export function TeamAssignmentModal({ player, onClose, onAssign }: TeamAssignmentModalProps) {
  const { teams } = useStore();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(player.teamId || '');
  const [selectedRole, setSelectedRole] = useState<string>(player.teamMemberships?.find(m => !m.endDate)?.role || 'player');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial values based on player's current team
    if (player.teamId) {
      setSelectedTeamId(player.teamId);
    }
    
    const activeTeamMembership = player.teamMemberships?.find(m => !m.endDate);
    if (activeTeamMembership) {
      setSelectedRole(activeTeamMembership.role);
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeamId) {
      setError('Bitte wählen Sie ein Team aus');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAssign(selectedTeamId, selectedRole);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Zuweisen des Spielers zum Team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Spieler einem Team zuweisen
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Spieler
                </label>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">
                  {player.firstName} {player.lastName}
                </p>
                {player.position && (
                  <p className="text-sm text-gray-500">{player.position}</p>
                )}
                {player.teamName && (
                  <p className="text-sm text-blue-600 mt-1">
                    Aktuelles Team: {player.teamName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team auswählen
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">-- Kein Team --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedTeamId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rolle im Team
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="player">Spieler</option>
                  <option value="captain">Kapitän</option>
                  <option value="viceCaptain">Vize-Kapitän</option>
                </select>
              </div>
            )}

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
                disabled={isSubmitting || !selectedTeamId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Wird zugewiesen...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {player.teamId ? 'Team ändern' : 'Team zuweisen'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}