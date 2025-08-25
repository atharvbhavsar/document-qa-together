# vLLM Setup Guide for Document QA Chatbot

This guide will help you set up vLLM as an alternative AI provider for your document QA chatbot.

## What is vLLM?

vLLM is a fast and easy-to-use library for LLM inference and serving. It provides:
- High throughput serving
- OpenAI-compatible API
- Efficient memory usage
- Support for many popular models

## Prerequisites

- Python 3.8+ installed
- CUDA-compatible GPU (recommended, but CPU works too)
- At least 8GB RAM (16GB+ recommended for larger models)

## Installation Steps

### 1. Install vLLM

```bash
# Install vLLM with CUDA support (recommended)
pip install vllm

# For CPU-only installation
pip install vllm[cpu]
```

### 2. Choose Your Models

For this setup, we recommend these models:

**For Embeddings:**
- `BAAI/bge-small-en-v1.5` (384 dimensions) - Fast, good quality
- `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions) - Lightweight
- `thenlper/gte-small` (384 dimensions) - Good performance

**For Chat:**
- `microsoft/DialoGPT-medium` - Conversational AI
- `facebook/blenderbot-400M-distill` - Dialog model
- `microsoft/DialoGPT-small` - Lighter version

### 3. Start vLLM Server for Embeddings

```bash
# Start vLLM server for embeddings (adjust model as needed)
python -m vllm.entrypoints.openai.api_server \
  --model BAAI/bge-small-en-v1.5 \
  --port 8000 \
  --host 0.0.0.0 \
  --enable-embeddings
```

### 4. Start vLLM Server for Chat (Optional - Use separate port)

If you want to use vLLM for both embeddings and chat, you can run a separate instance:

```bash
# Start vLLM server for chat on different port
python -m vllm.entrypoints.openai.api_server \
  --model microsoft/DialoGPT-medium \
  --port 8001 \
  --host 0.0.0.0
```

### 5. Update Configuration

Update your `.env.local` file:

```env
# Enable vLLM
USE_VLLM=true

# vLLM configuration
VLLM_HOST=http://localhost:8000
VLLM_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
VLLM_CHAT_MODEL=microsoft/DialoGPT-medium
```

### 6. Test vLLM Connection

Run the test script to verify everything is working:

```bash
node test-vllm-api.js
```

## Recommended Model Configurations

### Configuration 1: Lightweight (Low Resource)
```env
VLLM_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
VLLM_CHAT_MODEL=microsoft/DialoGPT-small
```

### Configuration 2: Balanced (Recommended)
```env
VLLM_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
VLLM_CHAT_MODEL=microsoft/DialoGPT-medium
```

### Configuration 3: High Quality (More Resources)
```env
VLLM_EMBEDDING_MODEL=thenlper/gte-small
VLLM_CHAT_MODEL=facebook/blenderbot-400M-distill
```

## Important Notes

### Pinecone Compatibility
- Make sure your embedding model outputs 384 dimensions or update your Pinecone index
- Current setup uses 768 dimensions (Google AI compatible)
- You may need to create a new Pinecone index for 384-dimension models

### Model Downloads
- Models will be downloaded automatically on first use
- This can take time depending on model size and internet speed
- Models are cached locally for future use

### Memory Requirements
- Small models: 2-4GB RAM
- Medium models: 4-8GB RAM
- Large models: 8GB+ RAM

## Troubleshooting

### Common Issues

1. **CUDA Out of Memory**
   ```bash
   # Use smaller models or run on CPU
   python -m vllm.entrypoints.openai.api_server \
     --model BAAI/bge-small-en-v1.5 \
     --port 8000 \
     --host 0.0.0.0 \
     --enable-embeddings \
     --device cpu
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :8000
   
   # Use different port
   python -m vllm.entrypoints.openai.api_server \
     --model BAAI/bge-small-en-v1.5 \
     --port 8002 \
     --host 0.0.0.0 \
     --enable-embeddings
   ```

3. **Model Not Found**
   - Check model name spelling
   - Ensure internet connection for first download
   - Try alternative models

### Logs and Debugging

Check vLLM logs for detailed error information:
```bash
# Run with verbose logging
python -m vllm.entrypoints.openai.api_server \
  --model BAAI/bge-small-en-v1.5 \
  --port 8000 \
  --host 0.0.0.0 \
  --enable-embeddings \
  --log-level debug
```

## Performance Tips

1. **Use GPU when available** - Much faster than CPU
2. **Choose appropriate model size** - Balance quality vs. resource usage
3. **Enable tensor parallelism** for multi-GPU setups:
   ```bash
   python -m vllm.entrypoints.openai.api_server \
     --model BAAI/bge-small-en-v1.5 \
     --tensor-parallel-size 2 \
     --port 8000
   ```

## Next Steps

1. Test the setup with `node test-vllm-api.js`
2. Start your Next.js application with `npm run dev`
3. Upload a document and test the chat functionality
4. Monitor performance and adjust models as needed

## Alternative Models to Try

### Embedding Models (384 dimensions)
- `sentence-transformers/all-mpnet-base-v2`
- `sentence-transformers/all-distilroberta-v1`
- `intfloat/e5-small-v2`

### Chat Models
- `microsoft/DialoGPT-large` (if you have resources)
- `facebook/blenderbot-1B-distill`
- `microsoft/GODEL-v1_1-base-seq2seq`

Remember to update the `.env.local` configuration when changing models!
