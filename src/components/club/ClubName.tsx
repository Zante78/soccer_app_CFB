import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface ClubNameProps {
  name: string;
  onSave: (name: string) => void;
}

export function ClubName({ name, onSave }: ClubNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleSave = () => {
    if (editedName.trim()) {
      onSave(editedName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="text-2xl font-bold text-gray-900 bg-white border-b-2 border-blue-500 focus:outline-none"
          autoFocus
        />
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700"
        >
          <Check size={20} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:text-red-700"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-400 hover:text-gray-600"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}