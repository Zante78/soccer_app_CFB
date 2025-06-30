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
import { ValidationError, ProcessingError, StorageError, handleExportError, ErrorCodes } from '../../utils/errorUtils';

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
    try {
      // Create ExportWorker with the correct format from config
      const worker = new ExportWorker(config.format);

      // Generate export data directly using supabase
      const { data, error } = await supabase
        .from(config.type === 'player' ? 'players' : 'teams')
        .select('*');

      if (error) {
        throw new ProcessingError(
          `Failed to fetch ${config.type} data: ${error.message}`,
          error
        );
      }

      if (!data || data.length === 0) {
        throw new ValidationError(
          `No ${config.type} data found to export`,
          ErrorCodes.VALIDATION.MISSING_FIELDS
        );
      }
      
      // Process in batches for progress tracking only
      await this.services.batchProcessor.processBatch(
        data || [],
        async (item) => {
          if (controller.signal.aborted) {
            throw new ProcessingError(
              'Export cancelled by user',
              ErrorCodes.PROCESSING.BATCH_FAILED
            );
          }
          // Just return a resolved promise instead of calling a non-existent method
          return Promise.resolve();
        },
        async (processed, total) => {
          const progress = Math.round((processed / total) * 100);
          await this.updateJobProgress(jobId, progress);
        }
      );

      // Format the entire dataset at once using the worker
      return await worker.processExport(data, config.format);
    } catch (error) {
      // Convert to appropriate error type if needed
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new ProcessingError(
            'Export processing timed out',
            ErrorCodes.PROCESSING.TIMEOUT,
            error
          );
        }
        if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
          throw new ProcessingError(
            'Network connection failed during export',
            ErrorCodes.SYSTEM.NETWORK_ERROR,
            error
          );
        }
      }
      throw error; // Re-throw if already a specific error type
    }
  }

  private async handleExportSuccess(jobId: string, result: Blob): Promise<void> {
    try {
      // Generate a download URL with simple timestamp-based filename
      const timestamp = new Date().getTime();
      const fileName = `export-${timestamp}.${this.getFileExtension(result)}`;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const userId = session.user.id;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('exports')
        .upload(filePath, result);
      
      if (uploadError) {
        throw new StorageError(
          `Failed to upload export file: ${uploadError.message}`,
          ErrorCodes.STORAGE.UPLOAD_FAILED,
          uploadError
        );
      }
      
      const { data: urlData } = supabase.storage
        .from('exports')
        .getPublicUrl(filePath);
      
      // Update job status with download URL
      await this.updateJobStatus(jobId, 'completed', { 
        result: {
          url: urlData.publicUrl,
          fileSize: result.size,
          fileName: fileName,
          mimeType: result.type,
          createdAt: new Date().toISOString()
        }
      });
      
      this.services.logger.log({
        jobId,
        action: 'complete',
        status: 'success',
        details: { size: result.size, fileName }
      });
    } catch (error) {
      // If storage fails, convert to a storage error
      if (!(error instanceof StorageError)) {
        throw new StorageError(
          'Failed to store export result',
          ErrorCodes.STORAGE.UPLOAD_FAILED,
          error
        );
      }
      throw error;
    }
  }

  private async handleExportError(jobId: string, error: unknown): Promise<void> {
    // Ensure error is properly structured for frontend consumption
    const errorResult = {
      error: {
        message: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
        code: error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.stack : String(error)
      }
    };

    await this.updateJobStatus(jobId, 'failed', errorResult);
    
    this.services.logger.log({
      jobId,
      action: 'complete',
      status: 'failed',
      error: errorResult.error.message
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
    // Clamp progress value to ensure it's always between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress || 0)));
    
    const { error } = await supabase
      .from('export_jobs')
      .update({ progress: clampedProgress })
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

  private getFileExtension(blob: Blob): string {
    switch (blob.type) {
      case 'text/csv':
        return 'csv';
      case 'application/json':
        return 'json';
      case 'application/pdf':
        return 'pdf';
      default:
        return 'txt';
    }
  }
}