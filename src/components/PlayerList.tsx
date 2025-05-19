import React from 'react';
import { Plus } from 'lucide-react';
import { Player } from '../types/player';
import PlayerCard from './PlayerCard';

interface PlayerListProps {
  players: Player[];
  onAddPlayer: () => void;
  onSelectPlayer: (player: Player) => void;
}

export default function PlayerList({ players, onAddPlayer, onSelectPlayer }: PlayerListProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Spieler</h2>
        <button
          onClick={onAddPlayer}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Neuer Spieler
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => onSelectPlayer(player)}
          />
        ))}
      </div>
    </div>
  );
}