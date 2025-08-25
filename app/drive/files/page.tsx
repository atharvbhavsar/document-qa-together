'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingIndicator from '@/components/LoadingIndicator';
import WorkflowGuide from '@/components/WorkflowGuide';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  parents?: string[];
}

export default function DriveFilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);

  // Load files from Google Drive
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async (query: string = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('query', query);
      searchParams.append('maxResults', '50');
      
      const response = await fetch(`/api/drive/files?${searchParams.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Google Drive authentication required. Please reconnect.');
          return;
        }
        throw new Error('Failed to load files');
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load Google Drive files');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadFiles(searchQuery);
  };

  const handleFileSelect = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length && files.length > 0) {
      // If all files are selected, deselect all
      setSelectedFiles(new Set());
    } else {
      // Otherwise, select all files
      setSelectedFiles(new Set(files.map(file => file.id)));
    }
  };

  const isAllSelected = files.length > 0 && selectedFiles.size === files.length;
  const isSomeSelected = selectedFiles.size > 0 && selectedFiles.size < files.length;

  const processSelectedFiles = async () => {
    if (selectedFiles.size === 0) {
      alert('Please select at least one file to process.');
      return;
    }

    setProcessing(true);
    const successfulFiles = [];
    const failedFiles = [];
    
    try {
      // Process each selected file
      for (const fileId of Array.from(selectedFiles)) {
        const file = files.find(f => f.id === fileId);
        if (file) {
          try {
            // Call API to download and process the file
            const response = await fetch('/api/drive/process', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileId: file.id,
                fileName: file.name,
                mimeType: file.mimeType
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to process ${file.name}`);
            }
            
            const result = await response.json();
            successfulFiles.push(file.name);
            console.log(`Successfully processed: ${file.name}`, result);
          } catch (error: any) {
            console.error(`Error processing ${file.name}:`, error);
            failedFiles.push({ name: file.name, error: error?.message || 'Unknown error' });
          }
        }
      }

      // Show results to user
      if (successfulFiles.length > 0 && failedFiles.length === 0) {
        alert(`✅ Successfully processed all ${successfulFiles.length} files!\n\nFiles processed:\n${successfulFiles.join('\n')}\n\nYou can now ask questions about these documents.`);
        router.push('/');
      } else if (successfulFiles.length > 0 && failedFiles.length > 0) {
        alert(`⚠️ Partially successful:\n\n✅ Successfully processed:\n${successfulFiles.join('\n')}\n\n❌ Failed to process:\n${failedFiles.map(f => f.name).join('\n')}\n\nYou can ask questions about the successfully processed documents.`);
        router.push('/');
      } else {
        alert(`❌ Failed to process any files:\n\n${failedFiles.map(f => `${f.name}: ${f.error}`).join('\n')}\n\nPlease try again or check your internet connection.`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      alert('❌ An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: string | undefined) => {
    if (!bytes) return 'Unknown size';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📈';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📄';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingIndicator isVisible={true} />
          <p className="mt-4 text-gray-600">Loading your Google Drive files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Files</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            {error.includes('authentication') && (
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🔄 Reconnect Google Drive
              </button>
            )}
            <button
              onClick={() => loadFiles()}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              ← Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Google Drive Files</h1>
              <p className="text-gray-600 mt-2">Select documents to ask questions about</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Workflow Guide */}
        <WorkflowGuide currentStep={selectedFiles.size > 0 ? 'process' : 'select'} />

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                style={{
                  color: '#1f2937',
                  backgroundColor: '#ffffff',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
            
            {/* Select All Button */}
            {files.length > 0 && (
              <div className="flex items-center">
                <button
                  onClick={handleSelectAll}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors min-h-[48px] touch-manipulation text-sm font-medium ${
                    isAllSelected
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : isSomeSelected
                      ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                  title={isAllSelected ? 'Deselect all files' : 'Select all files'}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                  />
                  <span className="hidden sm:inline">
                    {isAllSelected ? 'Deselect All' : isSomeSelected ? `Select All (${selectedFiles.size}/${files.length})` : 'Select All'}
                  </span>
                  <span className="sm:hidden">
                    {isAllSelected ? 'None' : isSomeSelected ? `${selectedFiles.size}/${files.length}` : 'All'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selection Actions */}
        {selectedFiles.size > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-800 font-medium">
                  {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFiles(new Set())}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Clear Selection
                </button>
                <button
                  onClick={processSelectedFiles}
                  disabled={processing}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Process Selected Files'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Files List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {files.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try a different search term.' : 'Your Google Drive appears to be empty.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedFiles.has(file.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleFileSelect(file.id)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span>{formatFileSize(file.size)}</span>
                            <span className="mx-2">•</span>
                            <span>Modified {formatDate(file.modifiedTime)}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{file.mimeType.split('/')[1]?.replace('vnd.google-apps.', '') || 'File'}</span>
                          </div>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-blue-600 hover:text-blue-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">How to use:</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select the documents you want to ask questions about</li>
                  <li>Click "Process Selected Files" to add them to your knowledge base</li>
                  <li>Return to the home page to start asking questions about your documents</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
