import React, { useRef, useState } from 'react';
import { Team } from '../../../types/core/team';
import { Users, Trash2, Edit, Upload } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';
import { supabase } from '../../../services/database';

interface TeamCardProps {
  team: Team;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Team>) => Promise<void>;
}

export function TeamCard({ 
  team, 
  onClick, 
  onEdit, 
  onDelete,
  onUpdate
}: TeamCardProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        throw new Error('Nur JPEG, PNG und GIF Dateien sind erlaubt');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Die Datei darf maximal 5MB groß sein');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${team.id}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (team.photo_url) {
        const oldFileName = team.photo_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('teams')
            .remove([oldFileName]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('teams')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('teams')
        .getPublicUrl(fileName);

      // Update team record
      await onUpdate({ photo_url: data.publicUrl });

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Foto erfolgreich hochgeladen';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

    } catch (error) {
      console.error('Failed to upload photo:', error);
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error instanceof Error ? error.message : 'Fehler beim Hochladen des Fotos';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative group"
    >
      {/* Action buttons - Always visible in top right */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Upload Photo */}
        <div className="relative group/tooltip">
          <label className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition-all duration-200 cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              onClick={e => e.stopPropagation()}
              disabled={uploading}
            />
          </label>
          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none">
            Foto hochladen
          </span>
        </div>

        {/* Edit */}
        <div className="relative group/tooltip">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none">
            Team bearbeiten
          </span>
        </div>

        {/* Delete */}
        <div className="relative group/tooltip">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Möchten Sie dieses Team wirklich löschen?')) {
                onDelete();
              }
            }}
            className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-sm text-red-600 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-110 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 whitespace-nowrap pointer-events-none">
            Team löschen
          </span>
        </div>
      </div>

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