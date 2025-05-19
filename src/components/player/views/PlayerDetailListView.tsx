import React from 'react';
import { Player } from '../../../types/player';
import { Edit, Trash2, User } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';

interface PlayerDetailListViewProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export function PlayerDetailListView({ players, onSelect, onEdit, onDelete }: PlayerDetailListViewProps) {
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
    </div>
  );
}