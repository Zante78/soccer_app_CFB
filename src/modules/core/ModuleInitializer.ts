import { ModuleRegistry } from './ModuleRegistry';
import { CORE_MODULES } from './types';
import { MEDICAL_MODULE } from '../medical/MedicalModule';
import { EXPORT_MODULE } from '../export/ExportModule';
import { HISTORY_MODULE } from '../history/HistoryModule';

export class ModuleInitializer {
  static initialize() {
    const registry = ModuleRegistry.getInstance();

    // Register core modules first
    CORE_MODULES.forEach(module => {
      registry.registerModule(module);
    });

    // Register additional modules
    registry.registerModule(MEDICAL_MODULE);
    registry.registerModule(EXPORT_MODULE);
    registry.registerModule(HISTORY_MODULE);
  }
}