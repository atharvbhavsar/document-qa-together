# Document Q&A Chatbot with FastChat Integration

This application allows you to chat with your documents using AI. It now supports Google's Gemini API, locally-hosted Ollama models, and FastChat for serving various open-source LLMs.

## FastChat Setup Instructions

### 1. Install FastChat

First, you need to install FastChat on your machine:

```bash
pip install fschat
```

### 2. Download a Model

Download a model to use with FastChat. For example, to use Vicuna:

```bash
# Create a models directory
mkdir -p models

# Download the model (example with a smaller model)
# For a production environment, you might want a larger model
huggingface-cli download lmsys/vicuna-7b-v1.5 --local-dir ./models/vicuna-7b-v1.5
```

### 3. Start FastChat Server

You need to start three separate servers:

1. Controller
```bash
python -m fastchat.serve.controller
```

2. Model Worker
```bash
python -m fastchat.serve.model_worker --model-path ./models/vicuna-7b-v1.5
```

3. API Server (OpenAI API compatible)
```bash
python -m fastchat.serve.openai_api_server --host localhost --port 8000
```

### 4. Configure the Application

Make sure your `.env.local` file has the following settings:

```
# FastChat Configuration
USE_FASTCHAT=true
USE_OLLAMA=false
FASTCHAT_HOST=http://localhost:8000
FASTCHAT_EMBEDDING_MODEL=all-MiniLM-L6-v2
FASTCHAT_CHAT_MODEL=vicuna-7b-v1.5
```

### 5. Verify FastChat Setup

Run the checker script to verify that FastChat is properly configured:

```bash
node check-fastchat.js
```

This will check if:
- FastChat server is running
- Required models are available
- Models are working correctly

### 6. Start the Application

```bash
npm run dev
```

## Features

- Upload and process documents (PDF, DOCX, TXT)
- Generate embeddings locally using FastChat
- Chat with your documents using AI
- No rate limits or API key requirements when using FastChat

## Troubleshooting

If you encounter issues:

1. Make sure all three FastChat servers are running
2. Verify you can access the API server at http://localhost:8000/v1/models
3. Check the FastChat server logs for errors
4. Run `node check-fastchat.js` to diagnose issues

## Switching Between Models

You can switch between different models by changing the settings in your `.env.local`:

- `USE_FASTCHAT=true` and `USE_OLLAMA=false` - Use FastChat models
- `USE_FASTCHAT=false` and `USE_OLLAMA=true` - Use local Ollama models
- `USE_FASTCHAT=false` and `USE_OLLAMA=false` - Use Google Gemini API (requires API key)

## Using Different Models with FastChat

FastChat can serve many different models. You can use different models by:

1. Downloading the model (using Hugging Face or other sources)
2. Starting a model worker with that model
3. Updating your `FASTCHAT_CHAT_MODEL` setting

Popular models that work well with FastChat:

- Vicuna: `lmsys/vicuna-7b-v1.5`
- LLaMA 2: `meta-llama/Llama-2-7b-chat-hf`
- Mistral: `mistralai/Mistral-7B-Instruct-v0.2`
- GPTQ quantized models are also supported for lower memory usage

## References

- FastChat GitHub: https://github.com/lm-sys/FastChat
- FastChat Documentation: https://github.com/lm-sys/FastChat/blob/main/docs/openai_api.md
- OpenAI-compatible API endpoint: http://localhost:8000/v1/chat/completions
