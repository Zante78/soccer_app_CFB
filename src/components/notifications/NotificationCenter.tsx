import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationBadge } from './NotificationBadge';
import { NotificationList } from './NotificationList';
import { NotificationErrorBoundary } from './NotificationErrorBoundary';
import { Pagination } from '../common/Pagination';
import { groupNotificationsByDate } from '../../utils/notificationUtils';
import { NotificationGroup } from './NotificationGroup';
import { NotificationItem } from './NotificationItem';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader } from 'lucide-react';
import { supabase } from '../../services/database';

export function NotificationCenter() {
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const { 
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    markAsRead,
    deleteNotifications
  } = useNotifications(userId);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead([id]);
  };

  const handleDelete = async (id: string) => {
    await deleteNotifications([id]);
  };

  if (!userId) {
    return null;
  }

  if (error?.includes('Failed to fetch')) {
    return <DatabaseConnectionError />;
  }

  const groupedNotifications = groupNotificationsByDate(notifications || []);

  return (
    <div className="relative">
      <NotificationBadge 
        count={unreadCount || 0} 
        onClick={() => setShowDropdown(!showDropdown)} 
      />

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Benachrichtigungen
            </h3>
          </div>

          <NotificationErrorBoundary>
            {loading ? (
              <div className="p-4 text-center">
                <Loader className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              </div>
            ) : (
              <>
                {Object.entries(groupedNotifications).map(([date, items]) => (
                  <NotificationGroup key={date} date={date} notifications={items}>
                    {(notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    )}
                  </NotificationGroup>
                ))}

                {notifications && notifications.length > 0 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={pagination.goToPage}
                    hasNextPage={pagination.hasNextPage}
                    hasPreviousPage={pagination.hasPreviousPage}
                  />
                )}

                {(!notifications || notifications.length === 0) && (
                  <div className="p-4 text-center text-gray-500">
                    Keine Benachrichtigungen vorhanden
                  </div>
                )}
              </>
            )}
          </NotificationErrorBoundary>
        </div>
      )}
    </div>
  );
}