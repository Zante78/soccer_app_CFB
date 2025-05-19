import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { PlayerSkill } from '../../../types/player';

interface PlayerSkillsDialogProps {
  playerName: string;
  skills: PlayerSkill[];
  onClose: () => void;
  onSave?: (skills: PlayerSkill[]) => void;
}

export function PlayerSkillsDialog({ playerName, skills, onClose, onSave }: PlayerSkillsDialogProps) {
  const [editedSkills, setEditedSkills] = useState<PlayerSkill[]>(skills);
  const [isSaving, setIsSaving] = useState(false);
  const categories = ['technical', 'physical', 'mental', 'social'] as const;
  
  const handleSkillChange = (skillName: string, newValue: number) => {
    setEditedSkills(prev => 
      prev.map(skill => 
        skill.name === skillName 
          ? { ...skill, value: Math.min(20, Math.max(0, newValue)) }
          : skill
      )
    );
  };

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(editedSkills);
        // Erfolgsmeldung
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Fähigkeiten erfolgreich gespeichert';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      } catch (error) {
        console.error('Failed to save skills:', error);
        alert('Fehler beim Speichern der Fähigkeiten');
      } finally {
        setIsSaving(false);
        onClose();
      }
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'technical': return 'Technische Fähigkeiten';
      case 'physical': return 'Körperliche Fähigkeiten';
      case 'mental': return 'Mentale Fähigkeiten';
      case 'social': return 'Soziale Fähigkeiten';
      default: return category;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Fähigkeiten von {playerName}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500"
              disabled={isSaving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {categories.map(category => {
              const categorySkills = editedSkills.filter(skill => skill.category === category);
              if (categorySkills.length === 0) return null;

              return (
                <div key={category} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {getCategoryName(category)}
                  </h3>
                  <div className="space-y-4">
                    {categorySkills.map(skill => (
                      <div key={skill.name} className="bg-white p-3 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                          <span className="text-sm font-medium text-blue-600">{skill.value}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="0.5"
                          value={skill.value}
                          onChange={(e) => handleSkillChange(skill.name, parseFloat(e.target.value))}
                          className="w-full accent-blue-600"
                          disabled={isSaving}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {onSave && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Wird gespeichert...' : 'Speichern'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}