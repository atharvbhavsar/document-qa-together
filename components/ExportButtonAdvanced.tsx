'use client';

import { useState } from 'react';
import { ChatExporter, ExportMessage, ExportOptions } from '@/lib/export-utils';

interface ExportButtonProps {
  messages: ExportMessage[];
  className?: string;
}

interface EmailModalState {
  to: string;
  subject: string;
  attachFormat: 'none' | 'pdf' | 'word' | 'both';
}

export default function ExportButtonAdvanced({ messages, className = '' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'word' | 'email'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeTimestamps: true,
    includeSources: true,
    title: 'Chat History Export'
  });
  const [emailState, setEmailState] = useState<EmailModalState>({
    to: '',
    subject: 'Chat History Export',
    attachFormat: 'pdf'
  });

  const handleExport = async (format: 'pdf' | 'word' | 'email') => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    setSelectedFormat(format);
    setShowDropdown(false);

    if (format === 'email') {
      setShowEmailModal(true);
    } else {
      setShowOptionsModal(true);
    }
  };

  const executeExport = async () => {
    setIsExporting(true);
    setShowOptionsModal(false);

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        ...exportOptions
      };

      switch (selectedFormat) {
        case 'pdf':
          const pdfBlob = await ChatExporter.exportToPDF(messages, options);
          const timestamp = new Date().toISOString().split('T')[0];
          ChatExporter.downloadFile(pdfBlob, `chat-history-${timestamp}.pdf`);
          break;

        case 'word':
          const wordBlob = await ChatExporter.exportToWord(messages, options);
          const wordTimestamp = new Date().toISOString().split('T')[0];
          ChatExporter.downloadFile(wordBlob, `chat-history-${wordTimestamp}.docx`);
          break;

        case 'email':
          const emailContent = ChatExporter.generateEmailContent(messages, options);
          const copied = await ChatExporter.copyToClipboard(emailContent);
          if (copied) {
            alert('Chat history copied to clipboard! You can now paste it into your email client.');
          } else {
            // Fallback: open mailto link
            const subject = encodeURIComponent(exportOptions.title);
            const body = encodeURIComponent(emailContent);
            window.open(`mailto:?subject=${subject}&body=${body}`);
          }
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const executeEmailExport = async () => {
    if (!emailState.to.trim()) {
      alert('Please enter a recipient email address');
      return;
    }

    setIsExporting(true);
    setShowEmailModal(false);

    try {
      const response = await fetch('/api/export/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailState.to,
          subject: emailState.subject,
          messages: messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp.toISOString()
          })),
          options: exportOptions,
          attachFormat: emailState.attachFormat === 'none' ? undefined : emailState.attachFormat
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Email sent successfully! ${result.attachmentCount > 0 ? `Included ${result.attachmentCount} attachment(s).` : ''}`);
      } else {
        throw new Error(result.error || 'Email sending failed');
      }
    } catch (error) {
      console.error('Email export failed:', error);
      
      // Fallback to client-side email
      const emailContent = ChatExporter.generateEmailContent(messages, {
        format: 'email',
        ...exportOptions
      });
      const subject = encodeURIComponent(emailState.subject);
      const body = encodeURIComponent(emailContent);
      window.open(`mailto:${emailState.to}?subject=${subject}&body=${body}`);
      
      alert('Server email failed. Opening your default email client instead.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || messages.length === 0}
        className={`flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md font-medium ${className}`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="text-base">Exporting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-base">Export Chat</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[240px]">
          <div className="py-2">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 border-b border-gray-200"
            >
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span className="font-medium text-gray-900 text-base">Export as PDF</span>
            </button>
            <button
              onClick={() => handleExport('word')}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-200"
            >
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span className="font-medium text-gray-900 text-base">Export as Word</span>
            </button>
            <button
              onClick={() => handleExport('email')}
              className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3"
            >
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,5.11 21.1,4 20,4Z" />
              </svg>
              <span className="font-medium text-gray-900 text-base">Send via Email</span>
            </button>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5 text-blue-800 border-b-2 border-blue-100 pb-2">
              Export Options - {selectedFormat === 'pdf' ? 'PDF' : selectedFormat === 'word' ? 'Word' : 'Document'}
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Export Title
                </label>
                <input
                  type="text"
                  value={exportOptions.title}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter export title"
                />
              </div>

              <div className="space-y-3 mt-4">
                <p className="font-medium text-gray-800">Include in export:</p>
                <label className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-100">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimestamps}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                    className="mr-3 h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-800">Include timestamps</span>
                </label>
                <label className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-100">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSources}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeSources: e.target.checked }))}
                    className="mr-3 h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-800">Include source documents</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeExport}
                disabled={isExporting}
                className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium shadow-sm flex items-center justify-center"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-5 text-blue-800 border-b-2 border-blue-100 pb-2">Send via Email</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={emailState.to}
                  onChange={(e) => setEmailState(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailState.subject}
                  onChange={(e) => setEmailState(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Include Attachments
                </label>
                <select
                  value={emailState.attachFormat}
                  onChange={(e) => setEmailState(prev => ({ ...prev, attachFormat: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Text only</option>
                  <option value="pdf">PDF attachment</option>
                  <option value="word">Word attachment</option>
                  <option value="both">Both PDF and Word</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTimestamps}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                    className="mr-2"
                  />
                  Include timestamps
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeSources}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeSources: e.target.checked }))}
                    className="mr-2"
                  />
                  Include source documents
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={executeEmailExport}
                disabled={isExporting || !emailState.to.trim()}
                className="flex-1 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium shadow-sm flex items-center justify-center"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,5.11 21.1,4 20,4Z" />
                    </svg>
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
