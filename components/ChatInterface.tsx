'use client';

import { useState, useRef, useEffect } from 'react';
import LoadingIndicator from './LoadingIndicator';
import InfoAlert from './InfoAlert';
import Notification from './Notification';
import ChatSidebar from './ChatSidebar';
import ExportButtonAdvanced from './ExportButtonAdvanced';
import { ChatConversation, getChatHistoryManager } from '@/lib/chat-history-manager';
import { formatMessageTime } from '@/lib/date-utils';
import { ExportMessage } from '@/lib/export-utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  sources?: string[];
  citations?: Array<{
    filename: string;
    pageNumber?: number;
    snippet: string;
    chunkIndex: number;
  }>;
  timestamp: Date;
}

interface ChatInterfaceProps {
  uploadedFiles: string[];
}

export default function ChatInterface({ uploadedFiles }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showRateLimitInfo, setShowRateLimitInfo] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'info' | 'warning' | 'error'} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSummaryOptions, setShowSummaryOptions] = useState(false);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [availableDocuments, setAvailableDocuments] = useState<Array<{ filename: string; totalChunks: number }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyManager = getChatHistoryManager();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history on component mount
  useEffect(() => {
    loadCurrentConversation();
    fetchAvailableDocuments();
  }, []);

  const fetchAvailableDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setAvailableDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const loadCurrentConversation = () => {
    const currentConv = historyManager.getCurrentConversation();
    if (currentConv) {
      setCurrentConversationId(currentConv.id);
      // Convert conversation messages to display format
      const displayMessages: Message[] = currentConv.messages.map(msg => ({
        id: Math.random().toString(36).substring(2, 9),
        text: msg.content,
        isUser: msg.role === 'user',
        timestamp: msg.timestamp,
        sources: msg.sources
      }));
      setMessages(displayMessages);
      
      if (displayMessages.length > 0) {
        setNotification({
          message: 'Previous conversation loaded',
          type: 'success'
        });
      }
    } else {
      // Create new conversation if none exists
      const newConv = historyManager.createNewConversation();
      setCurrentConversationId(newConv.id);
    }
  };

  const handleDocumentSelection = (filename: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(filename)) {
        return prev.filter(doc => doc !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(availableDocuments.map(doc => doc.filename));
  };

  const clearDocumentSelection = () => {
    setSelectedDocuments([]);
  };

  const showDocumentSelection = () => {
    setShowSummaryOptions(false);
    setShowDocumentSelector(true);
    fetchAvailableDocuments(); // Refresh document list
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for tracking loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setLoadingTime(0);
      interval = setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
      setRetryCount(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setShowRateLimitInfo(false);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    // Add user message to chat and history
    setMessages(prev => [...prev, userMessage]);
    historyManager.addMessageToCurrentConversation('user', messageText);

    setIsLoading(true);

    try {
      // Get recent messages for context
      const currentConv = historyManager.getCurrentConversation();
      const chatHistory = currentConv ? currentConv.messages.slice(-5) : []; // Last 5 messages for context

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          chatHistory: chatHistory
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        let errorText = 'Sorry, I encountered an error processing your question.';
        
        if (response.status === 429) {
          errorText = 'The AI service is currently rate limited. Please wait a moment and try again.';
          setShowRateLimitInfo(true);
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.error || errorText,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const botResponse = result.response || 'Sorry, I encountered an error processing your question.';
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        sources: result.sources,
        citations: result.citations,
        timestamp: new Date(),
      };

      // Add assistant message to chat and history
      setMessages(prev => [...prev, botMessage]);
      historyManager.addMessageToCurrentConversation('assistant', botResponse, result.sources);
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeDocuments = async (summaryType: 'all' | 'recent' | 'specific' | 'selected') => {
    if (isLoading) return;
    
    setIsLoading(true);
    setShowSummaryOptions(false);
    setShowDocumentSelector(false);
    
    try {
      let summaryRequest = '';
      
      if (summaryType === 'all') {
        summaryRequest = 'Please provide a comprehensive summary of all the uploaded documents, highlighting the key information, main points, and important details from each document.';
      } else if (summaryType === 'recent') {
        summaryRequest = 'Please provide a summary of the most recently uploaded documents, focusing on the main points and key information.';
      } else if (summaryType === 'selected') {
        const selectedDocs = selectedDocuments.join(', ');
        summaryRequest = `Please provide a comprehensive summary of these specific documents: ${selectedDocs}. Focus on the key information, main points, and important details from each document.`;
      } else {
        summaryRequest = 'Please provide a detailed summary of the uploaded documents, organizing the information by document type and highlighting the most important details.';
      }

      // Add user message for summary request
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `📋 ${summaryType === 'all' ? 'Summarize all documents' : 
                   summaryType === 'recent' ? 'Summarize recent documents' : 
                   summaryType === 'selected' ? `Summarize selected documents (${selectedDocuments.length})` :
                   'Summarize documents'}`,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      historyManager.addMessageToCurrentConversation('user', userMessage.text);

      // Get recent messages for context
      const currentConv = historyManager.getCurrentConversation();
      const chatHistory = currentConv ? currentConv.messages.slice(-5) : []; // Last 5 messages for context

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: summaryRequest,
          chatHistory: chatHistory,
          isSummary: true,
          selectedDocuments: summaryType === 'selected' ? selectedDocuments : undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorText = 'Sorry, I encountered an error creating the summary.';
        
        if (response.status === 429) {
          errorText = 'The AI service is currently rate limited. Please wait a moment and try again.';
          setShowRateLimitInfo(true);
        }
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.error || errorText,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const botResponse = result.response || 'Sorry, I encountered an error creating the summary.';
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
        sources: result.sources,
        citations: result.citations,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      historyManager.addMessageToCurrentConversation('assistant', botResponse, result.sources);
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error creating the summary. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChatHistory = () => {
    const newConv = historyManager.createNewConversation();
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setNotification({
      message: 'Started new conversation',
      type: 'info'
    });
  };

  const handleSelectConversation = (conversationId: string) => {
    if (historyManager.setCurrentConversation(conversationId)) {
      setCurrentConversationId(conversationId);
      const conversation = historyManager.getConversation(conversationId);
      
      if (conversation) {
        // Convert conversation messages to display format
        const displayMessages: Message[] = conversation.messages.map(msg => ({
          id: Math.random().toString(36).substring(2, 9),
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp,
          sources: msg.sources
        }));
        setMessages(displayMessages);
        
        setNotification({
          message: `Loaded conversation: ${conversation.title}`,
          type: 'success'
        });
      }
    }
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      />
      
      {/* Main Chat Interface */}
      <div className={`flex flex-col h-full transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800 p-1 sm:p-1"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800">
              <span className="hidden sm:inline">Document Q&A Chat</span>
              <span className="sm:hidden">Q&A Chat</span>
            </h1>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={clearChatHistory}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              <span className="hidden sm:inline">New Chat</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>

        <div className="flex flex-col h-full">
      {/* Rate Limit Info Alert */}
      {showRateLimitInfo && (
        <div className="px-3 sm:px-4 pt-3 sm:pt-4">
          <InfoAlert
            title="API Rate Limit Reached"
            message="The Google Gemini AI API has a limit on how many requests can be made per minute in the free tier. Please wait a moment before trying again. The application will automatically retry your request with exponential backoff."
            type="warning"
            onDismiss={() => setShowRateLimitInfo(false)}
          />
        </div>
      )}
      
      {/* Notification component */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          duration={3000} 
        />
      )}
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header with conversation controls */}
        {messages.length > 0 && (
          <div className="flex justify-between items-center mb-2">
            <ExportButtonAdvanced 
              messages={messages.map(msg => ({
                id: msg.id,
                text: msg.text,
                isUser: msg.isUser,
                timestamp: msg.timestamp,
                sources: msg.sources
              }))}
              className="text-xs sm:text-sm"
            />
            <button
              onClick={clearChatHistory}
              className="text-xs text-gray-500 flex items-center hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear History</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-6 sm:mt-8">
            <div className="text-3xl sm:text-4xl mb-4">🤖</div>
            <p className="text-sm sm:text-base">Ask me anything about your uploaded documents!</p>
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-xs sm:text-sm">Uploaded files:</p>
                <ul className="text-xs sm:text-sm text-blue-600">
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>📄 {file}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-2 items-center mt-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full"></span>
                <span className="hidden sm:inline">Conversation Memory Enabled</span>
                <span className="sm:hidden">Memory Enabled</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // Check if this message is from the same sender as the previous one for grouping
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const isSameSender = prevMessage && prevMessage.isUser === message.isUser;
            const showAvatar = !isSameSender;
            
            return (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-1' : 'mt-3 sm:mt-4'}`}
              >
                {!message.isUser && showAvatar && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-blue-600 text-xs sm:text-sm">🤖</span>
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 text-sm sm:text-base ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600">Sources:</p>
                      <ul className="text-xs">
                        {message.sources.map((source, index) => (
                          <li key={index}>📄 {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-600 font-semibold">Citations:</p>
                      <div className="space-y-1">
                        {message.citations.map((citation, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                            <div className="font-medium text-gray-800">
                              📖 {citation.filename}
                              {citation.pageNumber && (
                                <span className="text-blue-600"> (Page {citation.pageNumber})</span>
                              )}
                            </div>
                            <div className="text-gray-600 mt-1 italic">
                              "{citation.snippet}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
                
                {message.isUser && showAvatar && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ml-2 flex-shrink-0">
                    <span className="text-white text-sm">👤</span>
                  </div>
                )}
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex justify-start">
            <LoadingIndicator 
              isVisible={isLoading} 
              message={loadingTime > 3 ? "This might take a moment..." : "Processing your request..."}
              showRetryInfo={loadingTime > 5}
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        {/* Summary Options */}
        {showSummaryOptions && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Choose Summary Type:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => summarizeDocuments('all')}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                📄 All Documents
              </button>
              <button
                onClick={() => summarizeDocuments('recent')}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                🆕 Recent Documents
              </button>
              <button
                onClick={() => summarizeDocuments('specific')}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              >
                🎯 Detailed Summary
              </button>
              <button
                onClick={showDocumentSelection}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
              >
                📂 Select Documents
              </button>
              <button
                onClick={() => setShowSummaryOptions(false)}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Document Selector */}
        {showDocumentSelector && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800 mb-2">📂 Select Documents to Summarize:</h3>
            
            {availableDocuments.length === 0 ? (
              <p className="text-sm text-gray-600">No documents found. Please upload some documents first.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={selectAllDocuments}
                    className="flex items-center gap-1 px-3 py-2 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors min-h-[44px] touch-manipulation font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Select All</span>
                    <span className="sm:hidden">All</span>
                  </button>
                  <button
                    onClick={clearDocumentSelection}
                    className="flex items-center gap-1 px-3 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-h-[44px] touch-manipulation font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                  {selectedDocuments.length > 0 && (
                    <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs">
                      <span className="font-medium">{selectedDocuments.length}</span>
                      <span className="hidden sm:inline ml-1">selected</span>
                    </div>
                  )}
                </div>
                
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableDocuments.map((doc) => (
                    <label
                      key={doc.filename}
                      className="flex items-center space-x-2 p-2 hover:bg-orange-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.filename)}
                        onChange={() => handleDocumentSelection(doc.filename)}
                        className="rounded text-orange-600"
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {doc.filename}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({doc.totalChunks} chunks)
                      </span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => summarizeDocuments('selected')}
                    disabled={isLoading || selectedDocuments.length === 0}
                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
                  >
                    📋 Summarize Selected ({selectedDocuments.length})
                  </button>
                  <button
                    onClick={() => setShowDocumentSelector(false)}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-0 sm:gap-0">
          <div className="flex space-x-2 flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              className="flex-1 border-2 border-blue-300 rounded-lg p-2.5 sm:p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-700 text-sm sm:text-base min-h-[44px] sm:min-h-[48px] shadow-sm"
              rows={2}
              disabled={isLoading}
              style={{
                color: '#000000',
                backgroundColor: '#ffffff',
                fontSize: '16px', // Prevent zoom on iOS
                fontWeight: '500',
                lineHeight: '1.5'
              }}
            />
            <button
              onClick={() => setShowSummaryOptions(!showSummaryOptions)}
              disabled={isLoading || uploadedFiles.length === 0}
              className="bg-green-500 text-white px-2.5 sm:px-3 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-xs sm:text-sm"
              title="Summarize documents"
            >
              <span className="hidden sm:inline">📋</span>
              <span className="sm:hidden">📋</span>
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-500 text-white px-4 sm:px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2"
          >
            <span className="hidden sm:inline">Send</span>
            <span className="sm:hidden">Send Message</span>
          </button>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}
