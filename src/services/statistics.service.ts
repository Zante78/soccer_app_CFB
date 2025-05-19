import { supabase } from './database';
import { MatchStatistics, Match } from '../types/core/statistics';

export class StatisticsService {
  async getPlayerStatistics(playerId: string): Promise<MatchStatistics[]> {
    const { data, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('playerId', playerId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createMatchStatistics(statistics: Omit<MatchStatistics, 'id' | 'createdAt' | 'updatedAt'>): Promise<MatchStatistics> {
    const { data, error } = await supabase
      .from('match_statistics')
      .insert([statistics])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getTeamMatches(teamId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('teamId', teamId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createMatch(match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPlayerSeasonStats(playerId: string, season: string): Promise<{
    totalGames: number;
    totalMinutes: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  }> {
    const { data, error } = await supabase
      .from('match_statistics')
      .select('*')
      .eq('playerId', playerId)
      .ilike('season', season);

    if (error) throw error;

    return data.reduce((acc, stat) => ({
      totalGames: acc.totalGames + 1,
      totalMinutes: acc.totalMinutes + stat.minutesPlayed,
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
      yellowCards: acc.yellowCards + stat.yellowCards,
      redCards: acc.redCards + (stat.redCard ? 1 : 0),
    }), {
      totalGames: 0,
      totalMinutes: 0,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
    });
  }
}