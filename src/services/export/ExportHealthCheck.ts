import { ExportMetricsCollector } from '../monitoring/ExportMetrics';
import { ExportLogger } from '../monitoring/ExportLogger';

export class ExportHealthCheck {
  private metrics: ExportMetricsCollector;
  private logger: ExportLogger;
  private healthChecks: Map<string, NodeJS.Timer> = new Map();
  
  private readonly MEMORY_THRESHOLD = 0.9; // 90% memory usage
  private readonly CPU_THRESHOLD = 0.8; // 80% CPU usage
  private readonly CHECK_INTERVAL = 5000; // 5 seconds

  constructor() {
    this.metrics = ExportMetricsCollector.getInstance();
    this.logger = ExportLogger.getInstance();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const memoryOk = await this.checkMemoryUsage();
      const concurrencyOk = await this.checkConcurrencyLimits();
      const systemOk = await this.checkSystemResources();

      return memoryOk && concurrencyOk && systemOk;
    } catch (error) {
      this.logger.log({
        jobId: 'system',
        userId: 'system',
        action: 'health_check',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Health check failed'
      });
      return false;
    }
  }

  public startMonitoring(jobId: string): void {
    if (this.healthChecks.has(jobId)) {
      return;
    }

    const interval = setInterval(async () => {
      const isHealthy = await this.checkHealth();
      
      this.logger.log({
        jobId,
        userId: 'system',
        action: 'health_check',
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          memory: await this.getMemoryUsage(),
          activeJobs: this.metrics.getMetrics().activeJobs
        }
      });

      if (!isHealthy) {
        this.handleUnhealthyState(jobId);
      }
    }, this.CHECK_INTERVAL);

    this.healthChecks.set(jobId, interval);
  }

  public stopMonitoring(jobId: string): void {
    const interval = this.healthChecks.get(jobId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(jobId);
    }
  }

  private async checkMemoryUsage(): Promise<boolean> {
    const usage = await this.getMemoryUsage();
    return usage < this.MEMORY_THRESHOLD;
  }

  private async checkConcurrencyLimits(): Promise<boolean> {
    const { activeJobs } = this.metrics.getMetrics();
    return activeJobs < 5; // Max 5 concurrent jobs
  }

  private async checkSystemResources(): Promise<boolean> {
    // Implementiere System-Resource-Checks
    return true;
  }

  private async getMemoryUsage(): Promise<number> {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const used = process.memoryUsage().heapUsed;
      const total = process.memoryUsage().heapTotal;
      return used / total;
    }
    return 0;
  }

  private handleUnhealthyState(jobId: string): void {
    this.logger.log({
      jobId,
      userId: 'system',
      action: 'health_alert',
      status: 'warning',
      details: {
        message: 'System health check failed',
        timestamp: new Date().toISOString()
      }
    });

    // Implementiere Benachrichtigungen oder andere Maßnahmen
  }
}