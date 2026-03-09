/**
 * Generic retry utility with exponential backoff
 */

import { isRetryableError } from './errors.js';
import { logger } from './logger.js';

export type RetryOptions = {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries: number;
  /** Base delay in ms before first retry (default: 2000) */
  baseDelayMs?: number;
  /** Maximum delay cap in ms (default: 30000) */
  maxDelayMs?: number;
  /** Custom predicate to decide if error is retryable */
  shouldRetry?: (error: unknown) => boolean;
  /** Callback on each retry attempt */
  onRetry?: (error: unknown, attempt: number) => void;
};

/**
 * Wraps an async function with exponential backoff retry logic.
 *
 * Non-retryable errors (BotError with retryable=false) are thrown immediately.
 * Retryable errors are retried up to maxRetries times with increasing delay.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxRetries,
    baseDelayMs = 2000,
    maxDelayMs = 30_000,
    shouldRetry = isRetryableError,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Non-retryable errors: throw immediately
      if (!shouldRetry(error)) {
        throw error;
      }

      // Last attempt: throw
      if (attempt >= maxRetries) {
        break;
      }

      // Calculate delay with jitter
      const jitter = Math.random() * 1000;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + jitter, maxDelayMs);

      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.warn(
        `Retry ${attempt + 1}/${maxRetries}: ${errorMsg} — waiting ${Math.round(delay)}ms`
      );

      onRetry?.(error, attempt + 1);

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
