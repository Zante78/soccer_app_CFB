import React from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { PushNotification } from '../../types/core/notification';
import { Check, Trash2 } from 'lucide-react';

interface NotificationListProps {
  notifications: PushNotification[];
  onMarkAsRead: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
}

export function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onDelete 
}: NotificationListProps) {
  const { t } = useTranslation();

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t('notifications.empty')}
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600">
                {notification.body}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2 ml-4">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead([notification.id])}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete([notification.id])}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}