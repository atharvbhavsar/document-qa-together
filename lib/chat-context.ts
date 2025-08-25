// lib/chat-context.ts
// Utility for managing chat history and context

import { getOrCreateSessionId } from './session-utils';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sessionId?: string;
}

export interface ChatHistoryContext {
  messages: ChatMessage[];
  sessionId: string;
  addMessage(role: 'user' | 'assistant', content: string): void;
  getRecentMessages(count?: number): ChatMessage[];
  getChatHistoryPrompt(): string;
  clearHistory(): void;
  loadSavedHistory(): void;
  startNewSession(): void;
}

const MAX_CONTEXT_MESSAGES = 10; // Maximum number of messages to keep in context
const STORAGE_KEY = 'documentQA_chatHistory';

/**
 * Creates a new chat context manager
 */
export function createChatContext(): ChatHistoryContext {
  let messages: ChatMessage[] = [];
  let sessionId = getOrCreateSessionId();
  
  // Function to save messages to localStorage
  const saveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  };
  
  return {
    messages,
    sessionId,
    
    addMessage(role: 'user' | 'assistant', content: string) {
      messages.push({ 
        role, 
        content,
        sessionId: this.sessionId // Store the session ID with each message
      });
      
      // Keep context manageable by limiting the number of messages
      if (messages.length > MAX_CONTEXT_MESSAGES) {
        // Remove oldest messages but always keep the most recent
        const excess = messages.length - MAX_CONTEXT_MESSAGES;
        messages.splice(0, excess);
      }
      
      // Save updated messages to localStorage
      saveToLocalStorage();
    },
    
    getRecentMessages(count = MAX_CONTEXT_MESSAGES) {
      // Filter messages by current session and return most recent ones
      return messages
        .filter(msg => !msg.sessionId || msg.sessionId === this.sessionId)
        .slice(-count);
    },
    
    getChatHistoryPrompt() {
      // Create a formatted history string for prompts
      const currentSessionMessages = this.getRecentMessages();
      if (currentSessionMessages.length === 0) return '';
      
      return currentSessionMessages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
    },
    
    clearHistory() {
      messages = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    
    loadSavedHistory() {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              messages = parsed;
            }
          } catch (e) {
            console.error('Failed to parse saved chat history:', e);
          }
        }
      }
    },
    
    startNewSession() {
      // Generate a new session ID
      if (typeof window !== 'undefined') {
        sessionId = getOrCreateSessionId();
      }
      
      // Don't clear messages, but mark that we're in a new session
      // This allows the UI to filter out old messages if needed
      console.log('Started new chat session:', sessionId);
    }
  };
}
