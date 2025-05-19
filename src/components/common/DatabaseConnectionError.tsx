import React from 'react';
import { AlertCircle } from 'lucide-react';

export function DatabaseConnectionError() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-3 text-amber-600 mb-4">
          <AlertCircle className="w-8 h-8" />
          <h2 className="text-xl font-semibold">Datenbankverbindung erforderlich</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Bitte klicken Sie auf "Connect to Supabase" in der oberen rechten Ecke, um die Datenbankverbindung herzustellen.
        </p>
        <p className="text-sm text-gray-500">
          Die Anwendung wird automatisch geladen, sobald die Verbindung hergestellt ist.
        </p>
      </div>
    </div>
  );
}