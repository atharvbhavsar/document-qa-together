import { NextRequest, NextResponse } from 'next/server';
import { pinecone, PINECONE_INDEX_NAME } from '@/lib/config';
import { generateEmbedding } from '@/lib/document-processor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Searching for:', query);

    // Check if Pinecone is configured
    if (!pinecone) {
      return NextResponse.json(
        { error: 'Vector database not configured. Please check your Pinecone settings.' },
        { status: 500 }
      );
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query);
    
    // Get the Pinecone index
    const index = pinecone.index(PINECONE_INDEX_NAME);
    
    // Search for similar documents
    const searchResults = await index.query({
      vector: embedding,
      topK: 20, // Get more results initially for filtering
      includeMetadata: true,
      includeValues: false,
      filter: {
        // Add text filter to improve exact word matching
        text: { $exists: true }
      }
    });

    console.log(`📊 Found ${searchResults.matches?.length || 0} initial matches`);

    // Format and filter the results
    let results = searchResults.matches?.map(match => ({
      id: match.id,
      score: match.score,
      title: match.metadata?.filename || match.metadata?.title || 'Untitled Document',
      text: match.metadata?.text || '',
      filename: match.metadata?.filename || '',
      chunkIndex: match.metadata?.chunkIndex || 0,
      metadata: match.metadata
    })) || [];

    // Additional text-based filtering for exact word matches
    const queryWords = query.toLowerCase().split(/\s+/);
    results = results.filter(result => {
      const text = String(result.text || '').toLowerCase();
      // Check if any of the query words appear in the document text
      return queryWords.some(word => text.includes(word));
    });

    // Sort by relevance (combination of vector similarity and text match)
    results = results.sort((a, b) => {
      const aTextMatch = queryWords.filter(word => 
        String(a.text || '').toLowerCase().includes(word)
      ).length / queryWords.length;
      
      const bTextMatch = queryWords.filter(word => 
        String(b.text || '').toLowerCase().includes(word)
      ).length / queryWords.length;
      
      // Combine vector score with text match score
      const aFinalScore = (a.score || 0) * 0.7 + aTextMatch * 0.3;
      const bFinalScore = (b.score || 0) * 0.7 + bTextMatch * 0.3;
      
      return bFinalScore - aFinalScore;
    });

    // Limit to top 10 results
    results = results.slice(0, 10);

    console.log(`✅ Found ${results.length} results for query: "${query}"`);

    return NextResponse.json({
      success: true,
      results,
      query,
      total: results.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    let errorMessage = 'Search failed. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('Pinecone')) {
        errorMessage = 'Vector database connection error. Please check your Pinecone configuration.';
      } else if (error.message.includes('embedding')) {
        errorMessage = 'Error generating search embedding. Please check your API configuration.';
      } else if (error.message.includes('index')) {
        errorMessage = 'Search index not found. Please upload some documents first.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
