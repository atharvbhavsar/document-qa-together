'use client';

import { useState } from 'react';
import { ChatExporter, ExportMessage, ExportOptions } from '@/lib/export-utils';

interface ExportButtonProps {
  messages: ExportMessage[];
  className?: string;
}

export default function ExportButton({ messages, className = '' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'word' | 'email'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeTimestamps: true,
    includeSources: true,
    title: 'Chat History Export'
  });

  const handleExport = async (format: 'pdf' | 'word' | 'email') => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    setSelectedFormat(format);
    setShowOptionsModal(true);
    setShowDropdown(false);
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

  return (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || messages.length === 0}
        className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md font-medium text-sm sm:text-base min-h-[44px] touch-manipulation ${className}`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
            <span className="hidden sm:inline">Exporting...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Export Chat</span>
            <span className="sm:hidden">Export</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 left-0 sm:left-auto bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 min-w-[240px]">
          <div className="py-2">
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 sm:gap-3 border-b border-gray-200 min-h-[48px] touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Export as PDF</span>
            </button>
            <button
              onClick={() => handleExport('word')}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 sm:gap-3 border-b border-gray-200 min-h-[48px] touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Export as Word</span>
            </button>
            <button
              onClick={() => handleExport('email')}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-2 sm:gap-3 min-h-[48px] touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,5.11 21.1,4 20,4Z" />
              </svg>
              <span className="font-medium text-gray-900 text-sm sm:text-base">Copy for Email</span>
            </button>
          </div>
        </div>
      )}

      {/* Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Export Options - {selectedFormat.toUpperCase()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Title
                </label>
                <input
                  type="text"
                  value={exportOptions.title}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter export title"
                />
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeExport}
                disabled={isExporting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isExporting ? 'Exporting...' : 'Export'}
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
