import React, { useEffect, useRef } from 'react';
import { Message, Conversation } from '../../types/core/message';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ArrowLeft, User } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSend: (content: string) => void;
  loading?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onBack,
  onSend,
  loading
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {conversation.participants.join(', ')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
        />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSend={onSend}
        disabled={loading}
      />
    </div>
  );
}