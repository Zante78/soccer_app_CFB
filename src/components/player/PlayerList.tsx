import React from 'react';
import { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';

interface PlayerListProps {
  players: Player[];
  onAddPlayer: () => void;
  onSelectPlayer: (player: Player) => void;
  onEditPlayer?: (player: Player) => void;
  onDelete?: (id: string) => void;
}

export function PlayerList({ 
  players = [], 
  onAddPlayer, 
  onSelectPlayer,
  onEditPlayer,
  onDelete
}: PlayerListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onSelectPlayer(player)}
          onEdit={onEditPlayer ? () => onEditPlayer(player) : undefined}
          onDelete={onDelete ? () => onDelete(player.id) : undefined}
        />
      ))}
    </div>
  );
}