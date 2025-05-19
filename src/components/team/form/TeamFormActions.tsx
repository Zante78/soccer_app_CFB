import React from 'react';
import { Loader } from 'lucide-react';

interface TeamFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TeamFormActions({ onCancel, isSubmitting }: TeamFormActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        disabled={isSubmitting}
      >
        Abbrechen
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Wird gespeichert...
          </>
        ) : (
          'Speichern'
        )}
      </button>
    </div>
  );
}