import { useState, useCallback } from 'react';
import { ExportConfig, ExportJob } from '../types/core/export';
import { ExportService } from '../services/export.service';

const exportService = ExportService.getInstance();

export function useExport(userId: string) {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exportService.getUserExportJobs(userId);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load export jobs');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createExport = useCallback(async (config: ExportConfig) => {
    try {
      setError(null);
      const job = await exportService.createExportJob(config, userId);
      setJobs(prev => [job, ...prev]);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export');
      throw err;
    }
  }, [userId]);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setError(null);
      await exportService.deleteExportJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete export job');
      throw err;
    }
  }, []);

  const checkJobStatus = useCallback(async (jobId: string) => {
    try {
      setError(null);
      const job = await exportService.getExportJobStatus(jobId);
      setJobs(prev => prev.map(j => j.id === jobId ? job : j));
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check job status');
      throw err;
    }
  }, []);

  return {
    jobs,
    loading,
    error,
    loadJobs,
    createExport,
    deleteJob,
    checkJobStatus
  };
}