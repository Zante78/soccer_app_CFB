export interface ExportLogEntry {
  jobId: string;
  userId: string;
  action: string;
  status: string;
  timestamp: number;
  details?: any;
  error?: string;
  performance?: {
    duration: number;
    memory: number;
    batchSize: number;
  };
}

export class ExportLogger {
  private static instance: ExportLogger;
  private logs: Map<string, ExportLogEntry[]> = new Map();
  private readonly MAX_LOG_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_LOGS_PER_JOB = 100;
  
  private constructor() {
    this.startPeriodicCleanup();
  }

  public static getInstance(): ExportLogger {
    if (!ExportLogger.instance) {
      ExportLogger.instance = new ExportLogger();
    }
    return ExportLogger.instance;
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupLogs();
    }, 60 * 60 * 1000); // Hourly cleanup
  }

  public log(entry: Omit<ExportLogEntry, 'timestamp'>): void {
    const jobLogs = this.logs.get(entry.jobId) || [];
    
    // Add timestamp and performance metrics
    const fullEntry: ExportLogEntry = {
      ...entry,
      timestamp: Date.now(),
      performance: {
        duration: 0,
        memory: this.getCurrentMemoryUsage(),
        batchSize: 0,
        ...entry.performance
      }
    };

    // Limit logs per job
    if (jobLogs.length >= this.MAX_LOGS_PER_JOB) {
      jobLogs.shift(); // Remove oldest log
    }

    jobLogs.push(fullEntry);
    this.logs.set(entry.jobId, jobLogs);
  }

  public getJobLogs(jobId: string): ExportLogEntry[] {
    return this.logs.get(jobId) || [];
  }

  public getErrorLogs(jobId: string): ExportLogEntry[] {
    const logs = this.logs.get(jobId) || [];
    return logs.filter(log => log.error);
  }

  public getPerformanceLogs(jobId: string): ExportLogEntry[] {
    const logs = this.logs.get(jobId) || [];
    return logs.filter(log => log.performance);
  }

  private cleanupLogs(): void {
    const now = Date.now();
    for (const [jobId, entries] of this.logs.entries()) {
      const filteredEntries = entries.filter(
        entry => now - entry.timestamp < this.MAX_LOG_AGE
      );
      if (filteredEntries.length === 0) {
        this.logs.delete(jobId);
      } else {
        this.logs.set(jobId, filteredEntries);
      }
    }
  }

  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
    return 0;
  }

  public async persistLogs(jobId: string): Promise<void> {
    const logs = this.logs.get(jobId);
    if (!logs) return;

    try {
      // Implementiere hier die Persistierung der Logs
      // z.B. in Supabase oder einem anderen Speicher
    } catch (error) {
      console.error('Failed to persist logs:', error);
    }
  }
}