import { supabase, handleDatabaseError } from './database';
import { ExportConfig, ExportJob } from '../types/core/export';

export class ExportService {
  private static instance: ExportService;
  
  private constructor() {}

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async createExportJob(config: ExportConfig, userId: string): Promise<ExportJob> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .insert([{
          user_id: userId,
          config,
          status: 'pending'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getExportJobStatus(jobId: string): Promise<ExportJob> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getUserExportJobs(userId: string): Promise<ExportJob[]> {
    try {
      const { data, error } = await supabase
        .from('export_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async deleteExportJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('export_jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}