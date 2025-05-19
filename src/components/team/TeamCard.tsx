import React, { useRef, useState } from 'react';
import { Team } from '../../types/core/team';
import { Users, Trash2, Edit, Upload } from 'lucide-react';
import { TeamService } from '../../services/team.service';
import { CachedImage } from '../common/CachedImage';

interface TeamCardProps {
  team: Team;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Team>) => Promise<void>;
}

export function TeamCard({ team, onClick, onEdit, onDelete, onUpdate }: TeamCardProps) {
  const [uploading, setUploading] = useState(false);
  const teamService = TeamService.getInstance();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const photoUrl = await teamService.uploadTeamPhoto(team.id, file);
      await onUpdate({ photo_url: photoUrl });
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group"
    >
      <div className="aspect-video bg-gray-100 relative">
        {team.photo_url ? (
          <CachedImage
            src={team.photo_url}
            alt={team.name}
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-12 h-12 text-gray-400" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="hidden group-hover:flex gap-2">
            <label className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg cursor-pointer">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                onClick={e => e.stopPropagation()}
              />
            </label>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Möchten Sie dieses Team wirklich löschen?')) {
                  onDelete();
                }
              }}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white">Wird hochgeladen...</div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
        <p className="text-sm text-gray-600">{team.category}</p>
        <p className="text-sm text-gray-500 mt-1">Saison {team.season}</p>
        
        <div className="mt-4 flex gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-200" 
            style={{ backgroundColor: team.colors.primary }}
          />
          <div 
            className="w-4 h-4 rounded-full border border-gray-200" 
            style={{ backgroundColor: team.colors.secondary }}
          />
        </div>
      </div>
    </div>
  );
}