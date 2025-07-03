import React, { useState, useEffect } from 'react';
import { X, User, Users, BarChart, Settings, Loader, AlertCircle, Check } from 'lucide-react';
import { Player, PlayerSkill } from '../../types/player';
import { useStore } from '../../store/store';
import { usePlayerStore } from '../../store/playerStore';
import { TeamService } from '../../services/team.service';
import { supabase } from '../../services/database';
import { PlayerSkillsEditor } from './PlayerSkillsEditor';

interface PlayerManagementModalProps {
  player?: Player;
  onClose: () => void;
  onSave: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function PlayerManagementModal({ player, onClose, onSave }: PlayerManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'skills' | 'team'>('details');
  const [formData, setFormData] = useState({
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    position: player?.position || '',
    email: player?.email || '',
    phone: player?.phone || '',
    dateOfBirth: player?.dateOfBirth || '',
    height: player?.height || undefined,
    weight: player?.weight || undefined,
    skills: player?.skills || []
  });
  const [selectedTeamId, setSelectedTeamId] = useState<string>(player?.teamId || '');
  const [selectedRole, setSelectedRole] = useState<string>(player?.teamMemberships?.find(m => !m.endDate)?.role || 'player');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { teams } = useStore();
  const { updatePlayer } = usePlayerStore();
  const teamService = TeamService.getInstance();

  useEffect(() => {
    // Set initial values based on player's current team
    if (player?.teamId) {
      setSelectedTeamId(player.teamId);
    }
    
    const activeTeamMembership = player?.teamMemberships?.find(m => !m.endDate);
    if (activeTeamMembership) {
      setSelectedRole(activeTeamMembership.role);
    }
  }, [player]);

  const handleTabChange = (tab: 'details' | 'skills' | 'team') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  const handlePlayerDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        height: formData.height,
        weight: formData.weight,
        skills: formData.skills
      });
      setSuccessMessage('Spielerdaten erfolgreich gespeichert');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern des Spielers');
    } finally {
      setSaving(false);
    }
  };

  const handleSkillsSubmit = async (updatedSkills: PlayerSkill[]) => {
    if (!player) return;

    try {
      setSaving(true);
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
      setSaving(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player) return;

    try {
      setSaving(true);
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
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {player ? `${player.firstName} ${player.lastName} verwalten` : 'Neuer Spieler'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={saving}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange('details')}
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
          {activeTab === 'details' && (
            <form onSubmit={handlePlayerDetailsSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Vorname *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Größe (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="100"
                    max="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="30"
                    max="150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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