import React, { useState, useEffect } from 'react';
import { 
  X, User, Users, BarChart, Settings, Loader, AlertCircle, Check,
  Calendar, Mail, Phone, Trophy, UserPlus, Palette,
  Ruler, Weight, Footprints, ArrowLeft, Star
} from 'lucide-react';
import { Player, PlayerSkill, PLAYER_POSITIONS } from '../../types/player';
import { useStore } from '../../store/store';
import { usePlayerStore } from '../../store/playerStore';
import { TeamService } from '../../services/team.service';
import { supabase } from '../../services/database';
import { PlayerSkillsEditor } from './PlayerSkillsEditor';
import { CachedImage } from '../common/CachedImage';

interface PlayerManagementModalProps {
  player?: Player;
  onClose: () => void;
  onSave: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function PlayerManagementModal({ player, onClose, onSave }: PlayerManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'team'>('info');
  const [formData, setFormData] = useState({
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    position: player?.position || '',
    email: player?.email || '',
    phone: player?.phone || '',
    dateOfBirth: player?.dateOfBirth || '',
    height: player?.height || undefined,
    weight: player?.weight || undefined,
    strongFoot: player?.strongFoot || 'right',
    skills: player?.skills || []
  });
  const [selectedTeamId, setSelectedTeamId] = useState<string>(player?.teamId || '');
  const [selectedRole, setSelectedRole] = useState<string>(player?.teamMemberships?.find(m => !m.endDate)?.role || 'player');
  const [error, setError] = useState<string | null>(null);
  const [saving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { teams } = useStore();
  const { updatePlayer } = usePlayerStore();
  const teamService = TeamService.getInstance();

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate average skill rating
  const calculateAverageRating = (): number => {
    if (!formData.skills || formData.skills.length === 0) return 0;
    const sum = formData.skills.reduce((acc, skill) => acc + skill.value, 0);
    return sum / formData.skills.length;
  };

  const averageRating = calculateAverageRating();
  const playerAge = calculateAge(formData.dateOfBirth);

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

  const handleTabChange = (tab: 'info' | 'skills' | 'team') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

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

      if (!formData.firstName.trim()) {
        throw new Error('Bitte geben Sie einen Vornamen ein');
      }
      if (!formData.lastName.trim()) {
        throw new Error('Bitte geben Sie einen Nachnamen ein');
      }

      // Validate email format if provided
      if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        throw new Error('Bitte geben Sie eine gültige Email-Adresse ein');
      }

      // Validate height and weight if provided
      if (formData.height && (formData.height < 100 || formData.height > 250)) {
        throw new Error('Die Größe muss zwischen 100 und 250 cm liegen');
      }

      if (formData.weight && (formData.weight < 30 || formData.weight > 150)) {
        throw new Error('Das Gewicht muss zwischen 30 und 150 kg liegen');
      }

      await onSave(formData);
      setSuccessMessage('Spielerdaten erfolgreich gespeichert');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkillsSubmit = async (updatedSkills: PlayerSkill[]) => {
    if (!player) return;

    try {
      setIsSaving(true);
      setError(null);
      
      // Update formData with the new skills
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills
      }));
      
      await updatePlayer(player.id, {
        ...player,
        skills: updatedSkills
      });
      
      setSuccessMessage('Fähigkeiten erfolgreich gespeichert');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Fähigkeiten');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player) return;

