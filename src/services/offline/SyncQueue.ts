interface SyncOperation {
  id: string;
  table: string;
  operation: 'upsert' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
}

export class SyncQueue {
  private queue: SyncOperation[] = [];
  private readonly MAX_RETRIES = 3;

  async addToQueue(table: string, operation: 'upsert' | 'delete', data: any) {
    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.queue.push(syncOp);
    await this.persistQueue();
    this.processSyncQueue();
  }

  private async persistQueue() {
    localStorage.setItem('sync_queue', JSON.stringify(this.queue));
  }

  private async loadQueue() {
    const savedQueue = localStorage.getItem('sync_queue');
    if (savedQueue) {
      this.queue = JSON.parse(savedQueue);
    }
  }

  private async processSyncQueue() {
    for (const operation of this.queue) {
      if (operation.retries >= this.MAX_RETRIES) {
        continue;
      }

      try {
        await this.performSync(operation);
        this.queue = this.queue.filter(op => op.id !== operation.id);
        await this.persistQueue();
      } catch (error) {
        operation.retries++;
        await this.persistQueue();
        console.error(`Sync failed for operation ${operation.id}:`, error);
      }
    }
  }

  private async performSync(operation: SyncOperation) {
    // Implementation will depend on your API structure
    const endpoint = `api/${operation.table}`;
    const method = operation.operation === 'upsert' ? 'POST' : 'DELETE';

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(operation.data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getPendingOperations(): SyncOperation[] {
    return [...this.queue];
  }
}