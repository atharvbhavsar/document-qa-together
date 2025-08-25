import { NextRequest, NextResponse } from 'next/server';
import { genAI, CHAT_MODEL, USE_OLLAMA, OLLAMA_HOST, OLLAMA_CHAT_MODEL, USE_FASTCHAT, FASTCHAT_HOST, FASTCHAT_CHAT_MODEL, USE_OPENAI, USE_VLLM, VLLM_HOST, VLLM_CHAT_MODEL, USE_TOGETHER } from '@/lib/config';
import { generateEmbedding } from '@/lib/document-processor';
import { searchDocuments } from '@/lib/pinecone-utils';
import { ChatMessage } from '@/lib/chat-context';

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory, isSummary = false, selectedDocuments } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    console.log(`Processing chat request: "${message}"`);
    
    // Check if we have chat history
    const hasHistory = Array.isArray(chatHistory) && chatHistory.length > 0;
    if (hasHistory) {
      console.log(`Request includes chat history with ${chatHistory.length} previous messages`);
    }

    // Generate embedding for the user's question
    const questionEmbedding = await generateEmbedding(message);
    
    // For summaries, get more chunks to ensure comprehensive coverage
    const chunkCount = isSummary ? 20 : 12;
    let relevantChunks = await searchDocuments(questionEmbedding, chunkCount);
    
    // Filter by selected documents if provided
    if (selectedDocuments && Array.isArray(selectedDocuments) && selectedDocuments.length > 0) {
      relevantChunks = relevantChunks.filter(chunk => selectedDocuments.includes(chunk.filename));
      console.log(`Filtered to ${relevantChunks.length} chunks from selected documents: ${selectedDocuments.join(', ')}`);
    }
    
    // Filter out chunks with undefined or empty text
    relevantChunks = relevantChunks.filter(chunk => chunk.text && chunk.text.trim().length > 0);
    
    if (relevantChunks.length === 0) {
      return NextResponse.json({
        response: "I couldn't find any relevant information in your documents. Please upload a document first, or ask a question about the documents you've uploaded.",
      });
    }
    
    // Log found documents to help with debugging
    console.log(`Found ${relevantChunks.length} relevant chunks from documents:`);
    const uniqueFiles = new Set();
    relevantChunks.forEach(chunk => {
      uniqueFiles.add(chunk.filename);
    });
    console.log(`Document sources: ${Array.from(uniqueFiles).join(', ')}`);
    
    // Prepare context from relevant chunks with citation information
    const context = relevantChunks
      .map((chunk, index) => {
        const pageInfo = chunk.pageNumber ? ` (Page ${chunk.pageNumber})` : '';
        return `[Document: ${chunk.filename}${pageInfo}]\n${chunk.text || 'No text content available'}`;
      })
      .join('\n\n');

    // Prepare citations for the response
    const citations = relevantChunks.map((chunk, index) => ({
      filename: chunk.filename,
      pageNumber: chunk.pageNumber,
      snippet: (chunk.text || '').substring(0, 150) + ((chunk.text || '').length > 150 ? '...' : ''),
      chunkIndex: index + 1
    }));

    // Build conversation history for context
    let conversationHistory = '';
    if (hasHistory) {
      const recentHistory = chatHistory.slice(-4); // Last 4 messages for context
      conversationHistory = recentHistory
        .map((msg: any) => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');
    }

    // Create a comprehensive system prompt with enhanced instructions
    let systemPrompt = '';
    
    if (isSummary) {
      systemPrompt = `You are an AI assistant that provides comprehensive document summaries. 
Based on the uploaded documents, create a detailed and well-organized summary that:

1. Highlights key information and main points from each document
2. Organizes information logically by topic or document type  
3. Includes specific details like names, dates, numbers, and important facts
4. Provides context about what each document contains
5. Uses clear headings and bullet points for easy reading

Be thorough and include all important information while keeping it well-structured and easy to understand.

When you reference information from documents, try to be specific about the source and location when possible, as this will help users understand where the information comes from.`;
    } else {
      systemPrompt = `You are a helpful AI assistant that answers questions about uploaded documents. 
You have access to relevant chunks of information from the user's documents.

Guidelines for your responses:
1. Always base your answers on the provided document content
2. Be specific and cite the document names when referencing information
3. If you find specific information like names, dates, or numbers, include them in your response
4. If the question is about certificates or official documents, be precise with details
5. If you cannot find the specific information requested, say so clearly
6. Maintain context from previous conversation when relevant
7. For document-specific questions, focus on extracting exact information from the documents

When you reference information from documents, try to be specific about the source and location when possible, as this will help users understand where the information comes from.`;
    }

    // Use Ollama, FastChat or Google AI based on configuration
    let response = '';
    
    console.log('Chat configuration:', { USE_OLLAMA, USE_FASTCHAT, USE_OPENAI, USE_VLLM, USE_TOGETHER });
    
    if (USE_OLLAMA) {
      try {
        console.log('Making Ollama request to:', `${OLLAMA_HOST}/api/generate`);
        const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: OLLAMA_CHAT_MODEL,
            prompt: `${systemPrompt}

Previous conversation:
${conversationHistory}

Context from documents:
${context}

User question: ${message}

Please provide a helpful and accurate response based on the document content:`,
            stream: false,
          }),
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama API error: ${ollamaResponse.status}`);
        }

        const ollamaData = await ollamaResponse.json();
        response = ollamaData.response || 'Sorry, I could not generate a response.';
      } catch (error) {
        console.error('Ollama error:', error);
        throw new Error('Failed to connect to Ollama. Make sure Ollama is running on your machine.');
      }
    } else if (USE_FASTCHAT) {
      try {
        console.log('Making FastChat request to:', `${FASTCHAT_HOST}/v1/chat/completions`);
        const fastChatResponse = await fetch(`${FASTCHAT_HOST}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: FASTCHAT_CHAT_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Previous conversation:\n${conversationHistory}\n\nContext from documents:\n${context}\n\nUser question: ${message}\n\nPlease provide a helpful and accurate response based on the document content:` }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }),
        });

        if (!fastChatResponse.ok) {
          throw new Error(`FastChat API error: ${fastChatResponse.status}`);
        }

        const fastChatData = await fastChatResponse.json();
        response = fastChatData.choices[0].message.content || 'Sorry, I could not generate a response.';
      } catch (error) {
        console.error('FastChat error:', error);
        throw new Error('Failed to connect to FastChat. Make sure FastChat is running on your machine.');
      }
    } else if (USE_OPENAI) {
      try {
        console.log('Making OpenAI request...');
        const { generateOpenAIResponse } = await import('@/lib/openai-config');
        
        // Prepare messages for OpenAI
        const messages = [
          ...chatHistory.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ];
        
        response = await generateOpenAIResponse(messages, relevantChunks);
      } catch (error) {
        console.error('OpenAI error:', error);
        throw new Error('Failed to connect to OpenAI. Please check your API key.');
      }
    } else if (USE_VLLM) {
      try {
        console.log('Making vLLM request...');
        const { generateVLLMResponse } = await import('@/lib/vllm-config');
        
        // Prepare conversation history for vLLM
        const historyMessages = chatHistory.map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content
        }));
        
        response = await generateVLLMResponse(context, message, historyMessages);
      } catch (error) {
        console.error('vLLM error:', error);
        throw new Error('Failed to connect to vLLM. Make sure vLLM server is running.');
      }
    } else if (USE_TOGETHER) {
      try {
        console.log('Making Together AI request...');
        const { generateTogetherResponse } = await import('@/lib/together-config');
        
        const prompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

Context from documents:
${context}

User question: ${message}

Please provide a helpful and accurate response based on the document content:`;
        
        response = await generateTogetherResponse(prompt);
      } catch (error) {
        console.error('Together AI error:', error);
        throw new Error('Failed to connect to Together AI. Please check your API key.');
      }
    } else {
      // Use Google Generative AI
      if (!genAI) {
        throw new Error('Google AI is not configured. Please check your API key.');
      }

      try {
        const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
        
        const prompt = `${systemPrompt}

Previous conversation:
${conversationHistory}

Context from documents:
${context}

User question: ${message}

Please provide a helpful and accurate response based on the document content:`;

        const result = await model.generateContent(prompt);
        response = result.response.text();
      } catch (error: any) {
        console.error('Google AI error:', error);
        if (error.message?.includes('Quota exceeded')) {
          throw new Error('The Google AI API rate limit has been reached. Please wait a moment and try again.');
        }
        throw error;
      }
    }

    // Return the response with citations
    return NextResponse.json({
      response: response.trim(),
      citations: citations.slice(0, 5), // Limit to top 5 citations to avoid overwhelming the user
      sources: Array.from(uniqueFiles)
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide a more helpful error message for rate limits
    if (error instanceof Error) {
      if (error.message.includes('Quota exceeded') || error.message.includes('insufficient_quota')) {
        return NextResponse.json({ 
          error: 'API rate limits reached for Google AI and OpenAI. Please wait a moment and try again, or configure Together AI as an alternative.' 
        }, { status: 429 });
      } else if (error.message.includes('Ollama')) {
        return NextResponse.json({ 
          error: 'Failed to connect to Ollama. Make sure Ollama is running on your machine.' 
        }, { status: 500 });
      } else if (error.message.includes('FastChat')) {
        return NextResponse.json({ 
          error: 'Failed to connect to FastChat. Make sure FastChat is running on your machine.' 
        }, { status: 500 });
      } else if (error.message.includes('Together AI')) {
        return NextResponse.json({ 
          error: 'Failed to connect to Together AI. Please check your API key and try again.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to process your question. Please try again.' 
    }, { status: 500 });
  }
}
