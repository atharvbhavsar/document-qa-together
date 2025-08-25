# Document Q&A Chatbot

A Next.js-based document question-answering system powered by Google Gemini AI and Pinecone vector database. This application allows users to upload documents and ask questions about them, with AI-generated responses based on the document content.

## Features

- **Document Upload**: Support for PDF and DOCX files
- **AI-Powered Q&A**: Uses Google Gemini for embeddings and chat responses
- **Vector Search**: Pinecone database for efficient document retrieval
- **Modern UI**: Clean React interface with Tailwind CSS
- **Real-time Chat**: Interactive chat interface with source attribution
- **Rate Limit Handling**: Automatic retry with exponential backoff for API rate limits
- **OCR Support**: Text extraction from images using Tesseract.js
- **File Export**: Save chat conversations as PDF

## Rate Limit Management

The application has been enhanced to handle rate limits from the Google Gemini API with the following features:

1. **Automatic Retry Logic**: The application will automatically retry requests when rate limits are hit, using exponential backoff (increasing wait time between retries).

2. **User-Friendly Error Messages**: When rate limits are encountered, users will receive clear messages explaining the issue and what to do.

3. **Loading Indicators**: Enhanced loading indicators show the progress and inform users when retries are happening.

### Common Rate Limit Issues

As this application uses the Google Gemini API, it is subject to rate limits, especially when using the free tier. The most common rate limit error is:

```
Quota exceeded for quota metric 'Generate Content API requests per minute'
```

### How to Resolve Rate Limit Issues

1. **Wait and Try Again**: Rate limits are typically per-minute, so waiting 1-2 minutes before trying again often resolves the issue.

2. **Reduce Request Frequency**: Avoid making multiple requests in quick succession.

3. **Upgrade API Tier**: If you're frequently hitting rate limits, consider upgrading to a paid tier of the Google Gemini API.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini API (embeddings + chat)
- **Database**: Pinecone Vector Database
- **File Processing**: pdf-parse, mammoth, Tesseract.js (OCR)
- **Authentication**: JWT, bcrypt (ready for implementation)
- **Cloud Storage**: Google Cloud Storage integration available

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Google Gemini API key
- Pinecone account and API key

## Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/document-qa-chatbot.git
   cd document-qa-chatbot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file with:
   ```
   GOOGLE_API_KEY=your_google_gemini_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=document-qa-index
   PINECONE_ENVIRONMENT=gcp-starter
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Create Pinecone Index**:
   - Go to [Pinecone Console](https://app.pinecone.io/)
   - Create a new index named `document-qa-index`
   - Set dimensions to `768` (for Gemini embeddings)
   - Choose your preferred region

5. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Documents**: 
   - Drag and drop PDF or DOCX files into the upload area
   - Wait for processing confirmation

2. **Ask Questions**: 
   - Type questions about your uploaded documents in the chat interface
   - Press Enter or click the send button

3. **Get Answers**: 
   - Receive AI-generated responses with source attribution
   - View references to the specific documents and sections used

4. **Troubleshooting**:
   - If you encounter rate limit errors, wait a minute and try again
   - For persistent issues, check the API key configuration

## API Endpoints

- `POST /api/upload` - Upload and process documents
- `POST /api/chat` - Chat with documents using RAG (Retrieval-Augmented Generation)
- `GET /api/test` - Test endpoint for API connectivity

## Project Structure

```
document-qa-chatbot/
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # Document upload endpoint
│   │   ├── chat/route.ts      # Chat endpoint with rate limit handling
│   │   └── test/route.ts      # Test endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── components/
│   ├── FileUpload.tsx         # File upload component
│   ├── ChatInterface.tsx      # Chat interface
│   ├── LoadingIndicator.tsx   # Enhanced loading indicator
│   └── InfoAlert.tsx          # Informational alerts
├── lib/
│   ├── auth.ts                # Authentication utilities
│   ├── config.ts              # API configurations
│   ├── document-processor.ts  # Document processing utilities
│   ├── pinecone-utils.ts      # Pinecone operations
│   ├── ollama-config.ts       # Ollama configuration
│   └── retry-utils.ts         # Retry utilities for rate limits
├── public/                    # Static assets
└── ...config files
```

## Alternative AI Models

The application is designed to work with Google Gemini by default, but it includes integration code for both Ollama and FastChat, allowing you to use open-source models locally:

### Ollama Integration

To use Ollama:

1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Follow the instructions in `OLLAMA_SETUP.md` and `OLLAMA_INTEGRATION_FIX.md`
3. Use the test files in the root directory to verify your Ollama setup

### FastChat Integration

To use FastChat:

1. Install FastChat using pip: `pip install fschat`
2. Download and set up models as described in `FASTCHAT_SETUP.md`
3. Start the FastChat servers (controller, model worker, and API server)
4. Verify your setup with `check-fastchat.js`

## Testing and Debugging

The project includes several test scripts to help debug your setup:

- `check-api-key.js`: Verify your Google API key
- `check-dimensions.js`: Confirm embedding dimensions
- `check-index.js`: Test Pinecone index configuration
- `check-ollama.js`: Verify Ollama setup
- `check-fastchat.js`: Verify FastChat setup
- `test-embedding.js`: Test embedding generation
- `test-chat-api.js`: Test the chat API endpoint
- `test-ollama-direct.js`: Test direct Ollama API calls
- `test-fastchat-direct.js`: Test direct FastChat API calls

Run these scripts with Node.js:
```bash
node check-api-key.js
```

## Deployment

### Next.js Deployment

The application can be deployed on Vercel with minimal configuration:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy

### Docker Deployment

A `docker-compose.yml` file is available in the root of the repository for containerized deployment:

```bash
docker-compose up -d
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for providing the AI capabilities
- Pinecone for vector database functionality
- Next.js team for the amazing framework