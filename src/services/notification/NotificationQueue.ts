import { PushNotification } from '../../types/core/notification';

export interface QueuedOperation {
  id: string;
  type: 'markAsRead' | 'delete';
  notificationIds: string[];
  timestamp: number;
  retryCount: number;
}

export class NotificationQueue {
  private readonly QUEUE_KEY = 'notification_queue';
  private readonly MAX_RETRIES = 3;

  async addToQueue(type: QueuedOperation['type'], notificationIds: string[]): Promise<void> {
    const queue = await this.getQueue();
    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      notificationIds,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    queue.push(operation);
    await this.saveQueue(queue);
  }

  async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    const remainingOperations: QueuedOperation[] = [];

    for (const operation of queue) {
      if (operation.retryCount >= this.MAX_RETRIES) {
        continue;
      }

      try {
        await this.processOperation(operation);
      } catch (error) {
        operation.retryCount++;
        remainingOperations.push(operation);
      }
    }

    await this.saveQueue(remainingOperations);
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    // Implementation will depend on your API
    const endpoint = operation.type === 'markAsRead' 
      ? '/api/notifications/mark-read'
      : '/api/notifications/delete';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: operation.notificationIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to process operation: ${response.statusText}`);
    }
  }

  private async getQueue(): Promise<QueuedOperation[]> {
    const stored = localStorage.getItem(this.QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }
}