    try {
      setIsSaving(true);
      setError(null);

      // If teamId is empty, remove player from team
      if (!selectedTeamId) {
        await teamService.removePlayerFromTeam(player.id);
        
        // Update player in store
        await updatePlayer(player.id, {
          ...player,
          teamId: null,
          teamName: null
        });
        
        setSuccessMessage('Spieler erfolgreich aus dem Team entfernt');
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }
      
      // Add player to team
      await teamService.addTeamMember(selectedTeamId, player.id, selectedRole);
      
      // Get team name
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', selectedTeamId)
        .single();
      
      // Update player in store
      await updatePlayer(player.id, {
        ...player,
        teamId: selectedTeamId,
        teamName: team?.name
      });
      
      setSuccessMessage(player.teamId 
        ? 'Team des Spielers erfolgreich geändert' 
        : 'Spieler erfolgreich einem Team zugewiesen');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Zuweisen des Teams');
    } finally {
      setIsSaving(false);
    }
  };

  // Get rating color based on value
  const getRatingColor = (value: number): string => {
    if (value >= 16) return 'text-green-600';
    if (value >= 12) return 'text-blue-600';
    if (value >= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get rating background color
  const getRatingBgColor = (value: number): string => {
    if (value >= 16) return 'bg-green-100';
    if (value >= 12) return 'bg-blue-100';
    if (value >= 8) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {player?.photoUrl ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  <CachedImage
                    src={player.photoUrl}
                    alt={`${player.firstName} ${player.lastName}`}
                    className="w-full h-full object-cover"
                    fallback={<User className="w-8 h-8 text-white" />}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center border-2 border-white flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold truncate">
                  {player ? `${player.firstName} ${player.lastName}` : 'Neuer Spieler'}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-blue-100 mt-1">
                  {player?.position && (
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" /> {player.position}
                    </span>
                  )}
                  
                  {player?.strongFoot && (
                    <span className="flex items-center gap-1">
                      <Footprints className="w-3.5 h-3.5" /> 
                      {player.strongFoot === 'left' ? 'Links' : 
                       player.strongFoot === 'right' ? 'Rechts' : 'Beidfüßig'}
                    </span>
                  )}
                  
                  {playerAge > 0 && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {playerAge} Jahre
                    </span>
                  )}
                  
                  {player?.height && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" /> {player.height} cm
                    </span>
                  )}
                  
                  {player?.weight && (
                    <span className="flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5" /> {player.weight} kg
                    </span>
                  )}
                  
                  {player?.teamName && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {player.teamName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200"
              disabled={saving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('info')}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Spielerdaten</span>
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('skills')}
              disabled={!player}
            >
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                <span>Fähigkeiten</span>
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('team')}
              disabled={!player}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Team zuweisen</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Player Details Tab */}
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nachname *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleChange('position', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Position auswählen</option>
                    {PLAYER_POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Geburtsdatum
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="block w-full pr-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {playerAge > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-600">
                        {playerAge} Jahre
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Footprints className="w-4 h-4" />
                    Starker Fuß
                  </label>
                  <select
                    value={formData.strongFoot}
                    onChange={(e) => handleChange('strongFoot', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="right">Rechts</option>
                    <option value="left">Links</option>
                    <option value="both">Beidfüßig</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    Größe (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="100"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Weight className="w-4 h-4" />
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => handleChange('weight', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="30"
                    max="150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  Abbrechen
                </button>
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
                    'Speichern'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && player && (
            <div className="space-y-6">
              <PlayerSkillsEditor
                skills={formData.skills}
                onSave={handleSkillsSubmit}
                saving={saving}
              />
            </div>
          )}

          {/* Team Assignment Tab */}
          {activeTab === 'team' && player && (
            <form onSubmit={handleTeamSubmit} className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    Spieler
                  </label>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {player.firstName} {player.lastName}
                  </p>
                  {player.position && (
                    <p className="text-sm text-gray-500">{player.position}</p>
                  )}
                  {player.teamName && (
                    <p className="text-sm text-blue-600 mt-1">
                      Aktuelles Team: {player.teamName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team auswählen
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={saving}
                >
                  <option value="">-- Kein Team --</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.category})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTeamId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rolle im Team
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={saving}
                  >
                    <option value="player">Spieler</option>
                    <option value="captain">Kapitän</option>
                    <option value="viceCaptain">Vize-Kapitän</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={saving}
                >
                  Abbrechen
                </button>
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
                      {selectedTeamId 
                        ? (player.teamId ? 'Team ändern' : 'Team zuweisen') 
                        : 'Aus Team entfernen'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}