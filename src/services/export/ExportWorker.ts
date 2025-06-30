import { ExportConfig } from '../../types/core/export';
import { ExportFormatter, CSVFormatter, JSONFormatter } from './formatters/ExportFormatter';

export class ExportWorker {
  private formatter: ExportFormatter;
  private cache: Map<string, { data: Blob; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

  constructor(format: ExportConfig['format']) {
    this.formatter = this.getFormatter(format);
  }

  private getFormatter(format: ExportConfig['format']): ExportFormatter {
    switch (format) {
      case 'csv':
        return new CSVFormatter();
      case 'json':
        return new JSONFormatter();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  async processExport(data: any[], format?: string): Promise<Blob> {
    // If format is provided, use a formatter for that format
    if (format) {
      const formatter = this.getFormatter(format as ExportConfig['format']);
      return await formatter.format(data);
    }
    
    // Otherwise use the default formatter
    return await this.formatter.format(data);
  }

  clearCache(): void {
    this.cache.clear();
  }

  cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  formatResult(data: any[], format: ExportConfig['format']): Promise<Blob> {
    const formatter = this.getFormatter(format);
    return formatter.format(data);
  }
}