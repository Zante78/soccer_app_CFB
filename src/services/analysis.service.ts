import { supabase, handleDatabaseError } from './database';
import { 
  AnalysisMetric, 
  AnalysisReport, 
  AnalysisGoal,
  PerformanceTrend,
  PlayerStatistics
} from '../types/core/analysis';

export class AnalysisService {
  private static instance: AnalysisService;
  
  private constructor() {}

  public static getInstance(): AnalysisService {
    if (!AnalysisService.instance) {
      AnalysisService.instance = new AnalysisService();
    }
    return AnalysisService.instance;
  }

  async getPlayerMetrics(playerId: string): Promise<AnalysisMetric[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_metrics')
        .select('*')
        .eq('player_id', playerId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createMetric(metric: Omit<AnalysisMetric, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisMetric> {
    try {
      const { data, error } = await supabase
        .from('analysis_metrics')
        .insert([{
          player_id: metric.playerId,
          metric_type: metric.metricType,
          name: metric.name,
          value: metric.value,
          context: metric.context,
          date: metric.date
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getPlayerReports(playerId: string): Promise<AnalysisReport[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_reports')
        .select('*')
        .eq('player_id', playerId)
        .order('report_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createReport(report: Omit<AnalysisReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisReport> {
    try {
      const { data, error } = await supabase
        .from('analysis_reports')
        .insert([{
          player_id: report.playerId,
          author_id: report.authorId,
          title: report.title,
          content: report.content,
          metrics: report.metrics,
          report_date: report.reportDate,
          status: report.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getPlayerGoals(playerId: string): Promise<AnalysisGoal[]> {
    try {
      const { data, error } = await supabase
        .from('analysis_goals')
        .select('*')
        .eq('player_id', playerId)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createGoal(goal: Omit<AnalysisGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisGoal> {
    try {
      const { data, error } = await supabase
        .from('analysis_goals')
        .insert([{
          player_id: goal.playerId,
          metric_id: goal.metricId,
          title: goal.title,
          description: goal.description,
          target_value: goal.targetValue,
          current_value: goal.currentValue,
          start_date: goal.startDate,
          target_date: goal.targetDate,
          status: goal.status
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async updateGoal(id: string, updates: Partial<AnalysisGoal>): Promise<AnalysisGoal> {
    try {
      const { data, error } = await supabase
        .from('analysis_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getPerformanceTrend(
    playerId: string,
    metricName: string,
    days: number = 30
  ): Promise<PerformanceTrend[]> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_performance_trend', {
          player_id: playerId,
          metric_name: metricName,
          days
        });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getPlayerStatistics(
    playerId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PlayerStatistics[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_player_statistics', {
          player_id: playerId,
          start_date: startDate,
          end_date: endDate
        });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}