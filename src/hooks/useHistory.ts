import { useState, useCallback } from 'react';
import { PlayerHistory } from '../types/statistics';
import { HistoryService } from '../services/history.service';

const historyService = HistoryService.getInstance();

export function useHistory(playerId: string) {
  const [history, setHistory] = useState<PlayerHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (options?: {
    type?: 'evaluation' | 'statistics' | 'medical';
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await historyService.getPlayerHistory(playerId, options);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const addHistoryEntry = useCallback(async (entry: {
    type: 'evaluation' | 'statistics' | 'medical';
    data: any;
  }) => {
    try {
      setError(null);
      const newEntry = await historyService.addHistoryEntry({
        ...entry,
        playerId
      });
      setHistory(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add history entry');
      throw err;
    }
  }, [playerId]);

  return {
    history,
    loading,
    error,
    loadHistory,
    addHistoryEntry
  };
}