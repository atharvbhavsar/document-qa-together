'use client';

import React, { useState } from 'react';
import { Button } from '../../components/ui/button/Button';
import LoadingIndicator from '../../components/LoadingIndicator';

// Function to highlight search terms in text
function highlightText(text: string, searchQuery: string) {
  if (!searchQuery.trim()) return text;
  
  const words = searchQuery.toLowerCase().split(/\s+/);
  let highlightedText = text;
  
  // First, format the text for better readability
  highlightedText = formatTextForReadability(highlightedText);
  
  words.forEach(word => {
    if (word.length > 1) { // Only highlight words longer than 1 character
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 py-0.5 rounded mx-0.5" style="margin: 0 2px;">$1</mark>');
    }
  });
  
  return highlightedText;
}

// Function to format text for better readability
function formatTextForReadability(text: string) {
  let formattedText = text;
  
  // First, add spaces between words that are stuck together
  formattedText = formattedText.replace(/([a-z])([A-Z])/g, '$1 $2'); // camelCase words
  formattedText = formattedText.replace(/([a-zA-Z])(\d)/g, '$1 $2'); // letter+number
  formattedText = formattedText.replace(/(\d)([a-zA-Z])/g, '$1 $2'); // number+letter
  formattedText = formattedText.replace(/([a-z])([A-Z][a-z])/g, '$1 $2'); // word boundaries
  
  // More aggressive word separation for common patterns
  formattedText = formattedText.replace(/([a-z])(to)([A-Z])/g, '$1 $2 $3'); // "toSort" -> "to Sort"
  formattedText = formattedText.replace(/([a-z])(by)([A-Z])/g, '$1 $2 $3'); // "byCalculated" -> "by Calculated"
  formattedText = formattedText.replace(/([a-z])(in)([A-Z])/g, '$1 $2 $3'); // "inAscending" -> "in Ascending"
  formattedText = formattedText.replace(/([a-z])(and)([A-Z])/g, '$1 $2 $3'); // "andthe" -> "and the"
  formattedText = formattedText.replace(/([a-z])(the)([A-Z])/g, '$1 $2 $3'); // "theOrder" -> "the Order"
  formattedText = formattedText.replace(/([a-z])(of)([A-Z])/g, '$1 $2 $3'); // "ofSpecifying" -> "of Specifying"
  formattedText = formattedText.replace(/([a-z])(can)([A-Z])/g, '$1 $2 $3'); // "canSort" -> "can Sort"
  formattedText = formattedText.replace(/([a-z])(are)([A-Z])/g, '$1 $2 $3'); // "areConsidered" -> "are Considered"
  formattedText = formattedText.replace(/([a-z])(is)([A-Z])/g, '$1 $2 $3'); // "isUsed" -> "is Used"
  formattedText = formattedText.replace(/([a-z])(from)([A-Z])/g, '$1 $2 $3'); // "fromTable" -> "from Table"
  
  // Add spaces after periods if missing (but not in abbreviations)
  formattedText = formattedText.replace(/\.([A-Z][a-z])/g, '. $1');
  
  // Add space after commas if missing
  formattedText = formattedText.replace(/,([A-Za-z])/g, ', $1');
  
  // Add spaces around parentheses
  formattedText = formattedText.replace(/\(([A-Za-z])/g, '( $1');
  formattedText = formattedText.replace(/([A-Za-z])\)/g, '$1 )');
  
  // Fix specific common issues in database text
  formattedText = formattedText.replace(/possibletoSortbycalculatedexpressions/g, 'possible to Sort by calculated expressions');
  formattedText = formattedText.replace(/notjustcolumnvalues/g, 'not just column values');
  formattedText = formattedText.replace(/NULLvaluesareconsideredthesmallestin/g, 'NULL values are considered the smallest in');
  formattedText = formattedText.replace(/ascendingorderandthe/g, 'ascending order and the');
  formattedText = formattedText.replace(/largestindescendingorder/g, 'largest in descending order');
  formattedText = formattedText.replace(/Youcancontrolthesortingbehaviourof/g, 'You can control the sorting behaviour of');
  formattedText = formattedText.replace(/NULLvaluesusingthe/g, 'NULL values using the');
  formattedText = formattedText.replace(/NULLSFIRSTor/g, 'NULLS FIRST or');
  formattedText = formattedText.replace(/NULLSLASToptions/g, 'NULLS LAST options');
  formattedText = formattedText.replace(/Insteadofspecifyingcolumnnames/g, 'Instead of specifying column names');
  formattedText = formattedText.replace(/youcansortbycolumnpositionsinthe/g, 'you can sort by column positions in the');
  formattedText = formattedText.replace(/ORDERBYclause/g, 'ORDER BY clause');
  formattedText = formattedText.replace(/isusedtogrouprowsfromatablebasedononeormore/g, 'is used to group rows from a table based on one or more');
  
  formattedText = formattedText.replace(/focusedonretrievingdata/g, 'focused on retrieving data');
  formattedText = formattedText.replace(/fromdatabases/g, 'from databases');
  formattedText = formattedText.replace(/Databaseisacollection/g, 'Database is a collection');
  formattedText = formattedText.replace(/ofinterrelateddata/g, 'of interrelated data');
  formattedText = formattedText.replace(/issoftwareusedto/g, 'is software used to');
  formattedText = formattedText.replace(/create,manage,andorganize/g, 'create, manage, and organize');
  formattedText = formattedText.replace(/isStructuredQueryLanguage/g, 'is Structured Query Language');
  formattedText = formattedText.replace(/usedtostore,manipulateandretrievedata/g, 'used to store, manipulate and retrieve data');
  formattedText = formattedText.replace(/keywordsareNOTcasesensitive/g, 'keywords are NOT case sensitive');
  formattedText = formattedText.replace(/isalanguageusedto/g, 'is a language used to');
  formattedText = formattedText.replace(/performCRUDOperations/g, 'perform CRUD Operations');
  formattedText = formattedText.replace(/inRelationalDB/g, 'in Relational DB');
  formattedText = formattedText.replace(/whileMy/g, 'while My');
  
  // Add line breaks after sentences and bullet points
  formattedText = formattedText.replace(/\. ([A-Z])/g, '.<br><br>$1');
  
  // Add line breaks before bullet points (●)
  formattedText = formattedText.replace(/●/g, '<br><br>• ');
  
  // Format common database terms with better spacing and styling
  formattedText = formattedText.replace(/\bDBMS\b/g, '<strong>DBMS</strong>');
  formattedText = formattedText.replace(/\bRDBMS\b/g, '<strong>RDBMS</strong>');
  formattedText = formattedText.replace(/\bSQL\b/g, '<strong>SQL</strong>');
  
  // Add line breaks before major sections
  formattedText = formattedText.replace(/\b(CREATE|READ|UPDATE|DELETE|SELECT)\b/g, '<br><strong>$1</strong>');
  
  // Normalize multiple spaces but preserve intentional spacing
  formattedText = formattedText.replace(/[ ]{3,}/g, ' ');
  formattedText = formattedText.replace(/[ ]{2}/g, ' ');
  
  return formattedText;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || 'Search failed. Please try again.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocument(docId === selectedDocument ? null : docId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            🔍 Search Documents
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Ask questions about your uploaded documents and get instant answers powered by AI
          </p>
        </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 What would you like to know about your documents?
                </label>
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for specific words, phrases, or concepts in your documents..."
                  className="w-full px-4 py-4 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 placeholder-gray-500"
                  disabled={isSearching}
                  style={{
                    fontSize: '16px', // Prevents zoom on mobile
                    minHeight: '56px', // Touch-friendly height
                    color: '#111827' // Ensures dark text color
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  variant="default" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 shadow-lg hover:shadow-xl transition-all duration-200 min-h-[56px]"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </div>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Search Tips */}
            <div className="mt-4 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="text-blue-500">💡</span>
                <span>Search for any words that appear in your documents - they will be highlighted in yellow!</span>
              </p>
            </div>
          </div>
        </form>

        {isSearching && (
          <div className="text-center py-8">
            <LoadingIndicator isVisible={true} message="Searching documents..." />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800">Search Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <h2 className="text-xl font-semibold p-6 border-b bg-gray-50 text-gray-800">
              📋 Search Results ({results.length})
            </h2>
            <ul className="divide-y divide-gray-100">
              {results.map((result, index) => (
                <li key={index} className="p-6 hover:bg-blue-50 transition-colors duration-200">
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleDocumentSelect(result.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-blue-700 text-lg hover:text-blue-800 transition-colors">
                        📄 {result.title || 'Document Excerpt'}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {Math.round((result.score || 0) * 100)}% match
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {result.filename || 'Unknown source'}
                    </p>
                    <div className="text-gray-800 leading-loose mb-3 break-words prose prose-sm max-w-none"
                         style={{ 
                           wordSpacing: '0.15em',
                           letterSpacing: '0.03em',
                           lineHeight: '1.8'
                         }}
                         dangerouslySetInnerHTML={{
                           __html: highlightText(
                             result.text ? (result.text.length > 300 ? result.text.substring(0, 300) + '...' : result.text) : 'No content available',
                             query
                           )
                         }}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Source Document
                      </span>
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        {selectedDocument === result.id ? 'Click to collapse ↑' : 'Click to expand →'}
                      </span>
                    </div>
                    {selectedDocument === result.id && result.text && (
                      <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Full Content:</h4>
                        <div className="text-gray-800 leading-loose whitespace-pre-wrap break-words prose prose-lg max-w-none"
                             style={{ 
                               wordSpacing: '0.15em',
                               letterSpacing: '0.03em',
                               lineHeight: '2.0'
                             }}
                             dangerouslySetInnerHTML={{
                               __html: highlightText(result.text, query)
                             }}
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!isSearching && results.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Search</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a question above to search through your uploaded documents and get instant AI-powered answers
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
