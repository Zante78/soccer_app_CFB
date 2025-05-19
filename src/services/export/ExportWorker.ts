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

  async processExport(data: any[], cacheKey?: string): Promise<Blob> {
    // Check cache first
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    // Format data
    const result = await this.formatter.format(data);

    // Cache result if key provided
    if (cacheKey) {
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
    }

    return result;
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
}