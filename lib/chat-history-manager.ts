// lib/chat-history-manager.ts
// Advanced chat history management with multiple conversations

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface ChatConversation {
  id: string;
  title: string;
  startDate: Date;
  lastActivity: Date;
  messages: ChatMessage[];
}

export interface ChatHistoryManager {
  // Conversation management
  createNewConversation(): ChatConversation;
  saveConversation(conversation: ChatConversation): void;
  getAllConversations(): ChatConversation[];
  getConversation(id: string): ChatConversation | null;
  deleteConversation(id: string): void;
  
  // Current conversation
  getCurrentConversation(): ChatConversation | null;
  setCurrentConversation(id: string): boolean;
  addMessageToCurrentConversation(role: 'user' | 'assistant', content: string, sources?: string[]): void;
  
  // Utilities
  generateTitle(firstMessage: string): string;
  exportConversations(): string;
  importConversations(data: string): boolean;
}

const STORAGE_KEY = 'documentQA_chatConversations';
const CURRENT_CONVERSATION_KEY = 'documentQA_currentConversation';

/**
 * Creates a chat history manager instance
 */
export function createChatHistoryManager(): ChatHistoryManager {
  let conversations: ChatConversation[] = [];
  let currentConversationId: string | null = null;
  
  // Load data from localStorage on initialization
  loadFromStorage();
  
  function loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const savedConversations = localStorage.getItem(STORAGE_KEY);
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        conversations = parsed.map((conv: any) => ({
          ...conv,
          startDate: new Date(conv.startDate),
          lastActivity: new Date(conv.lastActivity),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
      
      const savedCurrentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
      if (savedCurrentId) {
        currentConversationId = savedCurrentId;
      }
    } catch (error) {
      console.error('Failed to load chat history from storage:', error);
      conversations = [];
      currentConversationId = null;
    }
  }
  
  function saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      if (currentConversationId) {
        localStorage.setItem(CURRENT_CONVERSATION_KEY, currentConversationId);
      } else {
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      }
    } catch (error) {
      console.error('Failed to save chat history to storage:', error);
    }
  }
  
  function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  return {
    createNewConversation(): ChatConversation {
      const now = new Date();
      const newConversation: ChatConversation = {
        id: generateId(),
        title: 'New Conversation',
        startDate: now,
        lastActivity: now,
        messages: []
      };
      
      conversations.unshift(newConversation); // Add at beginning for latest-first order
      currentConversationId = newConversation.id;
      saveToStorage();
      
      return newConversation;
    },
    
    saveConversation(conversation: ChatConversation): void {
      const index = conversations.findIndex(conv => conv.id === conversation.id);
      if (index !== -1) {
        conversations[index] = { ...conversation };
        // Move to top if it's been updated
        if (index !== 0) {
          const [updated] = conversations.splice(index, 1);
          conversations.unshift(updated);
        }
      } else {
        conversations.unshift(conversation);
      }
      saveToStorage();
    },
    
    getAllConversations(): ChatConversation[] {
      // Return a copy sorted by last activity (newest first)
      return [...conversations].sort((a, b) => 
        b.lastActivity.getTime() - a.lastActivity.getTime()
      );
    },
    
    getConversation(id: string): ChatConversation | null {
      return conversations.find(conv => conv.id === id) || null;
    },
    
    deleteConversation(id: string): void {
      const index = conversations.findIndex(conv => conv.id === id);
      if (index !== -1) {
        conversations.splice(index, 1);
        if (currentConversationId === id) {
          currentConversationId = conversations.length > 0 ? conversations[0].id : null;
        }
        saveToStorage();
      }
    },
    
    getCurrentConversation(): ChatConversation | null {
      if (!currentConversationId) return null;
      return this.getConversation(currentConversationId);
    },
    
    setCurrentConversation(id: string): boolean {
      const conversation = this.getConversation(id);
      if (conversation) {
        currentConversationId = id;
        saveToStorage();
        return true;
      }
      return false;
    },
    
    addMessageToCurrentConversation(role: 'user' | 'assistant', content: string, sources?: string[]): void {
      let currentConv = this.getCurrentConversation();
      
      // Create new conversation if none exists
      if (!currentConv) {
        currentConv = this.createNewConversation();
      }
      
      const message: ChatMessage = {
        role,
        content,
        timestamp: new Date(),
        sources
      };
      
      currentConv.messages.push(message);
      currentConv.lastActivity = new Date();
      
      // Auto-generate title from first user message
      if (role === 'user' && currentConv.messages.length === 1) {
        currentConv.title = this.generateTitle(content);
      }
      
      this.saveConversation(currentConv);
    },
    
    generateTitle(firstMessage: string): string {
      // Generate a short title from the first message
      const words = firstMessage.trim().split(' ');
      if (words.length <= 4) {
        return firstMessage;
      }
      
      // Take first 4 words and add ellipsis
      return words.slice(0, 4).join(' ') + '...';
    },
    
    exportConversations(): string {
      return JSON.stringify(conversations, null, 2);
    },
    
    importConversations(data: string): boolean {
      try {
        const imported = JSON.parse(data);
        if (Array.isArray(imported)) {
          conversations = imported.map((conv: any) => ({
            ...conv,
            startDate: new Date(conv.startDate),
            lastActivity: new Date(conv.lastActivity),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          saveToStorage();
          return true;
        }
      } catch (error) {
        console.error('Failed to import conversations:', error);
      }
      return false;
    }
  };
}

// Singleton instance
let chatHistoryManager: ChatHistoryManager | null = null;

export function getChatHistoryManager(): ChatHistoryManager {
  if (!chatHistoryManager) {
    chatHistoryManager = createChatHistoryManager();
  }
  return chatHistoryManager;
}
