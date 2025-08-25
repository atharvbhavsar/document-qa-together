'use client';

import React, { useState } from 'react';
import { Button } from '../../components/ui/button/Button';
import FileUpload from '../../components/FileUpload';
import InfoAlert from '../../components/InfoAlert';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleUploadComplete = (success: boolean, error: string = '', name: string = '') => {
    setUploading(false);
    setUploadSuccess(success);
    setUploadError(error);
    setFileName(name);
  };

  const handleNewUpload = () => {
    setUploadSuccess(false);
    setUploadError('');
    setFileName('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload Documents</h1>
      
      {uploadSuccess ? (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <InfoAlert 
            type="success"
            title="Upload Successful!"
            message={`Your document "${fileName}" has been uploaded and is being processed. You can now use it for Q&A.`}
          />
          <div className="mt-6 text-center">
            <Button
              onClick={handleNewUpload}
              variant="default"
              className="mt-4"
            >
              Upload Another Document
            </Button>
          </div>
        </div>
      ) : uploadError ? (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <InfoAlert 
            type="error"
            title="Upload Failed"
            message={uploadError}
          />
          <div className="mt-6 text-center">
            <Button
              onClick={handleNewUpload}
              variant="default"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
          {uploading ? (
            <div className="text-center py-10">
              <LoadingIndicator 
                isVisible={true} 
                message="Uploading your document..." 
                showRetryInfo={true} 
              />
              <p className="mt-4 text-gray-600">Uploading your document...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute depending on the file size.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Upload a Document</h2>
                <p className="text-gray-600">
                  Upload a PDF, DOCX, or TXT file to add to your knowledge base for Q&A.
                </p>
              </div>
              
              <FileUpload 
                onUploadSuccess={(filename) => {
                  setUploading(false);
                  setUploadSuccess(true);
                  setFileName(filename);
                }}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">SUPPORTED FILE TYPES</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>PDF documents (.pdf)</li>
                  <li>Word documents (.docx)</li>
                  <li>Text files (.txt)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
