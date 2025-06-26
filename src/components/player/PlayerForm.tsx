import React, { useState, useEffect } from 'react';
import { Player, defaultSkills } from '../../types/player';
import { X, Loader, AlertCircle, AlertTriangle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerFormProps {
  player?: Player;
  onSave: (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

export function PlayerForm({ player, onSave, onClose }: PlayerFormProps) {
  const { getDuplicateStatusForPlayer } = usePlayerStore();
  const [formData, setFormData] = useState({
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    position: player?.position || '',
    email: player?.email || '',
    phone: player?.phone || '',
    dateOfBirth: player?.dateOfBirth || '',
    skills: player?.skills || defaultSkills
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [duplicatePlayers, setDuplicatePlayers] = useState<Player[]>([]);
  const [forceSubmit, setForceSubmit] = useState(false);

  useEffect(() => {
    // Reset warnings and errors when form data changes
    setError(null);
    setWarning(null);
    setDuplicatePlayers([]);
    setForceSubmit(false);
  }, [formData]);

  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return true; // Allow empty date of birth
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);
    
    return birthDate <= fiveYearsAgo;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    // Validate age requirement
    if (formData.dateOfBirth && !validateAge(formData.dateOfBirth)) {
      setError('Der Spieler muss mindestens 5 Jahre alt sein');
      return;
    }

    // Check for duplicates if not forcing submit
    if (!forceSubmit) {
      const { isDuplicate, isPotentialDuplicate, message, duplicatePlayers: foundDuplicates } = 
        getDuplicateStatusForPlayer(formData, player?.id);

      if (isDuplicate) {
        setError(message || 'Ein Spieler mit diesen Daten existiert bereits');
        setDuplicatePlayers(foundDuplicates);
        return;
      }

      if (isPotentialDuplicate) {
        setWarning(message || 'Möglicher Duplikat gefunden');
        setDuplicatePlayers(foundDuplicates);
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      setWarning(null);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleForceSubmit = () => {
    setForceSubmit(true);
    setWarning(null);
    setDuplicatePlayers([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {player ? 'Spieler bearbeiten' : 'Neuer Spieler'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p>{error}</p>
                {duplicatePlayers.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p>Gefundene Spieler:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {duplicatePlayers.map((duplicatePlayer, index) => (
                        <li key={index}>
                          Name: {duplicatePlayer.firstName} {duplicatePlayer.lastName}
                          {duplicatePlayer.dateOfBirth && <span> | Geburtsdatum: {new Date(duplicatePlayer.dateOfBirth).toLocaleDateString()}</span>}
                          {duplicatePlayer.email && <span> | Email: {duplicatePlayer.email}</span>}
                          {duplicatePlayer.teamName && <span> | Team: {duplicatePlayer.teamName}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {warning && !error && (
            <div className="mb-6 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p>{warning}</p>
                {duplicatePlayers.length > 0 && (
                  <div className="mt-2 text-sm">
                    <p>Gefundene Spieler:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {duplicatePlayers.map((duplicatePlayer, index) => (
                        <li key={index}>
                          Name: {duplicatePlayer.firstName} {duplicatePlayer.lastName}
                          {duplicatePlayer.dateOfBirth && <span> | Geburtsdatum: {new Date(duplicatePlayer.dateOfBirth).toLocaleDateString()}</span>}
                          {duplicatePlayer.email && <span> | Email: {duplicatePlayer.email}</span>}
                          {duplicatePlayer.teamName && <span> | Team: {duplicatePlayer.teamName}</span>}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={handleForceSubmit}
                      className="mt-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-sm font-medium transition-colors"
                    >
                      Trotzdem fortfahren
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                {formData.dateOfBirth && (
                  <p className="mt-1 text-xs text-gray-500">
                    Spieler muss mindestens 5 Jahre alt sein
                  </p>
                )}
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
        </div>
      </div>
    </div>
  );
}