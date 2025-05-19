import React from 'react';
import { Check, Trash2, MoreVertical } from 'lucide-react';

interface NotificationActionsProps {
  isRead: boolean;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onMore?: () => void;
}

export function NotificationActions({ 
  isRead, 
  onMarkAsRead, 
  onDelete,
  onMore 
}: NotificationActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {!isRead && (
        <button
          onClick={onMarkAsRead}
          className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={onDelete}
        className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      {onMore && (
        <button
          onClick={onMore}
          className="p-1 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-50"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}