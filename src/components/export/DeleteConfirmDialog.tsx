import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Export löschen?</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Möchten Sie diesen Export wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}