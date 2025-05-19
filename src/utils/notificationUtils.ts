import { PushNotification } from '../types/core/notification';

export function groupNotificationsByDate(notifications: PushNotification[]) {
  return notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toLocaleDateString();
    return {
      ...groups,
      [date]: [...(groups[date] || []), notification],
    };
  }, {} as Record<string, PushNotification[]>);
}

export function filterNotifications(
  notifications: PushNotification[],
  filters: {
    read?: boolean;
    type?: PushNotification['type'];
    priority?: PushNotification['priority'];
  }
) {
  return notifications.filter(notification => {
    if (typeof filters.read === 'boolean' && notification.read !== filters.read) {
      return false;
    }
    if (filters.type && notification.type !== filters.type) {
      return false;
    }
    if (filters.priority && notification.priority !== filters.priority) {
      return false;
    }
    return true;
  });
}

export function formatNotificationTime(date: string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes}m ago`;
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  }
  return notificationDate.toLocaleDateString();
}