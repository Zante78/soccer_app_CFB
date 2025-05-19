import React from 'react';
import { Message } from '../../types/core/message';
import { Check, CheckCheck } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => {
        const isSender = message.senderId === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isSender 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                isSender ? 'text-blue-200' : 'text-gray-500'
              }`}>
                <span>{formatTime(message.createdAt)}</span>
                {isSender && (
                  message.status === 'read' 
                    ? <CheckCheck className="w-4 h-4" />
                    : <Check className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}