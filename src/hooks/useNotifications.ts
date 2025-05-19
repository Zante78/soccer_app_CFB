import { useState, useEffect } from 'react';
import { NotificationService } from '../services/notification.service';
import { PushNotification } from '../types/core/notification';
import { usePagination } from './usePagination';
import { supabase } from '../services/database';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pagination = usePagination({ pageSize: 20 });
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    if (userId) {
      loadNotifications();

      // Subscribe to real-time notifications
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          const newNotification = payload.new as PushNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId, pagination.currentPage]);

  const loadNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await notificationService.getNotifications(userId, {
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      });

      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setNotifications(result.data.data);
        pagination.setTotalItems(result.data.total);
        setUnreadCount(result.data.data.filter(n => !n.read).length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    if (!userId) return;

    try {
      setError(null);
      const result = await notificationService.markAsRead(notificationIds);
      if (result.error) throw result.error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification.id) 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notifications as read');
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!userId) return;

    try {
      setError(null);
      const result = await notificationService.deleteNotifications(notificationIds);
      if (result.error) throw result.error;
      
      setNotifications(prev => 
        prev.filter(notification => !notificationIds.includes(notification.id))
      );
      loadNotifications(); // Reload to update counts and pagination
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notifications');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    markAsRead,
    deleteNotifications,
    loadNotifications
  };
}