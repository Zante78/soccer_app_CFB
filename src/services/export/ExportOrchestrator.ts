import { ExportConfig, ExportJob } from '../../types/core/export';
import { supabase } from '../database';
import { ExportCache } from './ExportCache';
import { ExportWorker } from './ExportWorker';
import { BatchProcessor } from './BatchProcessor';
import { ConcurrencyManager } from './ConcurrencyManager';
import { ExportLogger } from '../monitoring/ExportLogger';
import { ExportMetricsCollector } from '../monitoring/ExportMetrics';
import { ErrorReporter } from './ErrorReporter';
import { ExportValidator } from './ExportValidator';
import { ExportNotifier } from './ExportNotifier';
import { ExportHealthCheck } from './ExportHealthCheck';

/**
 * Orchestrator für den Export-Prozess
 * Koordiniert die verschiedenen Komponenten und überwacht den Gesamtprozess
 */
export class ExportOrchestrator {
  private static instance: ExportOrchestrator;
  private readonly services: {
    cache: ExportCache;
    worker: ExportWorker;
    batchProcessor: BatchProcessor;
    concurrencyManager: ConcurrencyManager;
    logger: ExportLogger;
    metrics: ExportMetricsCollector;
    errorReporter: ErrorReporter;
    validator: ExportValidator;
    notifier: ExportNotifier;
    healthCheck: ExportHealthCheck;
  };

  private constructor() {
    this.services = {
      cache: ExportCache.getInstance(),
      worker: new ExportWorker('csv'),
      batchProcessor: new BatchProcessor(),
      concurrencyManager: ConcurrencyManager.getInstance(),
      logger: ExportLogger.getInstance(),
      metrics: ExportMetricsCollector.getInstance(),
      errorReporter: ErrorReporter.getInstance(),
      validator: new ExportValidator(),
      notifier: new ExportNotifier(),
      healthCheck: new ExportHealthCheck()
    };
  }

  public static getInstance(): ExportOrchestrator {
    if (!ExportOrchestrator.instance) {
      ExportOrchestrator.instance = new ExportOrchestrator();
    }
    return ExportOrchestrator.instance;
  }

  public async startExport(config: ExportConfig, userId: string): Promise<ExportJob> {
    const startTime = Date.now();
    let job: ExportJob;

    try {
      // Validate export configuration
      await this.services.validator.validateConfig(config);

      // Check system health
      await this.services.healthCheck.checkHealth();

      // Create export job
      const { data, error } = await supabase
        .from('export_jobs')
        .insert([{
          user_id: userId,
          config,
          status: 'pending',
          progress: 0
        }])
        .select()
        .single();

      if (error) throw error;
      job = data;

      // Start monitoring
      this.startMonitoring(job.id);

      // Process export asynchronously
      this.processExport(job.id, userId, config).catch(error => {
        this.services.errorReporter.reportError(error, {
          jobId: job.id,
          userId,
          phase: 'processing'
        });
      });

      // Record metrics
      this.services.metrics.recordProcessingTime(Date.now() - startTime);
      
      return job;

    } catch (error) {
      this.services.metrics.incrementMetric('failedJobs');
      throw error;
    }
  }

  private async processExport(jobId: string, userId: string, config: ExportConfig): Promise<void> {
    const controller = await this.services.concurrencyManager.acquireLock(jobId);

    try {
      // Update status and metrics
      await this.updateJobStatus(jobId, 'processing');
      this.services.metrics.incrementMetric('activeJobs');

      // Check cache
      const cacheKey = this.getCacheKey(config);
      const cachedData = await this.services.cache.get(cacheKey);
      
      if (cachedData) {
        this.services.metrics.recordCacheHit();
        await this.handleExportSuccess(jobId, cachedData);
        return;
      }

      this.services.metrics.recordCacheMiss();

      // Process data
      const result = await this.processData(jobId, config, controller);
      
      // Cache result
      await this.services.cache.set(cacheKey, result);

      // Handle success
      await this.handleExportSuccess(jobId, result);

      // Notify user
      await this.services.notifier.notifySuccess(userId, jobId);

    } catch (error) {
      await this.handleExportError(jobId, error);
      await this.services.notifier.notifyError(userId, jobId, error);
    } finally {
      this.services.concurrencyManager.releaseLock(jobId);
      this.services.metrics.decrementMetric('activeJobs');
      this.services.metrics.incrementMetric('completedJobs');
      this.stopMonitoring(jobId);
    }
  }

  private startMonitoring(jobId: string): void {
    this.services.healthCheck.startMonitoring(jobId);
  }

  private stopMonitoring(jobId: string): void {
    this.services.healthCheck.stopMonitoring(jobId);
  }

  private async processData(
    jobId: string, 
    config: ExportConfig,
    controller: AbortController
  ): Promise<Blob> {
    // Generate export data directly using supabase
    const { data, error } = await supabase
      .from(config.type === 'player' ? 'players' : 'teams')
      .select('*');

    if (error) throw error;
    
    // Process in batches
    const processedData = await this.services.batchProcessor.processBatch(
      data || [],
      async (item) => {
        if (controller.signal.aborted) {
          throw new Error('Export cancelled');
        }
        return this.services.worker.processItem(item);
      },
      async (processed, total) => {
        const progress = Math.round((processed / total) * 100);
        await this.updateJobProgress(jobId, progress);
      }
    );

    // Format final result
    return this.services.worker.formatResult(processedData, config.format);
  }

  private async handleExportSuccess(jobId: string, result: Blob): Promise<void> {
    await this.updateJobStatus(jobId, 'completed', { result });
    
    this.services.logger.log({
      jobId,
      action: 'complete',
      status: 'success',
      details: { size: result.size }
    });
  }

  private async handleExportError(jobId: string, error: unknown): Promise<void> {
    await this.updateJobStatus(jobId, 'failed', { error });
    
    this.services.logger.log({
      jobId,
      action: 'complete',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  private async updateJobStatus(
    jobId: string,
    status: ExportJob['status'],
    details?: any
  ): Promise<void> {
    const { error } = await supabase
      .from('export_jobs')
      .update({ 
        status,
        result: details,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) throw error;
  }

  private async updateJobProgress(jobId: string, progress: number): Promise<void> {
    const { error } = await supabase
      .from('export_jobs')
      .update({ progress })
      .eq('id', jobId);

    if (error) throw error;
  }

  private getCacheKey(config: ExportConfig): string {
    return JSON.stringify({
      type: config.type,
      format: config.format,
      filters: config.filters,
      includeFields: config.includeFields
    });
  }
}