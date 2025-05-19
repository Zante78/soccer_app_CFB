import { useState, useEffect } from 'react';
import { ModuleDataLoader } from '../services/ModuleDataLoader';

export function useModuleData(moduleId: string, params: Record<string, any> = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const loader = ModuleDataLoader.getInstance();
        const moduleData = await loader.loadModuleData(moduleId, params);
        setData(moduleData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Fehler beim Laden der Daten'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [moduleId, JSON.stringify(params)]);

  return { data, loading, error };
}