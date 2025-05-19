import { useState, useCallback } from 'react';
import { EvaluationService } from '../services/evaluation.service';
import { PlayerEvaluation, SkillRating } from '../types/core/evaluation';
import { Skill, SkillCategory } from '../types/core/skills';

export function useEvaluationSystem(playerId: string) {
  const [currentEvaluation, setCurrentEvaluation] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluationService = new EvaluationService();

  const calculateOverallRating = useCallback((
    skills: Skill[],
    categories: SkillCategory[]
  ): number => {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(currentEvaluation).forEach(([skillId, value]) => {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return;

      const category = categories.find(c => c.id === skill.categoryId);
      if (!category) return;

      const weight = skill.weight * category.weight;
      weightedSum += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }, [currentEvaluation]);

  const updateSkillValue = useCallback((skillId: string, value: number) => {
    setCurrentEvaluation(prev => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(20, value))
    }));
  }, []);

  const saveEvaluation = useCallback(async (
    skills: Skill[],
    categories: SkillCategory[],
    context: 'training' | 'match' | 'test' = 'training'
  ) => {
    try {
      setLoading(true);
      setError(null);

      const skillRatings: SkillRating[] = Object.entries(currentEvaluation)
        .map(([skillId, value]) => ({
          skillId,
          value,
          weight: skills.find(s => s.id === skillId)?.weight
        }));

      const evaluation: Omit<PlayerEvaluation, 'id' | 'createdAt' | 'updatedAt'> = {
        playerId,
        evaluatorId: 'current-user-id', // Replace with actual user ID
        date: new Date().toISOString(),
        skills: skillRatings,
        overallRating: calculateOverallRating(skills, categories),
        context
      };

      await evaluationService.createEvaluation(evaluation);
      setCurrentEvaluation({});
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save evaluation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [playerId, currentEvaluation, calculateOverallRating]);

  const resetEvaluation = useCallback(() => {
    setCurrentEvaluation({});
    setError(null);
  }, []);

  return {
    currentEvaluation,
    loading,
    error,
    updateSkillValue,
    saveEvaluation,
    resetEvaluation,
    calculateOverallRating
  };
}