import React, { useState } from 'react';
import { PlayerSkill } from '../../types/player';
import { Save, Loader, AlertCircle } from 'lucide-react';
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

  const getValueBgColor = (value: number) => {
    if (value >= 16) return 'bg-green-100 border-green-300';
    if (value >= 12) return 'bg-blue-100 border-blue-300';
    if (value >= 8) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
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

  // Prepare detailed radar chart data using individual skills
  const detailedRadarData = {
    labels: editedSkills.map(skill => skill.name),
    datasets: [{
      label: 'Fähigkeiten',
      data: editedSkills.map(skill => skill.value),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(59, 130, 246)'
    }]
  };

  // Prepare category radar chart data
  const categoryRadarData = {
    labels: categoryAverages.map(cat => cat.name),
    datasets: [{
      label: 'Kategorien',
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

      {/* Overall Rating Circle */}
      <div className="flex justify-center mb-6">
        <div className={`w-32 h-32 rounded-full ${getValueBgColor(overallAverage)} border-4 flex items-center justify-center shadow-lg`}>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getValueColor(overallAverage)}`}>
              {overallAverage.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">GESAMT</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Charts Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fähigkeitsprofil</h3>
          <div className="h-[400px] w-full">
            <Radar 
              data={detailedRadarData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 20,
                    ticks: {
                      stepSize: 5,
                      font: {
                        size: 10
                      }
                    },
                    pointLabels: {
                      font: {
                        size: 10
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

        {/* Category Summary Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kategorien Übersicht</h3>
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

        {/* Skills Editor Section */}
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