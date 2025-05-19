import React, { useState } from 'react';
import { User, UserPlus, Trash2, Edit, Upload } from 'lucide-react';
import { TeamMembership } from '../../../types/core/team';
import { PlayerService } from '../../../services/player.service';
import { CachedImage } from '../../common/CachedImage';

interface TeamMemberListProps {
  members: TeamMembership[];
  onAddMember: () => void;
  onRemoveMember: (memberId: string) => void;
}

export function TeamMemberList({ members, onAddMember, onRemoveMember }: TeamMemberListProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const playerService = new PlayerService();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, playerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      await playerService.uploadPlayerPhoto(playerId, file);
      window.location.reload();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Fehler beim Hochladen des Fotos');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Teammitglieder</h3>
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4" />
            Spieler hinzufügen
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Noch keine Mitglieder im Team
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {member.player?.photo_url ? (
                      <CachedImage
                        src={member.player.photo_url}
                        alt={`${member.player.first_name} ${member.player.last_name}`}
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        }
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, member.player!.id)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {member.player?.first_name} {member.player?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {member.player?.position || 'Keine Position'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveMember(member.id)}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Spieler entfernen"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}