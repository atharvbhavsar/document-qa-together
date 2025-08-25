'use client';

import React, { useState } from 'react';

export default function OllamaTest() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function testEmbeddings() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/test/ollama-embedding');
      const data = await response.json();

      if (response.ok) {
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        setError(data.error || 'Failed to test Ollama embedding');
      }
    } catch (err: any) {
      setError('Error testing Ollama embedding: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  async function testGeneration() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/test/ollama-generation');
      const data = await response.json();

      if (response.ok) {
        setTestResult(JSON.stringify(data, null, 2));
      } else {
        setError(data.error || 'Failed to test Ollama generation');
      }
    } catch (err: any) {
      setError('Error testing Ollama generation: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ollama Integration Test</h1>
      
      <div className="flex gap-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={testEmbeddings}
          disabled={loading}
        >
          Test Embeddings
        </button>
        
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={testGeneration}
          disabled={loading}
        >
          Test Generation
        </button>
      </div>
      
      {loading && <p className="text-gray-500">Loading...</p>}
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>}
      
      {testResult && <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {testResult}
      </pre>}
    </div>
  );
}
