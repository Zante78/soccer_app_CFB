import { ExportConfig } from '../../types/core/export';
import { ValidationError } from '../../utils/errorUtils';

export class ExportValidator {
  private readonly MAX_FIELDS = 50;
  private readonly ALLOWED_FORMATS = ['csv', 'json', 'pdf'];
  private readonly ALLOWED_TYPES = ['player', 'team', 'evaluation', 'statistics'];

  public async validateConfig(config: ExportConfig): Promise<void> {
    // Validate basic structure
    if (!config) {
      throw new ValidationError('Export configuration is required');
    }

    // Validate type
    if (!config.type || !this.ALLOWED_TYPES.includes(config.type)) {
      throw new ValidationError(
        `Invalid export type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      );
    }

    // Validate format
    if (!config.format || !this.ALLOWED_FORMATS.includes(config.format)) {
      throw new ValidationError(
        `Invalid export format. Allowed formats: ${this.ALLOWED_FORMATS.join(', ')}`
      );
    }

    // Validate fields
    if (!config.includeFields?.length) {
      throw new ValidationError('At least one field must be included');
    }

    if (config.includeFields.length > this.MAX_FIELDS) {
      throw new ValidationError(`Maximum number of fields (${this.MAX_FIELDS}) exceeded`);
    }

    // Validate date range if present
    if (config.filters?.dateRange) {
      const { start, end } = config.filters.dateRange;
      
      if (!this.isValidDate(start) || !this.isValidDate(end)) {
        throw new ValidationError('Invalid date format in date range');
      }

      if (new Date(start) > new Date(end)) {
        throw new ValidationError('Start date must be before end date');
      }
    }

    // Validate options if present
    if (config.options) {
      this.validateOptions(config.options);
    }
  }

  private validateOptions(options: ExportConfig['options']): void {
    if (options.batchSize && (
      !Number.isInteger(options.batchSize) ||
      options.batchSize < 1 ||
      options.batchSize > 1000
    )) {
      throw new ValidationError('Batch size must be between 1 and 1000');
    }

    if (options.maxRetries && (
      !Number.isInteger(options.maxRetries) ||
      options.maxRetries < 0 ||
      options.maxRetries > 10
    )) {
      throw new ValidationError('Max retries must be between 0 and 10');
    }

    if (options.timeout && (
      !Number.isInteger(options.timeout) ||
      options.timeout < 1000 ||
      options.timeout > 300000
    )) {
      throw new ValidationError('Timeout must be between 1000 and 300000 ms');
    }
  }

  private isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }
}