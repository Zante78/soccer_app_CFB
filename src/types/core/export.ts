// Export configuration types
export type ExportType = 'player' | 'team' | 'evaluation' | 'statistics';
export type ExportFormat = 'csv' | 'json' | 'pdf';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DateRange {
  start: string;
  end: string;
}

export interface ExportFilters {
  teams?: string[];
  players?: string[];
  categories?: string[];
  dateRange?: DateRange;
}

export interface ExportField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  path: string;
}

export interface ExportConfig {
  type: ExportType;
  format: ExportFormat;
  filters?: ExportFilters;
  includeFields: string[];
  excludeFields?: string[];
  options?: {
    batchSize?: number;
    maxRetries?: number;
    timeout?: number;
  };
}

export interface ExportResult {
  url?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  stats?: {
    totalRecords: number;
    processedRecords: number;
    fileSize: number;
    duration: number;
  };
}

export interface ExportJob {
  id: string;
  userId: string;
  config: ExportConfig;
  status: ExportStatus;
  progress?: number;
  result?: ExportResult;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export events for monitoring
export interface ExportEvent {
  jobId: string;
  userId: string;
  type: 'start' | 'progress' | 'complete' | 'error' | 'cancel';
  timestamp: number;
  data?: {
    progress?: number;
    error?: string;
    result?: ExportResult;
  };
}

// Export metrics for monitoring
export interface ExportMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  cacheHitRate: number;
}