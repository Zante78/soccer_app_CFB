import { supabase } from '../database';
import { Skill, SkillCategory } from '../../types/core/skills';

export class SkillService {
  private static instance: SkillService;
  
  private constructor() {}

  public static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService();
    }
    return SkillService.instance;
  }

  async getCategories(): Promise<SkillCategory[]> {
    try {
      const { data, error } = await supabase
        .from('skill_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Kategorien:', err);
      throw err;
    }
  }

  async getSkills(categoryId?: string): Promise<Skill[]> {
    try {
      let query = supabase.from('skills').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Fehler beim Laden der Fähigkeiten:', err);
      throw err;
    }
  }
}