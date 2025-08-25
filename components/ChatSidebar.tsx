// components/ChatSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChatConversation, getChatHistoryManager } from '@/lib/chat-history-manager';
import { formatMessageTime } from '@/lib/date-utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export default function ChatSidebar({ 
  isOpen, 
  onToggle, 
  onSelectConversation, 
  currentConversationId 
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const historyManager = getChatHistoryManager();

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    setIsLoading(true);
    try {
      const allConversations = historyManager.getAllConversations();
      setConversations(allConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newConversation = historyManager.createNewConversation();
    onSelectConversation(newConversation.id);
    loadConversations(); // Refresh the list
  };

  const handleDeleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent conversation selection
    
    if (confirm('Are you sure you want to delete this conversation?')) {
      historyManager.deleteConversation(conversationId);
      loadConversations(); // Refresh the list
      
      // If we deleted the current conversation, create a new one
      if (conversationId === currentConversationId) {
        handleNewChat();
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 md:w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    relative group cursor-pointer rounded-lg p-3 transition-colors duration-200
                    ${conversation.id === currentConversationId 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'
                    }
                  `}
                >
                  <div className="pr-8"> {/* Leave space for delete button */}
                    <h3 className="font-medium truncate text-sm">
                      {conversation.title}
                    </h3>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDate(conversation.lastActivity)}
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                      {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>
    </>
  );
}
