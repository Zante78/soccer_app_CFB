import React, { useState, useCallback } from 'react';
import { Player, PlayerSkill } from '../../types/player';
import { X, Save, AlertCircle, Loader, Info, Star, Trophy, Target, Activity, Brain, Users } from 'lucide-react';
import { Line, Radar } from 'react-chartjs-2';
import './charts/ChartConfig';

interface PlayerSkillsModalProps {
  player: Player;
  onClose: () => void;
  onSave?: (skills: PlayerSkill[]) => Promise<void>;
}

export function PlayerSkillsModal({ player, onClose, onSave }: PlayerSkillsModalProps) {
  const defaultSkills = [
    { name: 'Ballkontrolle', value: 10, category: 'technical' },
    { name: 'Schusstechnik', value: 10, category: 'technical' },
    { name: 'Kopfballspiel', value: 10, category: 'technical' },
    { name: 'Freistöße', value: 10, category: 'technical' },
    { name: 'Eckbälle', value: 10, category: 'technical' },
    { name: 'Taktische Intelligenz', value: 10, category: 'mental' },
    { name: 'Schnelligkeit', value: 10, category: 'physical' },
    { name: 'Ausdauer', value: 10, category: 'physical' },
    { name: 'Kraft', value: 10, category: 'physical' },
    { name: 'Mentale Stärke', value: 10, category: 'mental' },
    { name: 'Teamfähigkeit', value: 10, category: 'social' },
    { name: 'Kommunikation', value: 10, category: 'social' }
  ];

  const [skills, setSkills] = useState<PlayerSkill[]>(() => {
    if (!player.skills || player.skills.length === 0) {
      return defaultSkills;
    }
    return player.skills.map(skill => ({ ...skill }));
  });
  const [activeCategory, setActiveCategory] = useState<string>('technical');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkillChange = useCallback((skillName: string, value: number) => {
    setSkills(prev => prev.map(skill => 
      skill.name === skillName 
        ? { ...skill, value: Math.max(0, Math.min(20, value)) }
        : skill
    ));
  }, []);

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setLoading(true);
      setError(null);
      await onSave(skills);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Fähigkeiten');
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevel = (value: number): string => {
    if (value >= 16) return 'Experte';
    if (value >= 12) return 'Fortgeschritten';
    if (value >= 8) return 'Erfahren';
    return 'Anfänger';
  };

  const getValueColor = (value: number): string => {
    if (value >= 16) return 'text-green-600 ring-green-200';
    if (value >= 12) return 'text-blue-600 ring-blue-200';
    if (value >= 8) return 'text-yellow-600 ring-yellow-200';
    return 'text-red-600 ring-red-200';
  };

  const getProgressColor = (value: number): string => {
    if (value >= 16) return 'from-green-200 to-green-500';
    if (value >= 12) return 'from-blue-200 to-blue-500';
    if (value >= 8) return 'from-yellow-200 to-yellow-500';
    return 'from-red-200 to-red-500';
  };

  const categories = [
    { id: 'technical', name: 'Technisch', icon: Target },
    { id: 'physical', name: 'Körperlich', icon: Activity },
    { id: 'mental', name: 'Mental', icon: Brain },
    { id: 'social', name: 'Sozial', icon: Users }
  ];

  const chartData = {
    labels: skills.map(s => s.name),
    datasets: [{
      label: 'Fähigkeiten',
      data: skills.map(s => s.value),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.3
    }]
  };

  const radarData = {
    labels: skills.map(s => s.name),
    datasets: [{
      label: 'Fähigkeiten',
      data: skills.map(s => s.value),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Fähigkeiten von {player.firstName} {player.lastName}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto mb-4">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700 scale-105'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills
              .filter(skill => skill.category === activeCategory)
              .map(skill => (
                <div 
                  key={skill.name}
                  className="group relative bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                        <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {getSkillLevel(skill.value)}
                        </div>
                      </div>
                      <div className="relative">
                        <div className="peer">
                          <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                        </div>
                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 hidden peer-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-10">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transform rotate-45 w-2 h-2 bg-gray-800"></div>
                          <div className="space-y-1">
                            <p className="font-medium">Bewertungsskala:</p>
                            <ul className="space-y-0.5">
                              <li>• 0-7: Anfänger</li>
                              <li>• 8-11: Erfahren</li>
                              <li>• 12-15: Fortgeschritten</li>
                              <li>• 16-20: Experte</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ring-1 transition-all duration-300 ${getValueColor(skill.value)}`}>
                      {skill.value.toFixed(1)}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(skill.value)} transition-all duration-300 group-hover:scale-x-[1.02] origin-left`}
                        style={{ width: `${(skill.value / 20) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={skill.value}
                      onChange={(e) => handleSkillChange(skill.name, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    
                    <div className="mt-1 flex justify-between text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Fähigkeiten-Übersicht</h3>
              <div className="h-[200px]">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 20
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Fähigkeiten-Profil</h3>
              <div className="h-[200px]">
                <Radar 
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 20
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Abbrechen
            </button>
            {onSave && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}