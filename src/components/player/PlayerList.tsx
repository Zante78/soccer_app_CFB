import React, { useState } from 'react';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';
import { usePlayerStore } from '../../store/playerStore';
import { DuplicateDetailsModal } from './DuplicateDetailsModal';
import { PlayerViewSelector, ViewMode } from './PlayerViewSelector';
import { PlayerListView } from './views/PlayerListView';
import { PlayerDetailListView } from './views/PlayerDetailListView';

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
  const { duplicateStatuses, calculateAllDuplicateStatuses, mergePlayers, deletePlayers } = usePlayerStore();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('large-grid');

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
      <div className="mb-4 flex justify-end">
        <PlayerViewSelector currentView={viewMode} onViewChange={setViewMode} />
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
    </>
  );
}