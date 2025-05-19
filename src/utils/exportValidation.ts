import { ExportConfig } from '../types/core/export';

// Ressourcen-Limits
const EXPORT_LIMITS = {
  MAX_ITEMS: 10000,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_CONCURRENT_JOBS: 3,
  MAX_BATCH_SIZE: 1000
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateExportConfig(config: ExportConfig): ValidationResult {
  const errors: string[] = [];

  // Pflichtfeld-Validierung
  if (!config.type) {
    errors.push('Bitte wählen Sie einen Export-Typ');
  } else if (!['player', 'team', 'evaluation', 'statistics'].includes(config.type)) {
    errors.push('Ungültiger Export-Typ');
  }

  if (!config.format) {
    errors.push('Bitte wählen Sie ein Export-Format');
  } else if (!['csv', 'json', 'pdf'].includes(config.format)) {
    errors.push('Ungültiges Export-Format');
  }

  if (!config.includeFields?.length) {
    errors.push('Bitte wählen Sie mindestens ein Feld zum Exportieren');
  }

  // Datumsbereich-Validierung
  if (config.dateRange) {
    const { start, end } = config.dateRange;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    if (startDate && endDate && startDate > endDate) {
      errors.push('Das Startdatum muss vor dem Enddatum liegen');
    }

    if (startDate && isNaN(startDate.getTime())) {
      errors.push('Ungültiges Startdatum');
    }

    if (endDate && isNaN(endDate.getTime())) {
      errors.push('Ungültiges Enddatum');
    }
  }

  // Filter-Validierung
  if (config.filters) {
    if (config.filters.teams?.length === 0) {
      errors.push('Bitte wählen Sie mindestens ein Team aus');
    }
    if (config.filters.players?.length === 0) {
      errors.push('Bitte wählen Sie mindestens einen Spieler aus');
    }
  }

  // Format-spezifische Validierung
  if (config.format === 'pdf' && !config.includeFields.includes('personal')) {
    errors.push('PDF-Exporte erfordern persönliche Daten');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function checkExportLimits(items: any[]): ValidationResult {
  const errors: string[] = [];

  if (items.length > EXPORT_LIMITS.MAX_ITEMS) {
    errors.push(`Maximale Anzahl von ${EXPORT_LIMITS.MAX_ITEMS} Items überschritten`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export { EXPORT_LIMITS };