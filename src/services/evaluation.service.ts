import { supabase, handleDatabaseError } from './database';
import { PlayerEvaluation } from '../types/core/evaluation';
import { Skill, SkillCategory } from '../types/core/skills';

export class EvaluationService {
  private static instance: EvaluationService;
  
  private constructor() {}

  public static getInstance(): EvaluationService {
    if (!EvaluationService.instance) {
      EvaluationService.instance = new EvaluationService();
    }
    return EvaluationService.instance;
  }

  async getLatestEvaluation(playerId: string): Promise<PlayerEvaluation | null> {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          skills:evaluation_skills(*)
        `)
        .eq('player_id', playerId)
        .order('date', { ascending: false })
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createEvaluation(evaluation: Omit<PlayerEvaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlayerEvaluation> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sie müssen angemeldet sein, um eine Bewertung zu erstellen');
      }

      const { data: newEvaluation, error: evalError } = await supabase
        .from('evaluations')
        .insert([{
          player_id: evaluation.playerId,
          evaluator_id: session.user.id,
          date: evaluation.date,
          context: evaluation.context,
          overall_rating: evaluation.overallRating,
          notes: evaluation.notes
        }])
        .select()
        .single();

      if (evalError) throw evalError;

      const skillRatings = evaluation.skills.map(skill => ({
        evaluation_id: newEvaluation.id,
        skill_id: skill.skillId,
        value: skill.value,
        notes: skill.notes
      }));

      const { error: skillsError } = await supabase
        .from('evaluation_skills')
        .insert(skillRatings);

      if (skillsError) throw skillsError;

      return {
        ...newEvaluation,
        skills: evaluation.skills
      };
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async calculateOverallRating(
    skillRatings: { skillId: string; value: number }[],
    skills: Skill[],
    categories: SkillCategory[]
  ): Promise<number> {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const rating of skillRatings) {
      const skill = skills.find(s => s.id === rating.skillId);
      if (!skill) continue;

      const category = categories.find(c => c.id === skill.categoryId);
      if (!category) continue;

      const weight = skill.weight * category.weight;
      weightedSum += rating.value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}