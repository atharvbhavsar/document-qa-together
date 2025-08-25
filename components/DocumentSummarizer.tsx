import React, { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface SummarizerButtonProps {
  fileId: string;
  fileName: string;
  mimeType: string;
  driveTokens: any;
}

export const DocumentSummarizer: React.FC<SummarizerButtonProps> = ({
  fileId,
  fileName,
  mimeType,
  driveTokens
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!fileId || !driveTokens) return;
    
    setIsSummarizing(true);
    setError(null);
    
    try {
      // Call the API route to summarize the document
      const response = await fetch('/api/drive/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          tokens: driveTokens,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize document');
      }
      
      setSummary(data.summary);
    } catch (err: any) {
      console.error('Error summarizing document:', err);
      setError(err.message || 'Failed to summarize document');
    } finally {
      setIsSummarizing(false);
    }
  };
  
  // Check if file type is supported for summarization
  const isSummarizable = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.presentation',
    'application/vnd.google-apps.spreadsheet',
    'application/pdf',
    'text/plain'
  ].includes(mimeType);

  if (!isSummarizable) {
    return null;
  }

  return (
    <div className="mt-2">
      {!summary ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-2"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            <>Summarize Document</>
          )}
        </Button>
      ) : (
        <div className="mt-2 p-4 bg-secondary/30 rounded-md">
          <h4 className="font-semibold mb-2">Summary</h4>
          <div className="text-sm whitespace-pre-wrap">{summary}</div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => setSummary(null)}
            className="mt-2 p-0 h-auto"
          >
            Hide Summary
          </Button>
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 text-sm text-destructive bg-destructive/10 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentSummarizer;
