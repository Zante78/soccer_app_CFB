import { useState, useEffect } from 'react';
import { Skill, SkillCategory, SKILLS, SKILL_CATEGORIES } from '../types/core/skills';

export function useSkills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, we'll use the static data from types
        // Later this can be replaced with API calls
        setCategories(SKILL_CATEGORIES);
        setSkills(SKILLS);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load skills data');
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  return {
    categories,
    skills,
    loading,
    error
  };
}