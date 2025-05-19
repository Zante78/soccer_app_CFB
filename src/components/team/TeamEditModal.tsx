import React, { useState, useEffect } from 'react';
import { 
  X, Save, AlertCircle, Check, ChevronDown, Users, Calendar, 
  MapPin, Clock, Phone, Mail, Trophy, UserPlus, Palette, Settings,
  ArrowLeft, Star
} from 'lucide-react';
import { Team } from '../../types/core/team';
import { TeamColors } from './shared/TeamColors';
import { usePlayerStore } from '../../store/playerStore';
import { AddMemberForm } from './members/AddMemberForm';
import { PlayerSkillsDialog } from './members/PlayerSkillsDialog';

interface TeamEditModalProps {
  team: Team;
  onSave: (updates: Partial<Team>) => Promise<void>;
  onClose: () => void;
}

export function TeamEditModal({ team, onSave, onClose }: TeamEditModalProps) {
  const [formData, setFormData] = useState({
    name: team.name,
    category: team.category,
    season: team.season,
    colors: team.colors,
    venue: team.venue || '',
    trainingTime: team.trainingTime || '',
    contactEmail: team.contactEmail || '',
    contactPhone: team.contactPhone || ''
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'players' | 'design'>('info');
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [showSkillsDialog, setShowSkillsDialog] = useState(false);

  const { players } = usePlayerStore();
  const teamPlayers = players.filter(p => p.teamId === team.id);

  // ESC Key Handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDirty) {
          if (window.confirm('Änderungen verwerfen?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isDirty, onClose]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);

      if (!formData.name.trim()) {
        throw new Error('Bitte geben Sie einen Teamnamen ein');
      }
      if (!formData.category.trim()) {
        throw new Error('Bitte wählen Sie eine Kategorie');
      }
      if (!formData.season.trim()) {
        throw new Error('Bitte geben Sie eine Saison an');
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('Änderungen verwerfen?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const categoryOptions = [
    'Bambini', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14',
    'U15', 'U16', 'U17', 'U18', 'U19', '1. Mannschaft', '2. Mannschaft'
  ];

  const currentYear = new Date().getFullYear();
  const seasonOptions = [
    `${currentYear-1}/${(currentYear).toString().slice(-2)}`,
    `${currentYear}/${(currentYear+1).toString().slice(-2)}`,
    `${currentYear+1}/${(currentYear+2).toString().slice(-2)}`
  ];

  const getAverageSkillRating = (player: any) => {
    if (!player.skills?.length) return 0;
    return player.skills.reduce((sum: number, skill: any) => sum + skill.value, 0) / player.skills.length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-gray-200 p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Team bearbeiten</h2>
              <p className="text-sm text-gray-500">{team.name}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'info' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              Grunddaten
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'players' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Spieler ({teamPlayers.length})
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'design' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Palette className="w-5 h-5" />
              Design
            </button>
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück zur Übersicht
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col max-h-[90vh]">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Basic Info Tab */}
            <div className={activeTab === 'info' ? 'space-y-6' : 'hidden'}>
              <div className="grid grid-cols-2 gap-6">
                {/* Team Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teamname
                  </label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="z.B. FC Bayern München U19"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Kategorie auswählen...</option>
                      {categoryOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Season */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saison
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={formData.season}
                      onChange={(e) => handleChange('season', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">Saison auswählen...</option>
                      {seasonOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spielort
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleChange('venue', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="z.B. Sportplatz Musterstadt"
                    />
                  </div>
                </div>

                {/* Training Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trainingszeit
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.trainingTime}
                      onChange={(e) => handleChange('trainingTime', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="z.B. Di & Do 18:00-19:30"
                    />
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kontakt Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="team@verein.de"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kontakt Telefon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+49 123 45678900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Players Tab */}
            <div className={activeTab === 'players' ? 'space-y-6' : 'hidden'}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Teammitglieder</h3>
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Spieler hinzufügen
                </button>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {teamPlayers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Noch keine Spieler im Team
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {teamPlayers.map(player => {
                      const avgRating = getAverageSkillRating(player);
                      return (
                        <div key={player.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              {player.photoUrl ? (
                                <img 
                                  src={player.photoUrl} 
                                  alt={`${player.firstName} ${player.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {player.firstName} {player.lastName}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{player.position || 'Keine Position'}</span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPlayerId(player.id);
                                setShowSkillsDialog(true);
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Fähigkeiten
                            </button>
                            <select
                              value={player.role || 'player'}
                              onChange={(e) => {
                                // Handle role change
                              }}
                              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              <option value="player">Spieler</option>
                              <option value="captain">Kapitän</option>
                              <option value="viceCaptain">Vize-Kapitän</option>
                            </select>
                            <button
                              onClick={() => {
                                // Handle remove player
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Design Tab */}
            <div className={activeTab === 'design' ? 'space-y-6' : 'hidden'}>
              <div className="grid grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Primärfarbe
                  </label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg shadow-inner border border-gray-200"
                      style={{ backgroundColor: formData.colors.primary }}
                    />
                    <input
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) => handleChange('colors', {
                        ...formData.colors,
                        primary: e.target.value
                      })}
                      className="flex-1 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sekundärfarbe
                  </label>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg shadow-inner border border-gray-200"
                      style={{ backgroundColor: formData.colors.secondary }}
                    />
                    <input
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) => handleChange('colors', {
                        ...formData.colors,
                        secondary: e.target.value
                      })}
                      className="flex-1 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Design Preview */}
              <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Vorschau</h3>
                <div className="space-y-4">
                  {/* Jersey Preview */}
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-full h-32 bg-gradient-to-br rounded-lg"
                         style={{
                           background: `linear-gradient(135deg, ${formData.colors.primary} 0%, ${formData.colors.secondary} 100%)`
                         }} />
                  </div>
                  
                  {/* Color Combination */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: formData.colors.primary }}
                      />
                      <span className="text-sm text-gray-600">Primär</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-gray-200"
                        style={{ backgroundColor: formData.colors.secondary }}
                      />
                      <span className="text-sm text-gray-600">Sekundär</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {isDirty && (
                  <span className="text-sm text-gray-500">
                    Ungespeicherte Änderungen
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving || !isDirty}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Wird gespeichert...
                    </>
                  ) : isDirty ? (
                    <>
                      <Save className="w-4 h-4" />
                      Änderungen speichern
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Keine Änderungen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberForm
          teamId={team.id}
          onAdd={async (playerId, role) => {
            // Handle adding member
            setShowAddMember(false);
          }}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {/* Player Skills Dialog */}
      {showSkillsDialog && selectedPlayerId && (
        <PlayerSkillsDialog
          playerName={teamPlayers.find(p => p.id === selectedPlayerId)?.firstName + ' ' + teamPlayers.find(p => p.id === selectedPlayerId)?.lastName}
          skills={teamPlayers.find(p => p.id === selectedPlayerId)?.skills || []}
          onClose={() => {
            setShowSkillsDialog(false);
            setSelectedPlayerId(null);
          }}
        />
      )}
    </div>
  );
}