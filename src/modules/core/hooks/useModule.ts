import { useEffect, useState } from 'react';
import { ModuleRegistry } from '../ModuleRegistry';
import { Module } from '../types';

export function useModule(moduleId: string) {
  const [module, setModule] = useState<Module>();
  const [dependencies, setDependencies] = useState<Module[]>([]);
  const [relatedModules, setRelatedModules] = useState<Module[]>([]);

  useEffect(() => {
    const registry = ModuleRegistry.getInstance();
    const mod = registry.getModule(moduleId);
    
    if (mod) {
      setModule(mod);
      setDependencies(registry.getDependencies(moduleId));
      setRelatedModules(registry.getRelatedModules(moduleId));
    }
  }, [moduleId]);

  return {
    module,
    dependencies,
    relatedModules,
    isLoaded: !!module
  };
}