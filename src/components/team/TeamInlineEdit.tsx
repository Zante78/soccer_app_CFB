import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface TeamInlineEditProps {
  value: string;
  label: string;
  onSave: (value: string) => Promise<void>;
  options?: string[];
  className?: string;
}

export function TeamInlineEdit({ value, label, onSave, options, className = '' }: TeamInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isCustomValue, setIsCustomValue] = useState(!options?.includes(value));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!editedValue.trim()) {
      setError(`${label} darf nicht leer sein`);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(editedValue.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditedValue(value);
    setIsCustomValue(!options?.includes(value));
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="space-y-2" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          {options && (
            <div className="flex items-center gap-2">
              <select
                value={isCustomValue ? '_custom' : editedValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '_custom') {
                    setIsCustomValue(true);
                    setEditedValue('');
                  } else {
                    setIsCustomValue(false);
                    setEditedValue(value);
                  }
                }}
                onKeyDown={handleKeyDown}
                className="text-sm text-gray-600 bg-white border-b-2 border-blue-500 focus:outline-none py-1 px-2 rounded"
                disabled={isSaving}
              >
                {options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
                <option value="_custom">Benutzerdefiniert...</option>
              </select>
            </div>
          )}
          
          {(!options || isCustomValue) && (
            <input
              type="text"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${label} eingeben...`}
              className={`text-sm bg-white border-b-2 border-blue-500 focus:outline-none py-1 px-2 rounded ${className}`}
              autoFocus
              disabled={isSaving}
            />
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
              title="Speichern"
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
              title="Abbrechen"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1 group/edit" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1 min-w-0">
        {label && <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{label}:</span>}
        <span className={`truncate ${className || 'text-sm text-gray-800'}`}>{value}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover/edit:opacity-100 transition-opacity ml-1"
        title={`${label} bearbeiten`}
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}