import { useState } from 'react';
import { Team } from '../../../types/core/team';

export function useTeamForm(
  team: Team | undefined,
  onSave: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
) {
  const [formData, setFormData] = useState<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>({
    name: team?.name || '',
    category: team?.category || '',
    season: team?.season || new Date().getFullYear().toString(),
    photoUrl: team?.photoUrl || '',
    colors: team?.colors || { primary: '#000000', secondary: '#ffffff' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      setError('Bitte geben Sie einen Teamnamen ein');
      return;
    }
    if (!formData.category?.trim()) {
      setError('Bitte wählen Sie eine Kategorie');
      return;
    }
    if (!formData.season?.trim()) {
      setError('Bitte geben Sie eine Saison an');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(formData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    error
  };
}