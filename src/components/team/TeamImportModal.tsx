import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, Check, FileText } from 'lucide-react';
import { Team } from '../../types/core/team';
import { TeamService } from '../../services/team.service';
import { parseCSV, validateAndConvertTeamData } from '../../utils/csvUtils';
import { ValidationError } from '../../utils/errorUtils';
import { ImportCSVTemplate } from './ImportCSVTemplate';

interface TeamImportModalProps {
  onClose: () => void;
  onSuccess?: (teams: Team[]) => void;
}

export function TeamImportModal({ onClose, onSuccess }: TeamImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ total: number; successful: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const teamService = TeamService.getInstance();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Bitte wählen Sie eine CSV-Datei aus');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Bitte wählen Sie eine CSV-Datei aus');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      // Read file content
      const fileContent = await file.text();
      
      // Parse CSV
      const csvData = parseCSV(fileContent);
      
      // Validate and convert data
      const teams = validateAndConvertTeamData(csvData);
      
      // Import teams
      let successCount = 0;
      let failedCount = 0;
      const importedTeams: Team[] = [];
      
      for (const team of teams) {
        try {
          const newTeam = await teamService.createTeam(team);
          importedTeams.push(newTeam);
          successCount++;
        } catch (error) {
          console.error('Failed to import team:', error);
          failedCount++;
        }
      }
      
      // Set success state
      setSuccess({
        total: teams.length,
        successful: successCount,
        failed: failedCount
      });
      
      // Call onSuccess callback if provided
      if (onSuccess && successCount > 0) {
        onSuccess(importedTeams);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setError(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Teams importieren</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <Check className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Import abgeschlossen</p>
                <p className="text-sm">
                  {success.successful} von {success.total} Teams erfolgreich importiert
                  {success.failed > 0 && `, ${success.failed} fehlgeschlagen`}.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
                disabled={isUploading}
              />
              
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Klicken Sie hier, um eine CSV-Datei auszuwählen
                  </p>
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                disabled={isUploading}
              >
                CSV-Datei auswählen
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">CSV-Format</h3>
                <ImportCSVTemplate type="team" />
              </div>
              <p className="text-xs text-gray-500 mb-2">
                Die CSV-Datei sollte folgende Spalten enthalten:
              </p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
                <li><span className="font-medium">Name</span> - Teamname (Pflichtfeld)</li>
                <li><span className="font-medium">Kategorie</span> - z.B. U19, Erste Mannschaft (Pflichtfeld)</li>
                <li><span className="font-medium">Saison</span> - z.B. 2023/24 (Pflichtfeld)</li>
                <li><span className="font-medium">Primärfarbe</span> - Hex-Farbcode, z.B. #FF0000 (optional)</li>
                <li><span className="font-medium">Sekundärfarbe</span> - Hex-Farbcode, z.B. #0000FF (optional)</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isUploading}
            >
              Abbrechen
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importiere...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Importieren</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}