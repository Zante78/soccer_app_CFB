import { useState, useCallback } from 'react';
import { supabase } from '../services/database';
import { Skill, SkillCategory } from '../types/core/skills';
import { PlayerSkill } from '../types/player';

export function useEvaluation(playerId: string) {
  const [currentEvaluation, setCurrentEvaluation] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatestEvaluation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get player's current skills
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('skills')
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;

      if (player?.skills) {
        const skillValues = (player.skills as PlayerSkill[]).reduce((acc, skill) => ({
          ...acc,
          [skill.name]: skill.value
        }), {});
        setCurrentEvaluation(skillValues);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const updateSkillValue = useCallback((skillName: string, value: number) => {
    setCurrentEvaluation(prev => ({
      ...prev,
      [skillName]: Math.max(0, Math.min(20, value))
    }));
  }, []);

  const saveEvaluation = useCallback(async (
    skills: Skill[],
    categories: SkillCategory[]
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Update player's skills
      const updatedSkills = Object.entries(currentEvaluation).map(([name, value]) => ({
        name,
        value,
        category: skills.find(s => s.name === name)?.category || 'technical'
      }));

      const { error: updateError } = await supabase
        .from('players')
        .update({ skills: updatedSkills })
        .eq('id', playerId);

      if (updateError) throw updateError;

      // Create evaluation record
      const { error: evalError } = await supabase
        .from('evaluations')
        .insert({
          player_id: playerId,
          evaluator_id: session.user.id,
          date: new Date().toISOString(),
          context: 'training',
          skills: updatedSkills
        });

      if (evalError) throw evalError;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save evaluation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId, currentEvaluation]);

  return {
    currentEvaluation,
    loading,
    error,
    updateSkillValue,
    saveEvaluation,
    loadLatestEvaluation
  };
}