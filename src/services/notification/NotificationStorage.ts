import { PushNotification } from '../../types/core/notification';

export class NotificationStorage {
  private readonly STORAGE_KEY = 'notifications';

  async getStoredNotifications(): Promise<PushNotification[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async storeNotification(notification: PushNotification) {
    const notifications = await this.getStoredNotifications();
    notifications.push(notification);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
  }

  async markAsRead(notificationIds: string[]) {
    const notifications = await this.getStoredNotifications();
    const updated = notifications.map(notification => 
      notificationIds.includes(notification.id) 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  async deleteNotifications(notificationIds: string[]) {
    const notifications = await this.getStoredNotifications();
    const filtered = notifications.filter(n => !notificationIds.includes(n.id));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}