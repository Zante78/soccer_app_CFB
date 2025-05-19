import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation } from '../types/core/message';
import { MessageService } from '../services/message.service';
import { supabase } from '../services/database';

const messageService = MessageService.getInstance();

export function useMessages(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadConversations();

      // Subscribe to new messages
      const subscription = supabase
        .channel('messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          setCurrentMessages(prev => [...prev, newMessage]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getConversations(userId);
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getMessages(conversationId);
      setCurrentMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: Omit<Message, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newMessage = await messageService.sendMessage(message);
      setCurrentMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      setError(null);
      await messageService.markAsRead(messageIds);
      setCurrentMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg.id) 
            ? { ...msg, status: 'read' } 
            : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
      throw err;
    }
  }, []);

  return {
    conversations,
    currentMessages,
    loading,
    error,
    loadMessages,
    sendMessage,
    markAsRead
  };
}