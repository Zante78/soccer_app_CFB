export interface BatchOptions {
  batchSize?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  maxConcurrent?: number;
}

export class BatchProcessor {
  private readonly defaultOptions: Required<BatchOptions> = {
    batchSize: 100,
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    maxConcurrent: 3
  };

  private options: Required<BatchOptions>;

  constructor(options: BatchOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  async processBatch<T>(
    items: T[],
    processItem: (item: T) => Promise<void>,
    onProgress?: (processed: number, total: number) => void
  ): Promise<void> {
    const total = items.length;
    let processed = 0;
    let currentBatch = 0;

    // Process items in batches
    for (let i = 0; i < items.length; i += this.options.batchSize) {
      currentBatch++;
      const batch = items.slice(i, i + this.options.batchSize);
      
      // Process batch with retry logic and timeout
      await this.processBatchWithRetry(
        batch,
        processItem,
        currentBatch,
        async (completedInBatch) => {
          processed += completedInBatch;
          onProgress?.(processed, total);
        }
      );
    }
  }

  private async processBatchWithRetry<T>(
    batch: T[],
    processItem: (item: T) => Promise<void>,
    batchNumber: number,
    onBatchProgress: (completed: number) => Promise<void>,
    retryCount: number = 0
  ): Promise<void> {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Batch ${batchNumber} timed out`));
        }, this.options.timeout);
      });

      // Process items with concurrency limit
      const processPromise = this.processWithConcurrencyLimit(
        batch,
        processItem,
        onBatchProgress
      );

      // Race between processing and timeout
      await Promise.race([processPromise, timeoutPromise]);

    } catch (error) {
      if (retryCount >= this.options.maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = this.options.retryDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry batch
      await this.processBatchWithRetry(
        batch,
        processItem,
        batchNumber,
        onBatchProgress,
        retryCount + 1
      );
    }
  }

  private async processWithConcurrencyLimit<T>(
    items: T[],
    processItem: (item: T) => Promise<void>,
    onProgress: (completed: number) => Promise<void>
  ): Promise<void> {
    const queue = [...items];
    const inProgress = new Set<Promise<void>>();
    let completed = 0;

    while (queue.length > 0 || inProgress.size > 0) {
      // Fill up concurrent slots
      while (queue.length > 0 && inProgress.size < this.options.maxConcurrent) {
        const item = queue.shift()!;
        const promise = processItem(item)
          .then(async () => {
            completed++;
            await onProgress(completed);
            inProgress.delete(promise);
          })
          .catch(error => {
            inProgress.delete(promise);
            throw error;
          });

        inProgress.add(promise);
      }

      // Wait for at least one promise to complete
      if (inProgress.size > 0) {
        await Promise.race(inProgress);
      }
    }
  }
}