'use client';

import { useState, useEffect } from 'react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink: string;
}

interface DriveFileBrowserProps {
  tokens: any;
  onFilesSelected: (fileIds: string[]) => void;
  selectedFiles: string[];
}

export default function DriveFileBrowser({ tokens, onFilesSelected, selectedFiles }: DriveFileBrowserProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/drive/files?maxResults=50');
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.error || 'Failed to load Google Drive files');
        console.error('Failed to load files:', data.error);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load Google Drive files');
    } finally {
      setLoading(false);
    }
  };

  const searchFiles = async () => {
    if (!searchQuery.trim()) {
      loadFiles();
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const params = new URLSearchParams({
        query: searchQuery,
        maxResults: '50'
      });
      
      const response = await fetch(`/api/drive/files?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.error || 'Failed to search Google Drive files');
        console.error('Failed to search files:', data.error);
      }
    } catch (error) {
      console.error('Error searching files:', error);
      setError('Failed to search Google Drive files');
    } finally {
      setSearching(false);
    }
  };

  const handleFileToggle = (fileId: string) => {
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter(id => id !== fileId)
      : [...selectedFiles, fileId];
    
    onFilesSelected(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length && files.length > 0) {
      // If all files are selected, deselect all
      onFilesSelected([]);
    } else {
      // Otherwise, select all files
      onFilesSelected(files.map(file => file.id));
    }
  };

  const isAllSelected = files.length > 0 && selectedFiles.length === files.length;
  const isSomeSelected = selectedFiles.length > 0 && selectedFiles.length < files.length;

  const formatFileSize = (size?: string) => {
    if (!size) return 'Unknown size';
    const bytes = parseInt(size);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('document')) return '📄';
    if (mimeType.includes('presentation')) return '📊';
    if (mimeType.includes('spreadsheet')) return '📈';
    if (mimeType.includes('pdf')) return '📕';
    if (mimeType.includes('text')) return '📝';
    return '📄';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading Google Drive files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={loadFiles}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Search and Select All */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex space-x-2 flex-1">
          <input
            type="text"
            placeholder="Search your Google Drive..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchFiles()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mobile-input"
          />
          <button
            onClick={searchFiles}
            disabled={searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px] touch-manipulation"
          >
            {searching ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); loadFiles(); }}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 min-h-[44px] touch-manipulation"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Select All Button */}
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors min-h-[44px] touch-manipulation text-sm sm:text-base ${
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
                {isAllSelected ? 'Deselect All' : isSomeSelected ? `Select All (${selectedFiles.length}/${files.length})` : 'Select All'}
              </span>
              <span className="sm:hidden">
                {isAllSelected ? 'None' : isSomeSelected ? `${selectedFiles.length}/${files.length}` : 'All'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'No files found matching your search.' : 'No files found in your Google Drive.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedFiles.includes(file.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleFileToggle(file.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileToggle(file.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-xl">{getFileIcon(file.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • Modified {formatDate(file.modifiedTime)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 text-xs touch-manipulation min-h-[44px] flex items-center px-2"
                    title="Open in Google Drive"
                  >
                    <span className="hidden sm:inline">Open ↗</span>
                    <span className="sm:hidden">↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Info */}
      {selectedFiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-2 sm:mx-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{selectedFiles.length}</span> of <span className="font-medium">{files.length}</span> file{selectedFiles.length !== 1 ? 's' : ''} selected for processing
            </p>
            {selectedFiles.length > 0 && (
              <button
                onClick={() => onFilesSelected([])}
                className="text-blue-600 hover:text-blue-800 text-xs underline touch-manipulation"
                title="Clear selection"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
