# Provider Switching Guide

## Current Status
Your application is working perfectly with Google AI. Here's how to switch between different AI providers:

## Google AI (Current - Working)
**Status**: ✅ Active and working
**Setup**: Already configured
**Benefits**: 
- No local installation needed
- High quality embeddings (768 dimensions)
- Good chat responses
- Compatible with your current Pinecone index

**To keep using Google AI**:
```env
USE_VLLM=false
USE_OLLAMA=false
USE_FASTCHAT=false
USE_OPENAI=false
```

## OpenAI (Configured but needs billing)
**Status**: 🔄 Ready but requires paid API
**Setup**: API key already configured
**Benefits**:
- High quality responses
- Fast and reliable
- Good for production

**To switch to OpenAI**:
1. Set up billing on OpenAI account
2. Update .env.local:
```env
USE_OPENAI=true
USE_VLLM=false
USE_OLLAMA=false
USE_FASTCHAT=false
```

## vLLM (Future - Linux Recommended)
**Status**: 🏗️ Code integrated, needs proper environment
**Setup**: Works best on Linux with GPU
**Benefits**:
- Local deployment (no API costs)
- High performance
- Full control over models

**For future Linux deployment**:
1. Install vLLM: `pip install vllm`
2. Start server: `python -m vllm.entrypoints.openai.api_server --model BAAI/bge-small-en-v1.5 --port 8000 --enable-embeddings`
3. Update .env.local:
```env
USE_VLLM=true
USE_OPENAI=false
USE_OLLAMA=false
USE_FASTCHAT=false
```

## Testing Commands

**Test current Google AI**:
```bash
node test-google-embedding.js
```

**Test OpenAI (when billing enabled)**:
```bash
node test-openai-env.js
```

**Test vLLM (when server running)**:
```bash
node test-vllm-api.js
```

## Recommendation
**For now**: Continue using Google AI - it's working perfectly for your document QA chatbot.

**For production**: Consider OpenAI with proper billing setup.

**For future/advanced**: Use vLLM on a Linux server with GPU for maximum performance and cost control.
