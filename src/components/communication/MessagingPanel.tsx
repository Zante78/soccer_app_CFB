import React, { useState, useEffect } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader } from 'lucide-react';
import { supabase } from '../../services/database';

interface MessagingPanelProps {
  userId: string;
}

export function MessagingPanel({ userId }: MessagingPanelProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { 
    conversations,
    currentMessages,
    loading,
    error,
    loadMessages,
    sendMessage,
    markAsRead
  } = useMessages(currentUser);

  // Get current user session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };
    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (error?.includes('Failed to fetch')) {
    return <DatabaseConnectionError />;
  }

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    await loadMessages(conversationId);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !currentUser) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const recipientId = conversation.participants.find(p => p !== currentUser);
    if (!recipientId) return;

    await sendMessage({
      senderId: currentUser,
      recipientId,
      content,
      type: 'text'
    });
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-[32rem] bg-white rounded-lg shadow-lg overflow-hidden">
      {selectedConversation && selectedConversationData ? (
        <ChatWindow
          conversation={selectedConversationData}
          messages={currentMessages}
          currentUserId={currentUser}
          onBack={() => setSelectedConversation(null)}
          onSend={handleSendMessage}
          loading={loading}
        />
      ) : (
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation}
          onSelect={(conversation) => handleSelectConversation(conversation.id)}
        />
      )}
    </div>
  );
}