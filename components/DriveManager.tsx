import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { FilePdf, FileText, FileSpreadsheet, FilePresentation, Loader2, Import, RefreshCw } from 'lucide-react';
import DocumentSummarizer from './DocumentSummarizer';

interface DriveManagerProps {
  driveTokens: any;
}

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  size?: string;
};

export const DriveManager: React.FC<DriveManagerProps> = ({ driveTokens }) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Google Drive files
  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/files', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch files');
      }
      
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(err.message || 'Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  };

  // Import selected files into the RAG system
  const handleImport = async (fileIds: string[]) => {
    if (fileIds.length === 0) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileIds,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import files');
      }
      
      setImportResults(data);
    } catch (err: any) {
      console.error('Error importing files:', err);
      setError(err.message || 'Failed to import files');
    } finally {
      setIsImporting(false);
    }
  };

  // Auto-index all supported files
  const handleAutoIndex = async () => {
    setIsImporting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/drive/auto-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to auto-index files');
      }
      
      setImportResults(data);
    } catch (err: any) {
      console.error('Error auto-indexing files:', err);
      setError(err.message || 'Failed to auto-index files');
    } finally {
      setIsImporting(false);
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return <FilePdf className="h-5 w-5 text-red-500" />;
    } else if (mimeType === 'application/vnd.google-apps.document') {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (mimeType === 'application/vnd.google-apps.presentation') {
      return <FilePresentation className="h-5 w-5 text-yellow-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Load files on mount
  useEffect(() => {
    if (driveTokens) {
      fetchFiles();
    }
  }, [driveTokens]);

  if (!driveTokens) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Google Drive connection not available. Please authenticate first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Google Drive Files</span>
          <Button variant="outline" size="sm" onClick={fetchFiles} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          View and import your Google Drive files for AI processing
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {files.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No files found in your Google Drive.
              </p>
            ) : (
              <div className="space-y-4">
                {files.map((file) => (
                  <div 
                    key={file.id} 
                    className="p-4 border rounded-md flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.mimeType)}
                        <div>
                          <h4 className="font-medium line-clamp-1">{file.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{file.mimeType.split('/').pop()}</span>
                            {file.size && <span>• {formatFileSize(parseInt(file.size))}</span>}
                            <span>• {new Date(file.modifiedTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => window.open(file.webViewLink, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8"
                          onClick={() => handleImport([file.id])}
                          disabled={isImporting}
                        >
                          <Import className="h-4 w-4 mr-1" />
                          Import
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document Summarizer Component */}
                    <DocumentSummarizer 
                      fileId={file.id} 
                      fileName={file.name} 
                      mimeType={file.mimeType}
                      driveTokens={driveTokens}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {importResults && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
            <p className="font-medium">Import completed successfully!</p>
            <p>Processed {importResults.processedDocuments} documents.</p>
            {importResults.ocrProcessed > 0 && (
              <p>{importResults.ocrProcessed} documents were processed with OCR.</p>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={fetchFiles}
          disabled={isLoading}
        >
          Refresh File List
        </Button>
        <Button
          variant="default"
          onClick={handleAutoIndex}
          disabled={isImporting || isLoading}
          className="flex items-center gap-2"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Import className="h-4 w-4" />
          )}
          Auto-Index All Files
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DriveManager;
