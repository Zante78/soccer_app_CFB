import { supabase } from './database';
import { NotificationPreference, PushNotification, NotificationResult } from '../types/core/notification';
import { handleDatabaseError, testDatabaseConnection } from './database';

export class NotificationService {
  private static instance: NotificationService;
  private initialized: boolean = false;
  private initPromise: Promise<void> | null = null;
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  
  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        throw new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
      }
      
      this.initialized = true;
    } catch (err) {
      this.initialized = false;
      throw err;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
      this.initPromise = null;
    }
  }

  async getNotifications(
    userId: string,
    options?: { 
      page?: number; 
      pageSize?: number; 
      read?: boolean 
    }
  ): Promise<NotificationResult<{ data: PushNotification[]; total: number }>> {
    try {
      await this.ensureInitialized();

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

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
    } catch (err) {
      // Retry logic for network errors
      if (err instanceof Error && err.message.includes('Failed to fetch') && this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.getNotifications(userId, options);
      }

      this.retryCount = 0;
      return { 
        error: handleDatabaseError(err)
      };
    }
  }

  async markAsRead(notificationIds: string[]): Promise<NotificationResult<void>> {
    try {
      await this.ensureInitialized();

      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', notificationIds);

      if (error) throw error;
      return {};
    } catch (err) {
      return { error: handleDatabaseError(err) };
    }
  }

  async deleteNotifications(notificationIds: string[]): Promise<NotificationResult<void>> {
    try {
      await this.ensureInitialized();

      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      if (error) throw error;
      return {};
    } catch (err) {
      return { error: handleDatabaseError(err) };
    }
  }

  async createNotification(
    notification: Omit<PushNotification, 'id' | 'createdAt' | 'read'>
  ): Promise<NotificationResult<PushNotification>> {
    try {
      await this.ensureInitialized();

      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          priority: notification.priority,
          data: notification.data,
          read: false
        }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (err) {
      return { error: handleDatabaseError(err) };
    }
  }
}