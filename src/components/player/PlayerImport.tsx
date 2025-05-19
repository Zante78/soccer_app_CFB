import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerImportProps {
  onComplete: () => void;
}

export function PlayerImport({ onComplete }: PlayerImportProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addPlayer } = usePlayerStore();

  const validateDate = (dateStr: string): string | null => {
    if (!dateStr.trim()) return null;
    
    // Try parsing the date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Ungültiges Datumsformat: ${dateStr}`);
    }
    
    return date.toISOString().split('T')[0];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim()); // Filter empty lines
      
      if (lines.length === 0) {
        throw new Error('Die CSV-Datei ist leer');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const firstNameIndex = headers.indexOf('vorname');
      const lastNameIndex = headers.indexOf('nachname');
      const birthdayIndex = headers.indexOf('geburtstag');

      if (firstNameIndex === -1 || lastNameIndex === -1) {
        throw new Error('Die CSV-Datei muss die Spalten "Vorname" und "Nachname" enthalten');
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length <= Math.max(firstNameIndex, lastNameIndex)) {
            console.warn(`Zeile ${i + 1} übersprungen: Unzureichende Spalten`);
            errorCount++;
            continue;
          }

          const firstName = values[firstNameIndex];
          const lastName = values[lastNameIndex];
          
          if (!firstName || !lastName) {
            console.warn(`Zeile ${i + 1} übersprungen: Fehlende Pflichtfelder`);
            errorCount++;
            continue;
          }

          let dateOfBirth = null;
          if (birthdayIndex !== -1 && values[birthdayIndex]) {
            dateOfBirth = validateDate(values[birthdayIndex]);
          }

          await addPlayer({
            firstName,
            lastName,
            dateOfBirth,
            skills: []
          });

          successCount++;
        } catch (err) {
          console.error(`Fehler in Zeile ${i + 1}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        onComplete();
      }

      if (errorCount > 0) {
        setError(`${successCount} Spieler importiert, ${errorCount} Fehler aufgetreten`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Importieren der Spieler');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
        <Upload className={`w-8 h-8 ${uploading ? 'animate-bounce' : ''}`} />
        <span className="text-sm text-gray-600">
          {uploading ? 'Wird importiert...' : 'CSV-Datei hochladen'}
        </span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
      
      <p className="mt-2 text-xs text-gray-500 text-center">
        Die CSV-Datei muss die Spalten "Vorname" und "Nachname" enthalten.
        Optional kann auch eine Spalte "Geburtstag" (YYYY-MM-DD) hinzugefügt werden.
      </p>
    </div>
  );
}