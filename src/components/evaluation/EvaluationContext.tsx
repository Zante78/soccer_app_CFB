import React, { createContext, useContext } from 'react';
import { useEvaluationSystem } from '../../hooks/useEvaluationSystem';
import { Skill, SkillCategory } from '../../types/core/skills';

interface EvaluationContextType {
  currentEvaluation: Record<string, number>;
  loading: boolean;
  error: string | null;
  updateSkillValue: (skillId: string, value: number) => void;
  saveEvaluation: (
    skills: Skill[],
    categories: SkillCategory[],
    context?: 'training' | 'match' | 'test'
  ) => Promise<void>;
  resetEvaluation: () => void;
  calculateOverallRating: (skills: Skill[], categories: SkillCategory[]) => number;
}

const EvaluationContext = createContext<EvaluationContextType | null>(null);

export function EvaluationProvider({ 
  children,
  playerId 
}: { 
  children: React.ReactNode;
  playerId: string;
}) {
  const evaluationSystem = useEvaluationSystem(playerId);

  return (
    <EvaluationContext.Provider value={evaluationSystem}>
      {children}
    </EvaluationContext.Provider>
  );
}

export function useEvaluation() {
  const context = useContext(EvaluationContext);
  if (!context) {
    throw new Error('useEvaluation must be used within an EvaluationProvider');
  }
  return context;
}