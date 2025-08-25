'use client';

import { useEffect, useState } from 'react';

export default function PineconeTestPage() {
  const [config, setConfig] = useState({ apiKey: 'Loading...', indexName: 'Loading...' });
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [queryStatus, setQueryStatus] = useState(null);
  
  // Fetch configuration on load
  useEffect(() => {
    fetchConfig();
  }, []);
  
  async function fetchConfig() {
    try {
      const response = await fetch('/api/test/config');
      const data = await response.json();
      setConfig({
        apiKey: data.apiKey || 'Not configured',
        indexName: data.indexName || 'Not configured'
      });
    } catch (error) {
      setConfig({
        apiKey: 'Error fetching',
        indexName: 'Error fetching'
      });
    }
  }
  
  async function testConnection() {
    setConnectionStatus({ status: 'loading', message: 'Testing connection...' });
    try {
      const response = await fetch('/api/test/connection');
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus({
          status: 'success',
          message: `Connection successful! Found ${data.indexes?.length || 0} indexes.`,
          details: data.indexes
        });
      } else {
        setConnectionStatus({
          status: 'error',
          message: data.error || 'Connection failed',
          details: data.details
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: error.message || 'Test failed',
      });
    }
  }
  
  async function testUpload() {
    setUploadStatus({ status: 'loading', message: 'Testing vector upload...' });
    try {
      const response = await fetch('/api/test/upload');
      const data = await response.json();
      
      if (data.success) {
        setUploadStatus({
          status: 'success',
          message: `Upload successful! Vector ID: ${data.id}`,
          details: `Dimension: ${data.dimension}`
        });
      } else {
        setUploadStatus({
          status: 'error',
          message: data.error || 'Upload failed',
          details: data.details
        });
      }
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: error.message || 'Test failed',
      });
    }
  }
  
  async function testQuery() {
    setQueryStatus({ status: 'loading', message: 'Testing vector query...' });
    try {
      const response = await fetch('/api/test/query');
      const data = await response.json();
      
      if (data.success) {
        setQueryStatus({
          status: 'success',
          message: `Query successful! Found ${data.matches?.length || 0} matches.`,
          details: data.matches
        });
      } else {
        setQueryStatus({
          status: 'error',
          message: data.error || 'Query failed',
          details: data.details
        });
      }
    } catch (error) {
      setQueryStatus({
        status: 'error',
        message: error.message || 'Test failed',
      });
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Pinecone Connection Test</h1>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">API Key:</p>
            <p>{config.apiKey}</p>
          </div>
          <div>
            <p className="font-medium">Index Name:</p>
            <p>{config.indexName}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
        <button 
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Test Connection
        </button>
        
        {connectionStatus && (
          <div className="mt-4">
            <p className={`${connectionStatus.status === 'success' ? 'text-green-600' : connectionStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
              {connectionStatus.message}
            </p>
            {connectionStatus.details && (
              <pre className="bg-gray-100 p-2 mt-2 rounded overflow-x-auto text-sm">
                {JSON.stringify(connectionStatus.details, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Vector Upload</h2>
        <button 
          onClick={testUpload}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Test Upload
        </button>
        
        {uploadStatus && (
          <div className="mt-4">
            <p className={`${uploadStatus.status === 'success' ? 'text-green-600' : uploadStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
              {uploadStatus.message}
            </p>
            {uploadStatus.details && (
              <pre className="bg-gray-100 p-2 mt-2 rounded overflow-x-auto text-sm">
                {typeof uploadStatus.details === 'object' 
                  ? JSON.stringify(uploadStatus.details, null, 2)
                  : uploadStatus.details}
              </pre>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Vector Query</h2>
        <button 
          onClick={testQuery}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Test Query
        </button>
        
        {queryStatus && (
          <div className="mt-4">
            <p className={`${queryStatus.status === 'success' ? 'text-green-600' : queryStatus.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
              {queryStatus.message}
            </p>
            {queryStatus.details && (
              <pre className="bg-gray-100 p-2 mt-2 rounded overflow-x-auto text-sm">
                {typeof queryStatus.details === 'object' 
                  ? JSON.stringify(queryStatus.details, null, 2)
                  : queryStatus.details}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
