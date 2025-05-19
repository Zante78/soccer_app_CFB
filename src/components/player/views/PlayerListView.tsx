import React from 'react';
import { Player } from '../../../types/player';
import { Edit, Trash2, User } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';

interface PlayerListViewProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export function PlayerListView({ players, onSelect, onEdit, onDelete }: PlayerListViewProps) {
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
                  {player.position && (
                    <p className="text-sm text-gray-500">{player.position}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
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
    </div>
  );
}