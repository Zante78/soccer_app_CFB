import React from 'react';
import { PushNotification } from '../../types/core/notification';
import { formatNotificationTime } from '../../utils/notificationUtils';

interface NotificationGroupProps {
  date: string;
  notifications: PushNotification[];
  children: (notification: PushNotification) => React.ReactNode;
}

export function NotificationGroup({ date, notifications, children }: NotificationGroupProps) {
  return (
    <div className="mb-4">
      <div className="sticky top-0 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500">
        {date}
      </div>
      <div className="divide-y divide-gray-200">
        {notifications.map(notification => children(notification))}
      </div>
    </div>
  );
}