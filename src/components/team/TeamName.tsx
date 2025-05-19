import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface TeamNameProps {
  name: string;
  onSave: (name: string) => Promise<void>;
}

export function TeamName({ name, onSave }: TeamNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedName.trim()) {
      setError('Der Name darf nicht leer sein');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editedName.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(name);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-2xl font-bold text-gray-900 bg-white border-b-2 border-blue-500 focus:outline-none"
            autoFocus
            disabled={isSaving}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
            title="Speichern"
          >
            <Check size={20} />
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
            title="Abbrechen"
          >
            <X size={20} />
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-gray-600"
        title="Name bearbeiten"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}