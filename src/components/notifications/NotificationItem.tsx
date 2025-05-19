import React from 'react';
import { PushNotification } from '../../types/core/notification';
import { NotificationActions } from './NotificationActions';
import { formatNotificationTime } from '../../utils/notificationUtils';

interface NotificationItemProps {
  notification: PushNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete
}: NotificationItemProps) {
  return (
    <div className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {notification.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {notification.body}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>
        <NotificationActions
          isRead={notification.read}
          onMarkAsRead={() => onMarkAsRead(notification.id)}
          onDelete={() => onDelete(notification.id)}
        />
      </div>
    </div>
  );
}