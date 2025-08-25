# Google Drive Integration Setup Guide

## Overview
This document explains how to set up Google Drive integration for the Document QA Chatbot, enabling users to authenticate with Google Drive, search their documents, and ask questions using RAG (Retrieval-Augmented Generation).

## Features Implemented
✅ **Google Drive OAuth2 Authentication**  
✅ **Document Search & Retrieval from Drive**  
✅ **RAG-powered Q&A with Drive Documents**  
✅ **Vector Database Integration (Pinecone)**  
✅ **Real-time Chat Interface**  
✅ **Support for Multiple File Types** (Docs, Sheets, PDFs, etc.)

## Prerequisites

### 1. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to **APIs & Services > Library**
   - Search for "Google Drive API" and enable it
4. Create OAuth2 credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback`
     - `https://yourdomain.com/auth/callback` (for production)
   - Save the Client ID and Client Secret

### 🌍 **Making Your App Publicly Accessible (IMPORTANT)**

#### Option A: Publish Your OAuth App (Recommended for Global Use)
1. **Complete the OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**
   - Choose **External** user type
   - Fill in required information:
     - App name: "Document QA Chatbot"
     - User support email: your email
     - Developer contact email: your email
     - App domain: your website domain
     - Privacy policy URL (optional but recommended)
     - Terms of service URL (optional)
   
2. **Add Scopes:**
   - Click **Add or Remove Scopes**
   - Add these scopes:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`

3. **Publish the App:**
   - Go to **Publishing status**
   - Click **Publish App**
   - Submit for verification (may take a few days)
   - Once approved, anyone can use your app

#### Option B: Keep in Testing Mode (Limited Users)
If you want to keep it in testing mode temporarily:
1. Go to **OAuth consent screen > Test users**
2. Add specific email addresses (up to 100 users)
3. Users will see a warning but can still proceed

#### Option C: Use Domain-Wide Delegation (Enterprise)
For enterprise use with G Suite/Workspace:
1. Enable domain-wide delegation in your service account
2. Configure in G Suite Admin Console
3. All users in your domain can access without individual approval

### 2. Pinecone Setup
1. Sign up at [Pinecone](https://www.pinecone.io/)
2. Create a new index:
   - Dimension: **768** (for Ollama embeddings) or **768** (for Google embeddings)
   - Metric: **cosine**
3. Get your API key from the dashboard

### 3. Google Gemini API (Optional)
1. Get API key from [Google AI Studio](https://aistudio.google.com/)
2. This is used as fallback if Ollama is not available

## Environment Configuration

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
# Google Drive API Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Gemini API Configuration
GOOGLE_API_KEY=your_google_gemini_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=document-qa-index

# Ollama Configuration (Optional)
USE_OLLAMA=true  # Set to false to use Google embeddings
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Set up Ollama (recommended for embeddings):**
   ```bash
   # Install Ollama
   curl https://ollama.ai/install.sh | sh
   
   # Pull the embedding model
   ollama pull nomic-embed-text
   ```

## Usage Guide

### 1. Authentication
1. Click the "Connect Google Drive" button
2. Complete OAuth2 flow in popup window
3. Grant necessary permissions for Drive access

### 2. Document Selection
1. Browse your Google Drive files
2. Use search to find specific documents
3. Select files you want to process for Q&A
4. Click "Process Selected Files"

### 3. Ask Questions
1. Once documents are processed, use the chat interface
2. Ask questions about your documents:
   - "What is the project deadline in my documents?"
   - "Summarize the meeting notes from last week"
   - "Find budget information in my spreadsheets"

## API Endpoints

### Authentication
- `GET /api/auth/google` - Get OAuth2 URL
- `GET /api/auth/callback` - Handle OAuth2 callback

### Drive Operations
- `GET /api/drive/files` - List Drive files
- `POST /api/drive/files` - Search Drive files
- `POST /api/drive/ingest` - Process files into vector DB
- `POST /api/drive/chat` - Ask questions about Drive docs

## Architecture

### Components
1. **GoogleDriveService** - Handles Drive API operations
2. **DriveRAGPipeline** - Processes documents and manages RAG
3. **GoogleDriveAuth** - Authentication UI component
4. **DriveFileBrowser** - File selection interface
5. **DriveChatInterface** - Q&A chat interface

### Data Flow
1. **Authentication** → OAuth2 → Store tokens
2. **File Selection** → Search/Browse → Select files
3. **Processing** → Chunk documents → Generate embeddings → Store in Pinecone
4. **Query** → Generate query embedding → Search similar chunks → Generate answer

## Supported File Types
- Google Docs (`.gdoc`)
- Google Sheets (`.gsheet`) 
- Google Slides (`.gslides`)
- PDF files (`.pdf`)
- Text files (`.txt`)
- CSV files (`.csv`)

## Security Features
- OAuth2 authentication with Google
- Secure token handling
- Read-only Drive access
- No document storage (only embeddings)

## Troubleshooting

### Common Issues

1. **OAuth2 Error: redirect_uri_mismatch**
   - Ensure redirect URI in Google Console matches exactly
   - Check for http vs https

2. **Pinecone dimension mismatch**
   - Verify index dimension matches embedding model
   - Ollama: 768, Google: 768

3. **Drive API quota exceeded**
   - Check quotas in Google Cloud Console
   - Implement rate limiting if needed

4. **Authentication popup blocked**
   - Allow popups for localhost/your domain
   - Check browser settings

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=google-drive,pinecone
```

## Performance Optimization

### Embedding Generation
- Use Ollama locally for faster embeddings
- Batch process multiple documents
- Cache embeddings when possible

### Vector Search
- Optimize Pinecone queries with filters
- Use appropriate `topK` values (5-10)
- Implement semantic caching

## Production Deployment

### Environment Variables
Update redirect URIs for production domain:
```bash
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback
```

### Security Considerations
- Use HTTPS in production
- Implement rate limiting
- Monitor API usage quotas
- Regular security audits

## Testing

### Manual Testing
1. Test authentication flow
2. Verify file retrieval from Drive
3. Test document processing pipeline
4. Validate Q&A responses

### Automated Testing
```bash
npm test
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for errors
4. Verify environment variables are set correctly

---

**Note:** This implementation follows Google's OAuth2 best practices and Pinecone's recommended usage patterns for optimal performance and security.
