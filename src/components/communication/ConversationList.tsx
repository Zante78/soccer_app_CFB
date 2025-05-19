import React from 'react';
import { Conversation } from '../../types/core/message';
import { User, Circle } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({ 
  conversations, 
  selectedId,
  onSelect 
}: ConversationListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 ${
            selectedId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1">
                <Circle className="w-4 h-4 fill-blue-600 text-blue-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-medium text-gray-900 truncate">
                {conversation.participants.join(', ')}
              </p>
              {conversation.lastMessage && (
                <p className="text-xs text-gray-500">
                  {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
            {conversation.lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage.content}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}