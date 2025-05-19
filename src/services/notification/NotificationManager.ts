import { NotificationService } from './NotificationService';
import { NotificationStorage } from './NotificationStorage';
import { NotificationQueue } from './NotificationQueue';
import { PushNotification } from '../../types/core/notification';

export class NotificationManager {
  private service: NotificationService;
  private storage: NotificationStorage;
  private queue: NotificationQueue;

  constructor() {
    this.service = new NotificationService();
    this.storage = new NotificationStorage();
    this.queue = new NotificationQueue();
  }

  async markAsRead(notificationIds: string[]) {
    try {
      await this.service.markAsRead(notificationIds);
      await this.storage.markAsRead(notificationIds);
    } catch (error) {
      // If online operation fails, queue it for later
      await this.queue.addToQueue('markAsRead', notificationIds);
      // Update local storage immediately for optimistic UI
      await this.storage.markAsRead(notificationIds);
    }
  }

  async deleteNotifications(notificationIds: string[]) {
    try {
      await this.service.deleteNotifications(notificationIds);
      await this.storage.deleteNotifications(notificationIds);
    } catch (error) {
      await this.queue.addToQueue('delete', notificationIds);
      // Update local storage immediately
      await this.storage.deleteNotifications(notificationIds);
    }
  }

  async processQueue() {
    await this.queue.processQueue();
  }
}