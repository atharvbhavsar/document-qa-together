# Document Q&A Chatbot with Ollama Integration

This application allows you to chat with your documents using AI. It now supports both Google's Gemini API and locally-hosted Ollama models.

## Ollama Setup Instructions

### 1. Install Ollama

First, you need to install Ollama on your machine:

- Download from [ollama.com/download](https://ollama.com/download)
- Install the application

### 2. Start Ollama Server

Open a terminal and run:

```bash
ollama serve
```

This will start the Ollama server on http://localhost:11434.

### 3. Pull Required Models

You need two models for this application:

```bash
# For embeddings
ollama pull nomic-embed-text

# For chat functionality
ollama pull llama3
```

Alternatively, you can use other models by changing the settings in your `.env.local` file.

### 4. Configure the Application

Make sure your `.env.local` file has the following settings:

```
# Ollama Configuration
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=llama3
```

### 5. Verify Ollama Setup

Run the checker script to verify that Ollama is properly configured:

```bash
node check-ollama.js
```

This will check if:
- Ollama server is running
- Required models are available
- Models are working correctly

### 6. Start the Application

```bash
npm run dev
```

## Features

- Upload and process documents (PDF, DOCX, TXT)
- Generate embeddings locally using Ollama
- Chat with your documents using AI
- No rate limits or API key requirements when using Ollama

## Troubleshooting

If you encounter issues:

1. Make sure Ollama is running with `ollama serve`
2. Verify your models are installed with `ollama list`
3. Check the Ollama server logs for errors
4. Run `node check-ollama.js` to diagnose issues

## Switching Between Google API and Ollama

You can switch between Google API and Ollama by changing the `USE_OLLAMA` setting in `.env.local`:

- `USE_OLLAMA=true` - Use local Ollama models
- `USE_OLLAMA=false` - Use Google Gemini API (requires API key)

## Customizing Models

You can use different Ollama models by changing the settings in `.env.local`:

```
OLLAMA_EMBEDDING_MODEL=nomic-embed-text  # or any other embedding model
OLLAMA_CHAT_MODEL=llama3  # or mistral, phi, gemma, etc.
```

Make sure to pull the models first with `ollama pull <model-name>`.
