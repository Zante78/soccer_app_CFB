import React, { useState } from 'react';
import { Player } from '../../../types/player';
import { Edit, Trash2, User, Users } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';
import { TeamAssignmentModal } from '../TeamAssignmentModal';
import { TeamService } from '../../../services/team.service';
import { usePlayerStore } from '../../../store/playerStore';
import { supabase } from '../../../services/database';

interface PlayerDetailListViewProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export function PlayerDetailListView({ players, onSelect, onEdit, onDelete }: PlayerDetailListViewProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const { updatePlayer } = usePlayerStore();
  const teamService = TeamService.getInstance();

  const calculateAverageSkill = (player: Player) => {
    if (!player.skills?.length) return 0;
    const sum = player.skills.reduce((acc, skill) => acc + skill.value, 0);
    return (sum / player.skills.length).toFixed(1);
  };

  const getSkillsByCategory = (player: Player, category: string) => {
    return player.skills
      ?.filter(skill => skill.category === category)
      .reduce((acc, skill) => acc + skill.value, 0) / 
      (player.skills?.filter(skill => skill.category === category).length || 1);
  };

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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Spieler
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Technisch
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Körperlich
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mental
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sozial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gesamt
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {players.map(player => (
            <tr
              key={player.id}
              onClick={() => onSelect(player)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                    {player.photoUrl ? (
                      <CachedImage
                        src={player.photoUrl}
                        alt={`${player.firstName} ${player.lastName}`}
                        className="h-10 w-10 object-cover"
                        fallback={<User className="w-6 h-6 text-gray-400 m-2" />}
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400 m-2" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {player.firstName} {player.lastName}
                    </div>
                    {player.teamName && (
                      <div className="text-xs text-blue-600 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {player.teamName}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {player.position || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getSkillsByCategory(player, 'technical').toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getSkillsByCategory(player, 'physical').toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getSkillsByCategory(player, 'mental').toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getSkillsByCategory(player, 'social').toFixed(1)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {calculateAverageSkill(player)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlayer(player);
                      setShowTeamModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="Team zuweisen"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(player);
                    }}
                    className="text-gray-400 hover:text-blue-600"
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
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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