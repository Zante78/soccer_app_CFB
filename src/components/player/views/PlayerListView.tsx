import React, { useState } from 'react';
import { Player } from '../../../types/player';
import { Edit, Trash2, User, Users } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';
import { TeamAssignmentModal } from '../TeamAssignmentModal';
import { TeamService } from '../../../services/team.service';
import { usePlayerStore } from '../../../store/playerStore';

interface PlayerListViewProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export function PlayerListView({ players, onSelect, onEdit, onDelete }: PlayerListViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const { updatePlayer } = usePlayerStore();
  const teamService = TeamService.getInstance();

  const handleAssignTeam = async (teamId: string, role: string) => {
    if (!selectedPlayer) return;
    
    try {
      // If teamId is empty, remove player from team
      if (!teamId) {
        await teamService.removePlayerFromTeam(selectedPlayer.id);
        
        // Update player in store
        await updatePlayer(selectedPlayer.id, {
          ...selectedPlayer,
          teamId: null,
          teamName: null
        });
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Spieler erfolgreich aus dem Team entfernt';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        setShowTeamModal(false);
        return;
      }
      
      // Add player to team
      const result = await teamService.addTeamMember(teamId, selectedPlayer.id, role);
      
      // Get team name
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
      
      // Update player in store
      await updatePlayer(selectedPlayer.id, {
        ...selectedPlayer,
        teamId,
        teamName: team?.name
      });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = selectedPlayer.teamId 
        ? 'Team des Spielers erfolgreich geändert' 
        : 'Spieler erfolgreich einem Team zugewiesen';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setShowTeamModal(false);
    } catch (error) {
      console.error('Failed to assign team:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {players.map(player => (
          <li
            key={player.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(player)}
          >
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                  {player.photoUrl ? (
                    <CachedImage
                      src={player.photoUrl}
                      alt={`${player.firstName} ${player.lastName}`}
                      className="w-full h-full object-cover"
                      fallback={<User className="w-6 h-6 text-gray-400 m-2" />}
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400 m-2" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {player.firstName} {player.lastName}
                  </p>
                  <div className="flex items-center gap-2">
                    {player.position && (
                      <p className="text-sm text-gray-500">{player.position}</p>
                    )}
                    {player.teamName && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <Users className="w-3 h-3 mr-1" />
                        {player.teamName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlayer(player);
                    setShowTeamModal(true);
                  }}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                  title="Team zuweisen"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(player);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Möchten Sie diesen Spieler wirklich löschen?')) {
                      onDelete(player.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showTeamModal && selectedPlayer && (
        <TeamAssignmentModal
          player={selectedPlayer}
          onClose={() => setShowTeamModal(false)}
          onAssign={handleAssignTeam}
        />
      )}
    </div>
  );
}