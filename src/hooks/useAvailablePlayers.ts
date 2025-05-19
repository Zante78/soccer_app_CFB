import { useState, useCallback } from 'react';
import { Player } from '../types/player';
import { PlayerService } from '../services/player.service';

const playerService = new PlayerService();

export function useAvailablePlayers(teamId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playerService.getAvailablePlayers(teamId);
      setPlayers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load available players'));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  return {
    players,
    loading,
    error,
    loadPlayers
  };
}