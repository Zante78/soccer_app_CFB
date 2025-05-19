import { ExportError } from '../../utils/errorUtils';
import { ExportLogger } from '../monitoring/ExportLogger';
import { ExportMetricsCollector } from '../monitoring/ExportMetrics';

export class ErrorReporter {
  private static instance: ErrorReporter;
  private logger: ExportLogger;
  private metrics: ExportMetricsCollector;

  private constructor() {
    this.logger = ExportLogger.getInstance();
    this.metrics = ExportMetricsCollector.getInstance();
  }

  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  public reportError(error: unknown, context: {
    jobId: string;
    userId: string;
    phase: 'validation' | 'processing' | 'storage';
    attempt?: number;
  }): void {
    const exportError = error instanceof ExportError ? error : new ExportError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      error
    );

    // Log error
    this.logger.log({
      jobId: context.jobId,
      userId: context.userId,
      action: context.phase,
      status: 'failed',
      error: exportError.message,
      details: {
        code: exportError.code,
        attempt: context.attempt,
        stack: exportError.stack
      }
    });

    // Update metrics
    this.metrics.incrementMetric('failedJobs');
    if (context.phase === 'processing') {
      this.metrics.incrementMetric('processingErrors');
    }

    // Additional error-specific handling
    if (exportError.code === 'STORAGE_ERROR') {
      this.metrics.incrementMetric('storageErrors');
    }
  }

  public async notifyUser(userId: string, error: ExportError): Promise<void> {
    // Implement user notification logic here
    // This could integrate with a notification service
  }
}