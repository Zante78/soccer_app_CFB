export interface ExportMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  storageErrors: number;
  processingErrors: number;
  validationErrors: number;
  retryCount: number;
  batchProcessingTime: number;
  memoryUsage: number;
}

export class ExportMetricsCollector {
  private static instance: ExportMetricsCollector;
  private metrics: Map<string, number> = new Map();
  private processingTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;
  private readonly MAX_HISTORY = 1000;

  private constructor() {
    this.initializeMetrics();
    this.startPeriodicCleanup();
  }

  public static getInstance(): ExportMetricsCollector {
    if (!ExportMetricsCollector.instance) {
      ExportMetricsCollector.instance = new ExportMetricsCollector();
    }
    return ExportMetricsCollector.instance;
  }

  private initializeMetrics(): void {
    this.metrics.set('totalJobs', 0);
    this.metrics.set('activeJobs', 0);
    this.metrics.set('completedJobs', 0);
    this.metrics.set('failedJobs', 0);
    this.metrics.set('storageErrors', 0);
    this.metrics.set('processingErrors', 0);
    this.metrics.set('validationErrors', 0);
    this.metrics.set('retryCount', 0);
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Hourly cleanup
  }

  private cleanupOldData(): void {
    if (this.processingTimes.length > this.MAX_HISTORY) {
      this.processingTimes = this.processingTimes.slice(-this.MAX_HISTORY);
    }
  }

  public incrementMetric(name: keyof ExportMetrics): void {
    const currentValue = this.metrics.get(name) || 0;
    this.metrics.set(name, currentValue + 1);
  }

  public decrementMetric(name: keyof ExportMetrics): void {
    const currentValue = this.metrics.get(name) || 0;
    this.metrics.set(name, Math.max(0, currentValue - 1));
  }

  public recordProcessingTime(milliseconds: number): void {
    this.processingTimes.push(milliseconds);
    this.cleanupOldData();
  }

  public recordBatchProcessingTime(milliseconds: number): void {
    const currentTotal = this.metrics.get('batchProcessingTime') || 0;
    this.metrics.set('batchProcessingTime', currentTotal + milliseconds);
  }

  public recordMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      this.metrics.set('memoryUsage', Math.round(used * 100) / 100);
    }
  }

  public recordCacheHit(): void {
    this.cacheHits++;
  }

  public recordCacheMiss(): void {
    this.cacheMisses++;
  }

  public getMetrics(): ExportMetrics {
    const avgTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      : 0;

    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0
      ? this.cacheHits / totalCacheRequests
      : 0;

    return {
      totalJobs: this.metrics.get('totalJobs') || 0,
      activeJobs: this.metrics.get('activeJobs') || 0,
      completedJobs: this.metrics.get('completedJobs') || 0,
      failedJobs: this.metrics.get('failedJobs') || 0,
      storageErrors: this.metrics.get('storageErrors') || 0,
      processingErrors: this.metrics.get('processingErrors') || 0,
      validationErrors: this.metrics.get('validationErrors') || 0,
      retryCount: this.metrics.get('retryCount') || 0,
      averageProcessingTime: avgTime,
      cacheHitRate,
      batchProcessingTime: this.metrics.get('batchProcessingTime') || 0,
      memoryUsage: this.metrics.get('memoryUsage') || 0
    };
  }

  public reset(): void {
    this.metrics.clear();
    this.initializeMetrics();
    this.processingTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}