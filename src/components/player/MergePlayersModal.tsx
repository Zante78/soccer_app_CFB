import React, { useState, useEffect } from 'react';
import { Player } from '../../types/player';
import { X, Check, AlertCircle } from 'lucide-react';

interface MergePlayersModalProps {
  duplicatePlayers: Player[];
  onClose: () => void;
  onMerge: (masterPlayer: Player, duplicatePlayers: Player[]) => Promise<void>;
}

interface ConflictField {
  field: keyof Player;
  label: string;
  values: Map<string, { value: any; players: Player[] }>;
}

export function MergePlayersModal({ 
  duplicatePlayers, 
  onClose, 
  onMerge 
}: MergePlayersModalProps) {
  const [masterPlayerId, setMasterPlayerId] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictField[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find conflicts between players
  useEffect(() => {
    const fieldsToCheck: Array<{ key: keyof Player; label: string }> = [
      { key: 'firstName', label: 'Vorname' },
      { key: 'lastName', label: 'Nachname' },
      { key: 'dateOfBirth', label: 'Geburtsdatum' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefon' },
      { key: 'position', label: 'Position' }
    ];

    const newConflicts: ConflictField[] = [];

    fieldsToCheck.forEach(({ key, label }) => {
      const valueMap = new Map<string, { value: any; players: Player[] }>();
      
      duplicatePlayers.forEach(player => {
        const value = player[key];
        if (value !== undefined && value !== null && value !== '') {
          const valueStr = String(value);
          if (!valueMap.has(valueStr)) {
            valueMap.set(valueStr, { value, players: [player] });
          } else {
            valueMap.get(valueStr)?.players.push(player);
          }
        }
      });

      // Only add to conflicts if there are multiple different values
      if (valueMap.size > 1) {
        newConflicts.push({
          field: key,
          label,
          values: valueMap
        });
      } else if (valueMap.size === 1) {
        // If there's only one value, pre-select it
        const [value] = valueMap.keys();
        setSelectedValues(prev => ({
          ...prev,
          [key]: valueMap.get(value)?.value
        }));
      }
    });

    setConflicts(newConflicts);
  }, [duplicatePlayers]);

  const handleSubmit = async () => {
    if (!masterPlayerId) {
      setError('Bitte wählen Sie einen Hauptspieler aus');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const masterPlayer = duplicatePlayers.find(p => p.id === masterPlayerId);
      if (!masterPlayer) {
        throw new Error('Hauptspieler nicht gefunden');
      }

      // Create a merged player with selected values
      const mergedPlayer = {
        ...masterPlayer,
        ...selectedValues
      };

      // Filter out the master player from duplicates
      const playersToMerge = duplicatePlayers.filter(p => p.id !== masterPlayerId);

      await onMerge(mergedPlayer, playersToMerge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Zusammenführen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white shadow-lg rounded-lg p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg text-gray-900">
            Spieler zusammenführen
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Wählen Sie den Hauptspieler aus, der beibehalten werden soll. Die Daten der anderen Spieler werden mit diesem zusammengeführt.
          </p>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h4 className="font-medium text-blue-700 mb-2">Hauptspieler auswählen:</h4>
            <div className="space-y-2">
              {duplicatePlayers.map(player => (
                <label key={player.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-blue-100 rounded-lg">
                  <input
                    type="radio"
                    name="masterPlayer"
                    value={player.id}
                    checked={masterPlayerId === player.id}
                    onChange={() => setMasterPlayerId(player.id)}
                    className="mt-1 rounded-full text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium">{player.firstName} {player.lastName}</p>
                    <div className="text-xs space-y-0.5 mt-1 text-gray-600">
                      {player.dateOfBirth && (
                        <p>Geburtsdatum: {new Date(player.dateOfBirth).toLocaleDateString()}</p>
                      )}
                      {player.email && <p>Email: {player.email}</p>}
                      {player.teamName && <p>Team: {player.teamName}</p>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">Konflikte auflösen:</h4>
              <div className="space-y-4">
                {conflicts.map(conflict => (
                  <div key={conflict.field} className="border-t pt-3">
                    <p className="font-medium text-gray-700 mb-2">{conflict.label}:</p>
                    <div className="space-y-2">
                      {Array.from(conflict.values.entries()).map(([valueStr, { value, players }]) => (
                        <label key={valueStr} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                          <input
                            type="radio"
                            name={`conflict-${conflict.field}`}
                            value={valueStr}
                            checked={selectedValues[conflict.field] === value}
                            onChange={() => setSelectedValues(prev => ({
                              ...prev,
                              [conflict.field]: value
                            }))}
                            className="mt-1 rounded-full text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium">{valueStr}</p>
                            <p className="text-xs text-gray-500">
                              Verwendet von: {players.map(p => `${p.firstName} ${p.lastName}`).join(', ')}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!masterPlayerId || isSubmitting}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-1 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Wird zusammengeführt...' : 'Zusammenführen'}
          </button>
        </div>
      </div>
    </div>
  );
}