import { useState, useCallback } from 'react';
import { ExportConfig, ExportJob } from '../types/core/export';
import { ExportService } from '../services/export.service';
import { supabase } from '../services/database';

const exportService = ExportService.getInstance();

export function useExport() {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('Bitte melden Sie sich an');
      }

      // Hole Export-Jobs für den aktuellen Benutzer
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Laden der Export-Jobs';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createExport = useCallback(async (config: ExportConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('Bitte melden Sie sich an');
      }

      setError(null);
      const job = await exportService.createExportJob(config, user.id);
      setJobs(prev => [job, ...prev]);
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Erstellen des Exports';
      setError(message);
      throw err;
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setError(null);
      await exportService.deleteExportJob(jobId);
      
      // Optimistic update
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      // Reload to ensure consistency
      await loadJobs();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Löschen des Export-Jobs';
      setError(message);
      throw err;
    }
  }, [loadJobs]);

  const checkJobStatus = useCallback(async (jobId: string) => {
    try {
      setError(null);
      const job = await exportService.getExportJobStatus(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? job : j));
      return job;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Prüfen des Job-Status';
      setError(message);
      throw err;
    }
  }, []);

  const cancelExport = useCallback(async (jobId: string) => {
    try {
      setError(null);
      await exportService.cancelExport(jobId);
      await loadJobs(); // Lade Jobs neu um aktuellen Status zu erhalten
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Abbrechen des Exports';
      setError(message);
      throw err;
    }
  }, [loadJobs]);

  return {
    jobs,
    loading,
    error,
    loadJobs,
    createExport,
    deleteJob,
    checkJobStatus,
    cancelExport
  };
}