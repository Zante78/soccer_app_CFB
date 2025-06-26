import React from 'react';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';
import { usePlayerStore } from '../../store/playerStore';

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
  const { duplicateStatuses, calculateAllDuplicateStatuses } = usePlayerStore();

  // Calculate duplicate statuses when component mounts
  React.useEffect(() => {
    calculateAllDuplicateStatuses();
  }, [calculateAllDuplicateStatuses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onSelectPlayer(player)}
          onEdit={onEditPlayer ? () => onEditPlayer(player) : () => {}}
          onDelete={onDelete ? () => onDelete(player.id) : undefined}
          onViewDuplicate={onViewDuplicate}
        />
      ))}
    </div>
  );
}