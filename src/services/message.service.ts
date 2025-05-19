import { supabase, handleDatabaseError } from './database';
import { Message, Conversation } from '../types/core/message';

export class MessageService {
  private static instance: MessageService;
  
  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          last_message:messages(*)
        `)
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async sendMessage(message: Omit<Message, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Message> {
    try {
      // Validate sender ID is a valid UUID
      if (!message.senderId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.senderId)) {
        throw new Error('Invalid sender ID');
      }

      // Validate recipient ID is a valid UUID
      if (!message.recipientId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(message.recipientId)) {
        throw new Error('Invalid recipient ID');
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: message.senderId,
          recipient_id: message.recipientId,
          content: message.content,
          type: message.type,
          status: 'sent'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async markAsRead(messageIds: string[]): Promise<void> {
    try {
      // Validate message IDs are valid UUIDs
      if (!messageIds.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
        throw new Error('Invalid message ID format');
      }

      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .in('id', messageIds);
      
      if (error) throw error;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Validate message ID is a valid UUID
      if (!messageId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
        throw new Error('Invalid message ID');
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}