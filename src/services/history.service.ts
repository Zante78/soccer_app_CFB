import { supabase, handleDatabaseError } from './database';
import { PlayerHistory } from '../types/statistics';

export class HistoryService {
  private static instance: HistoryService;
  
  private constructor() {}

  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  async getPlayerHistory(
    playerId: string,
    options?: {
      type?: 'evaluation' | 'statistics' | 'medical';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PlayerHistory[]> {
    try {
      let query = supabase
        .from('player_history')
        .select('*')
        .eq('player_id', playerId)
        .order('date', { ascending: false });

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async addHistoryEntry(entry: {
    playerId: string;
    type: 'evaluation' | 'statistics' | 'medical';
    data: any;
  }): Promise<PlayerHistory> {
    try {
      const { data, error } = await supabase
        .from('player_history')
        .insert([{
          player_id: entry.playerId,
          type: entry.type,
          data: entry.data
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}