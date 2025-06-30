import React, { useState, useCallback, useMemo } from 'react';
import { X, FileDown, Loader, AlertCircle, Check } from 'lucide-react';
import { ExportConfig, ExportJob } from '../../types/core/export';
import { useExport } from '../../hooks/useExport';
import { ExportStatus } from './ExportStatus';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { formatDate } from '../../utils/dateUtils';
import { validateExportConfig } from '../../utils/exportValidation';
import { getExportErrorMessage } from '../../utils/exportErrorMessages';

interface ExportDialogProps {
  onClose: () => void;
  onError?: (error: Error) => void;
}

type FormState = Omit<ExportConfig, 'id'>;

const initialFormState: FormState = {
  type: 'player',
  format: 'csv',
  includeFields: ['personal', 'statistics', 'evaluations']
};

export function ExportDialog({ onClose, onError }: ExportDialogProps) {
  // Form state management
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Operation states
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  
  // Custom hook for export operations
  const { 
    jobs, 
    loading: isLoading, 
    error: exportError, 
    createExport, 
    deleteJob, 
    loadJobs 
  } = useExport();

  // Memoized validation function
  const validateForm = useCallback(() => {
    const { isValid, errors } = validateExportConfig(formData);
    setValidationErrors(errors);
    return isValid;
  }, [formData]);

  // Memoized error message
  const errorMessage = useMemo(() => {
    if (validationErrors.length > 0) {
      return validationErrors.join(', ');
    }
    return exportError?.message;
  }, [validationErrors, exportError]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const job = await createExport(formData as ExportConfig);
      setCurrentJobId(job.id);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Export failed'));
    }
  };

  // Field change handler with type safety
  const handleFieldChange = useCallback(<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]); // Clear validation errors on change
  }, []);

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJob(jobToDelete);
      await loadJobs(); // Refresh job list
      setJobToDelete(null);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Failed to delete export'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" 
         role="dialog" 
         aria-modal="true"
         aria-labelledby="export-dialog-title">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="export-dialog-title" className="text-xl font-semibold text-gray-900">
              Daten exportieren
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              aria-label="Dialog schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  {getExportErrorMessage(exportError?.message || 'VALIDATION_ERROR').title}
                </h4>
                <p className="text-sm">{errorMessage}</p>
                <p className="mt-2 text-sm text-red-700 font-semibold">
                  {getExportErrorMessage(exportError?.message || 'VALIDATION_ERROR').action}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Export Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export-Typ
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleFieldChange('type', e.target.value as ExportConfig['type'])}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="player">Spieler</option>
                <option value="team">Team</option>
                <option value="evaluation">Bewertungen</option>
                <option value="statistics">Statistiken</option>
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => handleFieldChange('format', e.target.value as ExportConfig['format'])}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Einzuschließende Daten
              </label>
              <div className="space-y-2">
                {['personal', 'statistics', 'evaluations'].map(field => (
                  <label key={field} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.includeFields.includes(field)}
                      onChange={(e) => {
                        const fields = new Set(formData.includeFields);
                        e.target.checked ? fields.add(field) : fields.delete(field);
                        handleFieldChange('includeFields', Array.from(fields));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {field === 'personal' ? 'Persönliche Daten' :
                       field === 'statistics' ? 'Statistiken' : 'Bewertungen'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recent Exports */}
            {jobs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Letzte Exporte</h3>
                <div className="space-y-2">
                  {jobs.slice(0, 3).map(job => (
                    <div key={job.id} 
                         className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <div>
                        <span className="text-gray-600">
                          {formatDate(job.createdAt)}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status === 'completed' ? 'Abgeschlossen' :
                           job.status === 'failed' ? 'Fehlgeschlagen' :
                           'In Bearbeitung'}
                        </span>
                      </div>
                      <button
                        onClick={() => setJobToDelete(job.id)}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                        title="Export löschen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isLoading}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.includeFields.length}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Wird exportiert...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Exportieren
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Export Status */}
          {currentJobId && (
            <div className="mt-4">
              <ExportStatus 
                jobId={currentJobId}
                onComplete={(url) => {
                  window.open(url, '_blank');
                  onClose();
                }}
                onError={(err) => {
                  onError?.(err);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {jobToDelete && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={() => setJobToDelete(null)}
        />
      )}
    </div>
  );
}