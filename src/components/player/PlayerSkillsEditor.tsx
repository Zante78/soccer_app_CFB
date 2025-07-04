import React, { useState } from 'react';
import { PlayerSkill } from '../../types/player';
import { Save, Loader, AlertCircle, BarChart as ChartBar, BarChart, Radar as RadarIcon } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import '../player/charts/ChartConfig';

interface PlayerSkillsEditorProps {
  skills: PlayerSkill[];
  onSave: (skills: PlayerSkill[]) => Promise<void>;
  saving?: boolean;
}

export function PlayerSkillsEditor({ skills, onSave, saving = false }: PlayerSkillsEditorProps) {
  const [editedSkills, setEditedSkills] = useState<PlayerSkill[]>(skills);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'radar' | 'summary'>('edit');

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

  // Calculate category averages for summary and radar chart
  const categoryAverages = categories.map(category => {
    const categorySkills = getSkillsByCategory(category);
    const sum = categorySkills.reduce((acc, skill) => acc + skill.value, 0);
    const avg = categorySkills.length > 0 ? sum / categorySkills.length : 0;
    return {
      category,
      name: getCategoryName(category),
      average: avg,
      skills: categorySkills
    };
  });

  // Prepare radar chart data
  const radarData = {
    labels: categoryAverages.map(cat => cat.name),
    datasets: [{
      label: 'Fähigkeiten nach Kategorie',
      data: categoryAverages.map(cat => cat.average),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  };

  // Calculate overall average
  const overallAverage = editedSkills.length > 0 
    ? editedSkills.reduce((sum, skill) => sum + skill.value, 0) / editedSkills.length
    : 0;

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

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`text-lg font-semibold ${getValueColor(overallAverage)}`}>
            Ø {overallAverage.toFixed(1)}
          </div>
          <span className="text-sm text-gray-500">Gesamtdurchschnitt</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-2 rounded-md ${viewMode === 'edit' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Bearbeiten"
          >
            <BarChart className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('radar')}
            className={`p-2 rounded-md ${viewMode === 'radar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Radar-Diagramm"
          >
            <RadarIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className={`p-2 rounded-md ${viewMode === 'summary' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Zusammenfassung"
          >
            <ChartBar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'edit' && (
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
      )}

      {viewMode === 'radar' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fähigkeitsprofil</h3>
          <div className="h-[400px] w-full">
            <Radar 
              data={radarData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 20,
                    ticks: {
                      stepSize: 5
                    },
                    pointLabels: {
                      font: {
                        size: 12
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Wert: ${context.raw}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {viewMode === 'summary' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fähigkeiten Zusammenfassung</h3>
          <div className="space-y-4">
            {categoryAverages.map(category => (
              <div key={category.category} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{category.name}</h4>
                  <span className={`font-bold ${getValueColor(category.average)}`}>
                    {category.average.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${
                      category.average >= 16 ? 'bg-green-600' :
                      category.average >= 12 ? 'bg-blue-600' :
                      category.average >= 8 ? 'bg-yellow-500' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(category.average / 20) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.skills.map(skill => (
                    <div key={skill.name} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{skill.name}</span>
                      <span className={getValueColor(skill.value)}>{skill.value.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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