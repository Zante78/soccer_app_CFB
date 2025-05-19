import { useState, useCallback } from 'react';
import { TeamService } from '../services/team.service';
import { TeamMembership } from '../types/core/team';

const teamService = new TeamService();

export function useTeamMembers(teamId: string) {
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamService.getTeamMembers(teamId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load team members'));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const addMember = useCallback(async (playerId: string, role: TeamMembership['role']) => {
    try {
      setError(null);
      const newMember = await teamService.addTeamMember(teamId, playerId, role);
      setMembers(prev => [...prev, newMember]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add team member'));
      throw err;
    }
  }, [teamId]);

  const removeMember = useCallback(async (membershipId: string) => {
    try {
      setError(null);
      await teamService.removeMember(membershipId);
      setMembers(prev => prev.filter(member => member.id !== membershipId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove team member'));
      throw err;
    }
  }, []);

  return {
    members,
    loading,
    error,
    loadMembers,
    addMember,
    removeMember
  };
}