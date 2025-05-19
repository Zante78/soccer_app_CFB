import { User } from './user';

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'notification';
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageNotification {
  id: string;
  userId: string;
  messageId: string;
  type: 'new_message' | 'message_read';
  read: boolean;
  createdAt: string;
}