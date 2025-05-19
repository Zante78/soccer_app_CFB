export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  weight: number; // 0-1, influences overall rating
}

export interface Skill {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  customizable: boolean;
  applicablePositions?: string[]; // empty means all positions
}

export interface PlayerEvaluation {
  id: string;
  playerId: string;
  evaluatorId: string;
  date: string;
  skills: SkillRating[];
  overallRating: number;
  context?: 'training' | 'match' | 'test';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillRating {
  skillId: string;
  value: number; // 0-20
  weight?: number; // override default weight
  notes?: string;
}