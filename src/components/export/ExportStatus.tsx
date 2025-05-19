import React, { useEffect, useRef, useState } from 'react';
import { useExport } from '../../hooks/useExport';
import { Loader, X } from 'lucide-react';

interface ExportStatusProps {
  jobId: string;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function ExportStatus({ jobId, onComplete, onError }: ExportStatusProps) {
  const { checkJobStatus, cancelExport } = useExport();
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const job = await checkJobStatus(jobId);
        setStatus(job.status);
        setProgress(job.progress || 0);
        
        if (job.status === 'completed' && job.result?.url) {
          onComplete?.(job.result.url);
          clearInterval(intervalRef.current);
        } else if (job.status === 'failed') {
          const message = job.result?.error?.message || 'Export fehlgeschlagen';
          setErrorMessage(message);
          onError?.(new Error(message));
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Statusabfrage fehlgeschlagen';
        setErrorMessage(message);
        onError?.(new Error(message));
        clearInterval(intervalRef.current);
      }
    };

    intervalRef.current = window.setInterval(checkStatus, 2000);
    return () => clearInterval(intervalRef.current);
  }, [jobId, onComplete, onError, checkJobStatus]);

  const handleCancel = async () => {
    try {
      await cancelExport(jobId);
      setStatus('failed');
      const message = 'Export wurde abgebrochen';
      setErrorMessage(message);
      onError?.(new Error(message));
      clearInterval(intervalRef.current);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Abbrechen fehlgeschlagen';
      setErrorMessage(message);
      onError?.(new Error(message));
    }
  };

  if (errorMessage) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">
            {status === 'pending' && 'Export wird vorbereitet...'}
            {status === 'processing' && 'Export wird durchgeführt...'}
          </span>
        </div>
        {(status === 'pending' || status === 'processing') && (
          <button
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Abbrechen
          </button>
        )}
      </div>

      {status === 'processing' && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}