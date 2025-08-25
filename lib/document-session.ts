// lib/document-session.ts
// Utility for managing document uploads in the current session

import { getOrCreateSessionId } from './session-utils';

// Type for uploaded document metadata
export interface UploadedDocument {
  fileName: string;
  uploadTime: Date;
  sessionId: string;
}

const STORAGE_KEY = 'documentQA_uploadedDocs';

/**
 * Get all documents uploaded in the current session
 */
export function getCurrentSessionDocuments(): UploadedDocument[] {
  if (typeof window === 'undefined') return [];
  
  const currentSessionId = getOrCreateSessionId();
  const storedDocs = localStorage.getItem(STORAGE_KEY);
  
  if (!storedDocs) return [];
  
  try {
    const allDocs: UploadedDocument[] = JSON.parse(storedDocs);
    // Filter to only include documents from the current session
    return allDocs.filter(doc => doc.sessionId === currentSessionId);
  } catch (e) {
    console.error('Failed to parse stored documents:', e);
    return [];
  }
}

/**
 * Record a new document upload for the current session
 */
export function recordDocumentUpload(fileName: string): void {
  if (typeof window === 'undefined') return;
  
  const currentSessionId = getOrCreateSessionId();
  const storedDocs = localStorage.getItem(STORAGE_KEY);
  
  let allDocs: UploadedDocument[] = [];
  
  if (storedDocs) {
    try {
      allDocs = JSON.parse(storedDocs);
    } catch (e) {
      console.error('Failed to parse stored documents:', e);
    }
  }
  
  // Add the new document
  allDocs.push({
    fileName,
    uploadTime: new Date(),
    sessionId: currentSessionId
  });
  
  // Save back to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
}

/**
 * Clear all recorded document uploads for the current session
 */
export function clearSessionDocuments(): void {
  if (typeof window === 'undefined') return;
  
  const currentSessionId = getOrCreateSessionId();
  const storedDocs = localStorage.getItem(STORAGE_KEY);
  
  if (!storedDocs) return;
  
  try {
    const allDocs: UploadedDocument[] = JSON.parse(storedDocs);
    // Keep documents from other sessions
    const otherSessionDocs = allDocs.filter(doc => doc.sessionId !== currentSessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(otherSessionDocs));
  } catch (e) {
    console.error('Failed to parse stored documents:', e);
  }
}

/**
 * Get file names of documents uploaded in the current session
 */
export function getCurrentSessionDocumentNames(): string[] {
  return getCurrentSessionDocuments().map(doc => doc.fileName);
}
