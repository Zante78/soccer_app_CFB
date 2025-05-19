import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { ExportDialog } from './ExportDialog';
import { useExport } from '../../hooks/useExport';

export function ExportButton() {
  const [showDialog, setShowDialog] = useState(false);
  const { loadJobs } = useExport();

  const handleClick = async () => {
    try {
      await loadJobs();
      setShowDialog(true);
    } catch (error) {
      console.error('Failed to load export jobs:', error);
      // Zeige Dialog trotzdem an, Fehler wird im Dialog selbst behandelt
      setShowDialog(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <FileDown className="w-4 h-4" />
        Exportieren
      </button>

      {showDialog && (
        <ExportDialog 
          onClose={() => setShowDialog(false)}
          onError={(error) => {
            console.error('Export error:', error);
            // Optional: Zeige Fehler-Toast oder Benachrichtigung
          }}
        />
      )}
    </>
  );
}