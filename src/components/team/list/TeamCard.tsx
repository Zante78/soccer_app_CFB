import React, { useRef, useState } from 'react';
import { Team } from '../../../types/core/team';
import { Users, Trash2, Edit, Upload, MapPin, Clock, Mail, Phone } from 'lucide-react';
import { CachedImage } from '../../common/CachedImage';
import { ViewMode } from './TeamList';

interface TeamCardProps {
  team: Team;
  viewMode: ViewMode;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Team>) => Promise<void>;
}

export function TeamCard({ 
  team, 
  viewMode,
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

  // Render large grid view (default)
  if (viewMode === 'large-grid') {
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
          
          {/* Action buttons - Only visible on hover */}
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

  // Render small grid view
  if (viewMode === 'small-grid') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
      >
        <div className="aspect-square bg-gray-100 relative">
          {team.photo_url ? (
            <CachedImage
              src={team.photo_url}
              alt={team.name}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Action buttons - Only visible on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <div className="hidden group-hover:flex gap-1">
              <label className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Möchten Sie dieses Team wirklich löschen?')) {
                    onDelete();
                  }
                }}
                className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-xs">Uploading...</div>
            </div>
          )}
        </div>

        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">{team.name}</h3>
          <p className="text-xs text-gray-500 truncate">{team.category}</p>
        </div>
      </div>
    );
  }

  // Render list view
  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
      >
        <div className="flex">
          <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
            {team.photo_url ? (
              <CachedImage
                src={team.photo_url}
                alt={team.name}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                <p className="text-sm text-gray-600">{team.category} • Saison {team.season}</p>
                
                <div className="mt-2 flex gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-200" 
                    style={{ backgroundColor: team.colors.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-200" 
                    style={{ backgroundColor: team.colors.secondary }}
                  />
                </div>
              </div>
              
              <div className="flex items-start gap-1">
                <label className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm cursor-pointer">
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm"
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
                  className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render detail list view
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow relative group"
    >
      <div className="flex">
        <div className="w-32 h-32 bg-gray-100 flex-shrink-0">
          {team.photo_url ? (
            <CachedImage
              src={team.photo_url}
              alt={team.name}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.category} • Saison {team.season}</p>
              
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                {team.venue && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{team.venue}</span>
                  </div>
                )}
                {team.trainingTime && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{team.trainingTime}</span>
                  </div>
                )}
                {team.contactEmail && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail className="w-3 h-3" />
                    <span>{team.contactEmail}</span>
                  </div>
                )}
                {team.contactPhone && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{team.contactPhone}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-200" 
                  style={{ backgroundColor: team.colors.primary }}
                />
                <div 
                  className="w-3 h-3 rounded-full border border-gray-200" 
                  style={{ backgroundColor: team.colors.secondary }}
                />
              </div>
            </div>
            
            <div className="flex items-start gap-1">
              <label className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm cursor-pointer">
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-sm"
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
                className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}