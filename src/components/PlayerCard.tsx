import React, { useRef } from 'react';
import { Player } from '../types/player';
import { User, Edit, Upload } from 'lucide-react';
import { PlayerService } from '../services/player.service';
import { CachedImage } from './common/CachedImage';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onEdit: (player: Player) => void;
}

export default function PlayerCard({ player, onClick, onEdit }: PlayerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerService = new PlayerService();

  const averageRating = player.skills.length > 0 
    ? player.skills.reduce((sum, skill) => sum + skill.value, 0) / player.skills.length
    : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(player);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await playerService.uploadPlayerPhoto(player.id, file);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Fehler beim Hochladen des Fotos');
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group"
    >
      <div className="aspect-square bg-gray-100 relative">
        {player.photoUrl ? (
          <CachedImage
            src={player.photoUrl}
            alt={`${player.firstName} ${player.lastName}`}
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
          {averageRating.toFixed(1)}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg"
          >
            <Edit size={16} />
          </button>

          <label className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg cursor-pointer">
            <Upload size={16} />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              onClick={e => e.stopPropagation()}
            />
          </label>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {player.firstName} {player.lastName}
        </h3>
        <p className="text-gray-600">{player.position}</p>
      </div>
    </div>
  );
}