'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button/Button';
import FileUpload from '../components/FileUpload';
import LoadingIndicator from '../components/LoadingIndicator';
import ChatInterface from '../components/ChatInterface';
import WorkflowGuide from '../components/WorkflowGuide';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // Function to fetch Google Auth URL
  const fetchGoogleAuthUrl = async () => {
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      setGoogleAuthUrl(data.authUrl);
    } catch (error) {
      console.error('Error fetching Google auth URL:', error);
    }
  };

  // Check Google auth status
  const checkGoogleAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setIsGoogleAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Load Google auth URL and check auth status on component mount
  useEffect(() => {
    fetchGoogleAuthUrl();
    checkGoogleAuthStatus();
    
    // Check for authentication status in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
    
    if (authStatus === 'success') {
      setIsGoogleAuthenticated(true);
      setIsLoadingAuth(false);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'error') {
      setIsLoadingAuth(false);
      console.error('Google authentication failed:', error);
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle file upload success
  const handleUploadSuccess = (filename: string) => {
    setUploadSuccess(true);
    setUploadedFilename(filename);
    setUploadedFiles(prev => [...prev, filename]);
  };

  // Connect to Google Drive
  const handleGoogleDriveConnect = () => {
    setIsLoadingAuth(true);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-24">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white">
            <span className="block">Document Q&A Chatbot</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-lg sm:text-xl text-gray-500 dark:text-gray-300 px-4">
            Upload your documents and ask questions about their content
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 px-4">
            Supports PDFs (including scanned documents), DOCX, images, and text files
          </p>
        </div>

        {/* Workflow Guide */}
        <WorkflowGuide currentStep={isGoogleAuthenticated ? 'chat' : 'auth'} />

        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6">
          {/* Left Side - Upload Section */}
          <div className="xl:w-1/3 w-full">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`w-1/2 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'upload'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1 sm:mr-2">📁</span> 
                      <span className="hidden sm:inline">Upload Files</span>
                      <span className="sm:hidden">Upload</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('drive')}
                    className={`w-1/2 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'drive'
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center justify-center">
                      <span className="mr-1 sm:mr-2">🔄</span> 
                      <span className="hidden sm:inline">Google Drive</span>
                      <span className="sm:hidden">Drive</span>
                    </span>
                  </button>
                </nav>
              </div>
              <div className="p-4 sm:p-6">
                {activeTab === 'upload' ? (
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload Documents</h2>
                    <FileUpload 
                      onUploadSuccess={handleUploadSuccess}
                    />
                    {uploadSuccess && (
                      <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                        Successfully uploaded: {uploadedFilename}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-blue-800 dark:text-blue-300">
                      <span className="hidden sm:inline">Google Drive Integration</span>
                      <span className="sm:hidden">Google Drive</span>
                    </h2>
                    <div className="text-center py-4 sm:py-6">
                      {isGoogleAuthenticated ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4 shadow-sm">
                          <div className="flex items-center justify-center mb-3 sm:mb-4 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-base sm:text-lg text-green-700">✅ Connected to Google Drive</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 font-medium text-center">
                            You can now browse and select documents from your Google Drive
                          </p>
                          <Button
                            variant="outline"
                            className="inline-flex items-center mb-2 bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 w-full justify-center py-2 sm:py-3 text-sm sm:text-base font-medium"
                            onClick={() => {
                              window.location.href = '/drive/files';
                            }}
                          >
                            <span className="mr-2">📂</span>
                            <span className="hidden sm:inline">Browse My Google Drive Files</span>
                            <span className="sm:hidden">Browse Drive Files</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-5 shadow-sm">
                          <div className="mb-4 text-center">
                            <div className="text-4xl sm:text-5xl mb-3 text-center">🔒</div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                              Connect Your Google Drive
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 px-2">
                              Authenticate with Google to access your documents. We only access files you explicitly select.
                            </p>
                          </div>
                          <Button
                            variant="default"
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white w-full justify-center py-2 sm:py-3 text-sm sm:text-base font-medium"
                            onClick={handleGoogleDriveConnect}
                            disabled={isLoadingAuth}
                          >
                            {isLoadingAuth ? (
                              <>
                                <LoadingIndicator isVisible={true} />
                                <span className="ml-2 font-medium">Connecting...</span>
                              </>
                            ) : (
                              <>
                                <span className="mr-2">🔄</span>
                                <span className="hidden sm:inline">Connect Google Drive via OAuth2</span>
                                <span className="sm:hidden">Connect Google Drive</span>
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-3 sm:mt-4 text-center px-2">
                            🔐 Secure OAuth2 authentication • Read-only access • You control which files to process
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Section */}
          <div className="xl:w-2/3 w-full">
            <ChatInterface uploadedFiles={uploadedFiles} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10">
          <FeatureCard 
            title="Upload Documents" 
            description="Upload your documents in various formats (PDF, DOCX, PNG, JPG) for analysis and question answering."
            icon={
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            linkHref="#"
            linkText="Upload Now"
          />
          <FeatureCard 
            title="Ask Questions" 
            description="Ask natural language questions about your documents and get precise answers with source citations."
            icon={
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            linkHref="#"
            linkText="Start Chatting"
          />
          <FeatureCard 
            title="Document Summaries" 
            description="Generate comprehensive summaries of your documents to quickly understand key information."
            icon={
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            linkHref="#"
            linkText="Summarize Documents"
          />
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden mt-8 sm:mt-10">
          <div className="lg:flex">
            <div className="p-6 sm:p-8 lg:p-12 lg:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-indigo-100 mb-6 text-sm sm:text-base">
                Experience the power of AI-driven document analysis and question answering. Upload your documents and start chatting today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="default" size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 text-sm sm:text-base" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                  Get Started
                </Button>
                <Link href="https://github.com/yourusername/document-qa-chatbot" target="_blank">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto text-sm sm:text-base">
                    View Source
                  </Button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative hidden lg:block">
              <div className="absolute inset-0 bg-indigo-800 opacity-20"></div>
              <div className="h-full flex items-center justify-center p-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <div className="text-white/90 text-sm">AI Chat Interface</div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-indigo-700/50 rounded-lg p-3 text-white/90">
                      <p className="text-xs text-white/70">User</p>
                      <p className="text-sm">What is the main conclusion in the Q3 financial report?</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 text-white/90">
                      <p className="text-xs text-white/70">AI Assistant</p>
                      <p className="text-sm">Based on the Q3 financial report, the main conclusion is that revenue increased by 27% year-over-year, exceeding projections by 12%. This was primarily driven by the new product line launched in Q2.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  title, 
  description, 
  icon, 
  linkHref, 
  linkText 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  linkHref: string;
  linkText: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
      <div className="p-4 sm:p-6">
        <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">{description}</p>
        <Link href={linkHref}>
          <Button variant="secondary" size="sm" className="w-full text-sm">
            {linkText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
