// Custom error classes
export class ExportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export class ValidationError extends ExportError {
  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: unknown) {
    super(message, code, details);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends ExportError {
  constructor(message: string, code: string = 'PROCESSING_ERROR', details?: unknown) {
    super(message, code, details);
    this.name = 'ProcessingError';
  }
}

export class StorageError extends ExportError {
  constructor(message: string, code: string = 'STORAGE_ERROR', details?: unknown) {
    super(message, code, details);
    this.name = 'StorageError';
  }
}

// Error codes
export const ErrorCodes = {
  VALIDATION: {
    INVALID_CONFIG: 'INVALID_CONFIG',
    MISSING_FIELDS: 'MISSING_FIELDS',
    INVALID_FORMAT: 'INVALID_FORMAT'
  },
  PROCESSING: {
    TIMEOUT: 'TIMEOUT',
    BATCH_FAILED: 'BATCH_FAILED',
    CONVERSION_FAILED: 'CONVERSION_FAILED'
  },
  STORAGE: {
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    DELETE_FAILED: 'DELETE_FAILED',
    SIZE_EXCEEDED: 'SIZE_EXCEEDED'
  },
  SYSTEM: {
    DATABASE_ERROR: 'DATABASE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  }
} as const;

// Error handlers
export function handleExportError(error: unknown): ExportError {
  if (error instanceof ExportError) {
    return error;
  }

  if (error instanceof Error) {
    if (error.message.includes('network')) {
      return new ExportError(
        'Network connection failed',
        ErrorCodes.SYSTEM.NETWORK_ERROR,
        error
      );
    }
    if (error.message.includes('timeout')) {
      return new ProcessingError(
        'Export processing timed out',
        ErrorCodes.PROCESSING.TIMEOUT,
        error
      );
    }
    if (error.message.includes('Failed to fetch')) {
      return new ExportError(
        'Database connection failed',
        ErrorCodes.SYSTEM.DATABASE_ERROR,
        error
      );
    }
    return new ExportError(
      error.message,
      ErrorCodes.SYSTEM.UNKNOWN_ERROR,
      error
    );
  }

  return new ExportError(
    'An unexpected error occurred',
    ErrorCodes.SYSTEM.UNKNOWN_ERROR,
    error
  );
}

// Validation helpers
export function validateExportSize(size: number, maxSize: number): void {
  if (size > maxSize) {
    throw new StorageError(
      `Export size (${size}) exceeds maximum allowed size (${maxSize})`,
      ErrorCodes.STORAGE.SIZE_EXCEEDED
    );
  }
}

export function validateExportFormat(format: string, allowedFormats: string[]): void {
  if (!allowedFormats.includes(format)) {
    throw new ValidationError(
      `Invalid export format: ${format}. Allowed formats: ${allowedFormats.join(', ')}`,
      ErrorCodes.VALIDATION.INVALID_FORMAT
    );
  }
}

// Error recovery helpers
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ExportError) {
    return [
      ErrorCodes.SYSTEM.NETWORK_ERROR,
      ErrorCodes.PROCESSING.TIMEOUT,
      ErrorCodes.STORAGE.UPLOAD_FAILED
    ].includes(error.code);
  }
  return false;
}

export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
}