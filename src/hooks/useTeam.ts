import { useState, useCallback } from 'react';
import { Team } from '../types/core/team';
import { TeamService } from '../services/team.service';

export function useTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const teamService = TeamService.getInstance();

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load teams'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newTeam = await teamService.createTeam(team);
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create team'));
      throw err;
    }
  }, []);

  const updateTeam = useCallback(async (id: string, team: Partial<Team>) => {
    try {
      setError(null);
      const updatedTeam = await teamService.updateTeam(id, team);
      setTeams(prev => prev.map(t => t.id === id ? updatedTeam : t));
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update team'));
      throw err;
    }
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    try {
      setError(null);
      await teamService.deleteTeam(id);
      setTeams(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete team'));
      throw err;
    }
  }, []);

  return {
    teams,
    loading,
    error,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam
  };
}