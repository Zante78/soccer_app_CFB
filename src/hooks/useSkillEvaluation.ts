import { useState, useCallback } from 'react';
import { Skill, SkillCategory } from '../types/core/skills';

export function useSkillEvaluation() {
  const [evaluations, setEvaluations] = useState<Record<string, number>>({});

  const updateSkillValue = useCallback((skillId: string, value: number) => {
    setEvaluations(prev => ({
      ...prev,
      [skillId]: Math.max(0, Math.min(20, value))
    }));
  }, []);

  const calculateOverallRating = useCallback((
    skills: Skill[],
    categories: SkillCategory[]
  ) => {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.entries(evaluations).forEach(([skillId, value]) => {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return;

      const category = categories.find(c => c.id === skill.categoryId);
      if (!category) return;

      const weight = skill.weight * category.weight;
      weightedSum += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }, [evaluations]);

  const resetEvaluations = useCallback(() => {
    setEvaluations({});
  }, []);

  return {
    evaluations,
    updateSkillValue,
    calculateOverallRating,
    resetEvaluations
  };
}