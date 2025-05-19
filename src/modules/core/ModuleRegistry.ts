import { Module } from './types';

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, Module> = new Map();

  private constructor() {}

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  registerModule(module: Module) {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered`);
    }
    
    // Verify dependencies
    module.dependencies.forEach(depId => {
      if (!this.modules.has(depId)) {
        throw new Error(`Dependency ${depId} not found for module ${module.id}`);
      }
    });

    this.modules.set(module.id, module);
  }

  getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  getDependencies(moduleId: string): Module[] {
    const module = this.getModule(moduleId);
    if (!module) return [];

    return module.dependencies
      .map(depId => this.getModule(depId))
      .filter((dep): dep is Module => dep !== undefined);
  }

  getRelatedModules(moduleId: string): Module[] {
    const module = this.getModule(moduleId);
    if (!module) return [];

    return module.relations
      .map(relation => this.getModule(relation.targetModule))
      .filter((mod): mod is Module => mod !== undefined);
  }
}