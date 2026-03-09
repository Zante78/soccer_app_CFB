/**
 * Bot Error Classes — Categorized errors with retry semantics
 */

export const ErrorCategory = {
  CREDENTIALS: 'CREDENTIALS',
  TIMEOUT: 'TIMEOUT',
  NAVIGATION: 'NAVIGATION',
  FORM: 'FORM',
  VISUAL_REGRESSION: 'VISUAL_REGRESSION',
  UPLOAD: 'UPLOAD',
  SAFETY: 'SAFETY',
  TWO_FACTOR: 'TWO_FACTOR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

/** Errors that should NOT be retried */
const NON_RETRYABLE: ReadonlySet<ErrorCategory> = new Set([
  ErrorCategory.CREDENTIALS,
  ErrorCategory.SAFETY,
  ErrorCategory.VISUAL_REGRESSION,
  ErrorCategory.TWO_FACTOR,
]);

export class BotError extends Error {
  readonly category: ErrorCategory;
  readonly retryable: boolean;
  screenshotPath?: string;

  constructor(
    message: string,
    category: ErrorCategory,
    options?: { screenshotPath?: string; cause?: unknown }
  ) {
    super(message, { cause: options?.cause });
    this.name = 'BotError';
    this.category = category;
    this.retryable = !NON_RETRYABLE.has(category);
    this.screenshotPath = options?.screenshotPath;
  }
}

/**
 * Auto-classify Playwright errors into BotError categories
 */
export function categorizePlaywrightError(error: unknown): BotError {
  if (error instanceof BotError) return error;

  const message = error instanceof Error ? error.message : String(error);
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('timeout') || lowerMsg.includes('exceeded')) {
    return new BotError(message, ErrorCategory.TIMEOUT, { cause: error });
  }

  if (lowerMsg.includes('net::err') || lowerMsg.includes('navigation')) {
    return new BotError(message, ErrorCategory.NAVIGATION, { cause: error });
  }

  if (lowerMsg.includes('session') || lowerMsg.includes('401') || lowerMsg.includes('unauthorized')) {
    return new BotError(message, ErrorCategory.CREDENTIALS, { cause: error });
  }

  if (lowerMsg.includes('upload') || lowerMsg.includes('file')) {
    return new BotError(message, ErrorCategory.UPLOAD, { cause: error });
  }

  return new BotError(message, ErrorCategory.UNKNOWN, { cause: error });
}

/**
 * Check if an error is retryable (works with any error type)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof BotError) return error.retryable;
  return true; // Unknown errors get one retry
}
