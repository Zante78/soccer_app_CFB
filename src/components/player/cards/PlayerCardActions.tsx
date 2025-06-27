import React, { memo } from 'react';
import { Edit, Upload, Trash2, FileText, Settings } from 'lucide-react';

interface PlayerCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onNotes: () => void;
  onManagePlayer: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled?: boolean;
}

export const PlayerCardActions = memo(function PlayerCardActions({ 
  onEdit, 
  onDelete, 
  onNotes,
  onManagePlayer,
  onPhotoUpload,
  fileInputRef,
  disabled = false
}: PlayerCardActionsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
      role="toolbar"
      aria-label="Spieler Aktionen"
    >
      <div className="flex justify-end gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNotes();
          }}
          onKeyDown={(e) => handleKeyDown(e, onNotes)}
          className="p-2 bg-white text-indigo-600 rounded-full hover:bg-indigo-50 shadow-lg transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          title="Notizen"
          aria-label="Notizen"
          disabled={disabled}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Notizen</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onManagePlayer();
          }}
          onKeyDown={(e) => handleKeyDown(e, onManagePlayer)}
          className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          title="Spieler verwalten"
          aria-label="Spieler verwalten"
          disabled={disabled}
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Spieler verwalten</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={(e) => handleKeyDown(e, onDelete)}
          className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 shadow-lg transform hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          title="Spieler löschen"
          aria-label="Spieler löschen"
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">Spieler löschen</span>
        </button>

        <label 
          className={`p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Foto hochladen"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            className="hidden"
            onClick={e => e.stopPropagation()}
            aria-label="Foto hochladen"
            disabled={disabled}
          />
          <span className="sr-only">Foto hochladen</span>
        </label>
      </div>
    </div>
  );
});