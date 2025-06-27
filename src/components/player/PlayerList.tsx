import React, { useState } from 'react';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';
import { usePlayerStore } from '../../store/playerStore';
import { DuplicateDetailsModal } from './DuplicateDetailsModal';
import { PlayerViewSelector, ViewMode } from './PlayerViewSelector';
import { PlayerListView } from './views/PlayerListView';
import { PlayerDetailListView } from './views/PlayerDetailListView';
import { TeamService } from '../../services/team.service';
import { TeamAssignmentModal } from './TeamAssignmentModal';
import { Plus } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  onAddPlayer: () => void;
  onSelectPlayer: (player: Player) => void;
  onEditPlayer?: (player: Player) => void;
  onDelete?: (id: string) => void;
  onViewDuplicate?: (player: Player) => void;
}

export function PlayerList({ 
  players = [], 
  onAddPlayer, 
  onSelectPlayer,
  onEditPlayer,
  onDelete,
  onViewDuplicate
}: PlayerListProps) {
  // Get duplicate statuses from the store
  const { duplicateStatuses, calculateAllDuplicateStatuses, mergePlayers, deletePlayers, updatePlayer } = usePlayerStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('large-grid');
  const teamService = TeamService.getInstance();

  // Calculate duplicate statuses when component mounts
  React.useEffect(() => {
    calculateAllDuplicateStatuses();
  }, [calculateAllDuplicateStatuses]);

  const handleViewDuplicate = (player: Player) => {
    setSelectedPlayer(player);
    setShowDuplicateModal(true);
  };

  const handleMergePlayers = async (masterPlayer: Player, duplicatePlayers: Player[]) => {
    await mergePlayers(masterPlayer, duplicatePlayers);
    setShowDuplicateModal(false);
  };

  const handleDeletePlayers = async (playerIds: string[]) => {
    await deletePlayers(playerIds);
    setShowDuplicateModal(false);
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
      await teamService.addTeamMember(teamId, selectedPlayer.id, role);
      
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

  // Render different views based on viewMode
  const renderPlayers = () => {
    switch (viewMode) {
      case 'list':
        return (
          <PlayerListView
            players={players}
            onSelect={onSelectPlayer}
            onEdit={onEditPlayer || (() => {})}
            onDelete={onDelete || (() => {})}
          />
        );
      case 'detail-list':
        return (
          <PlayerDetailListView
            players={players}
            onSelect={onSelectPlayer}
            onEdit={onEditPlayer || (() => {})}
            onDelete={onDelete || (() => {})}
          />
        );
      case 'small-grid':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => onSelectPlayer(player)}
                onEdit={onEditPlayer ? () => onEditPlayer(player) : () => {}}
                onDelete={onDelete ? () => onDelete(player.id) : undefined}
                onViewDuplicate={() => handleViewDuplicate(player)}
              />
            ))}
          </div>
        );
      case 'large-grid':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onClick={() => onSelectPlayer(player)}
                onEdit={onEditPlayer ? () => onEditPlayer(player) : () => {}}
                onDelete={onDelete ? () => onDelete(player.id) : undefined}
                onViewDuplicate={() => handleViewDuplicate(player)}
              />
            ))}
          </div>
        );
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Spieler</h2>
        <div className="flex items-center gap-4">
          <PlayerViewSelector currentView={viewMode} onViewChange={setViewMode} />
          <button
            onClick={onAddPlayer}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Neuer Spieler
          </button>
        </div>
      </div>

      {renderPlayers()}

      {showDuplicateModal && selectedPlayer && duplicateStatuses[selectedPlayer.id] && (
        <DuplicateDetailsModal
          duplicateStatus={duplicateStatuses[selectedPlayer.id]}
          onClose={() => setShowDuplicateModal(false)}
          onViewDetails={onViewDuplicate}
          onMergePlayers={handleMergePlayers}
          onDeletePlayers={handleDeletePlayers}
        />
      )}

      {showTeamModal && selectedPlayer && (
        <TeamAssignmentModal
          player={selectedPlayer}
          onClose={() => setShowTeamModal(false)}
          onAssign={handleAssignTeam}
        />
      )}
    </>
  );
}