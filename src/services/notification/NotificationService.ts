import { supabase } from '../database';
import { PushNotification, NotificationResult } from '../../types/core/notification';
import { handleNotificationError } from '../../utils/errorUtils';

export class NotificationService {
  async getNotifications(
    userId: string,
    options?: { page?: number; pageSize?: number; read?: boolean }
  ): Promise<NotificationResult<{ data: PushNotification[]; total: number }>> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (typeof options?.read === 'boolean') {
        query = query.eq('read', options.read);
      }

      if (options?.page && options?.pageSize) {
        const start = (options.page - 1) * options.pageSize;
        const end = start + options.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: {
          data: data || [],
          total: count || 0
        }
      };
    } catch (error) {
      return { error: handleNotificationError(error) };
    }
  }

  async markAsRead(notificationIds: string[]): Promise<NotificationResult<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: handleNotificationError(error) };
    }
  }

  async deleteNotifications(notificationIds: string[]): Promise<NotificationResult<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      if (error) throw error;

      return {};
    } catch (error) {
      return { error: handleNotificationError(error) };
    }
  }

  async createNotification(
    notification: Omit<PushNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<NotificationResult<PushNotification>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{ ...notification, read: false }])
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return { error: handleNotificationError(error) };
    }
  }
}