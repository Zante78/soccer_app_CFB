import { useState, useCallback } from 'react';
import { ClubService } from '../services/club.service';

const clubService = new ClubService();

export function useClubSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clubService.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLogo = useCallback(async (logoUrl: string) => {
    if (!settings) return;
    
    try {
      setError(null);
      const updatedSettings = await clubService.updateSettings({
        logo_url: logoUrl
      });
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update logo'));
      throw err;
    }
  }, [settings]);

  const updateName = useCallback(async (name: string) => {
    if (!settings) return;
    
    try {
      setError(null);
      const updatedSettings = await clubService.updateSettings({ name });
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update name'));
      throw err;
    }
  }, [settings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateLogo,
    updateName
  };
}