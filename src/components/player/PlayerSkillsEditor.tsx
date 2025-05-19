import React, { useState } from 'react';
import { PlayerSkill } from '../../types/player';
import { Save, Loader, AlertCircle } from 'lucide-react';

interface PlayerSkillsEditorProps {
  skills: PlayerSkill[];
  onSave: (skills: PlayerSkill[]) => Promise<void>;
  saving?: boolean;
}

export function PlayerSkillsEditor({ skills, onSave, saving = false }: PlayerSkillsEditorProps) {
  const [editedSkills, setEditedSkills] = useState<PlayerSkill[]>(skills);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSkillChange = (index: number, value: number) => {
    setEditedSkills(prev => {
      const newSkills = [...prev];
      if (newSkills[index]) {
        newSkills[index] = {
          ...newSkills[index],
          value: Math.max(0, Math.min(20, value))
        };
      }
      return newSkills;
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await onSave(editedSkills);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Fähigkeiten');
    }
  };

  const getSkillsByCategory = (category: string) => {
    return editedSkills.filter(skill => skill.category === category);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'technical': return 'Technische Fähigkeiten';
      case 'tactical': return 'Taktische Fähigkeiten';
      case 'physical': return 'Körperliche Fähigkeiten';
      case 'mental': return 'Mentale Fähigkeiten';
      case 'social': return 'Soziale Fähigkeiten';
      default: return category;
    }
  };

  const getValueColor = (value: number) => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categories = ['technical', 'physical', 'mental', 'social'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          Fähigkeiten erfolgreich gespeichert
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => {
          const categorySkills = getSkillsByCategory(category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {getCategoryName(category)}
              </h3>
              <div className="space-y-4">
                {categorySkills.map((skill, idx) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {skill.name}
                      </label>
                      <span className={`text-sm font-medium ${getValueColor(skill.value)}`}>
                        {skill.value.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={skill.value}
                      onChange={(e) => handleSkillChange(
                        editedSkills.findIndex(s => s.name === skill.name && s.category === skill.category),
                        parseFloat(e.target.value)
                      )}
                      className="w-full"
                      disabled={saving}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Speichern
            </>
          )}
        </button>
      </div>
    </form>
  );
}