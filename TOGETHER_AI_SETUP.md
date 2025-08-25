# Together AI Integration Guide

## What is Together AI?

Together AI is a powerful platform that provides access to open-source language models with competitive pricing and excellent rate limits. It's a great alternative to Google AI and OpenAI, especially for production applications.

## 🚀 Quick Setup

### 1. Get Together AI API Key

1. Visit [https://api.together.xyz/](https://api.together.xyz/)
2. Sign up for a free account
3. Navigate to your API settings
4. Generate a new API key
5. Copy your API key (starts with something like `together_xxxxx`)

### 2. Configure Your Application

Add your Together AI API key to your `.env.local` file:

```bash
# Together AI Configuration
TOGETHER_API_KEY=your_together_api_key_here
USE_TOGETHER=true
```

### 3. Test the Integration

Run the test script to verify your setup:

```bash
node test-together-api.js
```

## 📊 Available Models

### Embedding Models
- **BAAI/bge-large-en-v1.5** (default) - High-quality 1024-dimension embeddings
- **BAAI/bge-base-en-v1.5** - Balanced performance and speed
- **sentence-transformers/all-MiniLM-L6-v2** - Lightweight option

### Chat Models
- **meta-llama/Llama-2-70b-chat-hf** (default) - High-quality responses
- **meta-llama/Llama-2-13b-chat-hf** - Faster, still good quality
- **mistralai/Mistral-7B-Instruct-v0.1** - Efficient and capable
- **NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO** - Excellent reasoning

## 💰 Pricing Benefits

- **Competitive rates**: Often 2-10x cheaper than OpenAI
- **Free tier**: Generous free usage for testing
- **No rate limit surprises**: Clear, predictable pricing
- **Open source models**: Access to latest research models

## 🔧 Configuration Options

You can customize the models in your `.env.local`:

```bash
# Custom model configuration
TOGETHER_EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
TOGETHER_CHAT_MODEL=meta-llama/Llama-2-13b-chat-hf
```

## 🏃‍♂️ Quick Start Commands

1. **Enable Together AI** (disable other providers):
```bash
# Set in .env.local
USE_TOGETHER=true
USE_OPENAI=false
USE_OLLAMA=false
USE_FASTCHAT=false
USE_VLLM=false
```

2. **Test connectivity**:
```bash
node test-together-api.js
```

3. **Start your application**:
```bash
npm run dev
```

## 🔄 Provider Priority

The application checks providers in this order:
1. Ollama (if USE_OLLAMA=true)
2. FastChat (if USE_FASTCHAT=true)
3. OpenAI (if USE_OPENAI=true)
4. vLLM (if USE_VLLM=true)
5. **Together AI (if USE_TOGETHER=true)**
6. Google AI (fallback)

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**:
   - Verify your API key is correct
   - Make sure it starts with the right prefix
   - Check you have sufficient credits

2. **Model Not Found**:
   - Use the exact model name from Together AI docs
   - Some models may require special access

3. **Rate Limits**:
   - Together AI has generous limits
   - Check your usage dashboard
   - Consider upgrading your plan

### Test Results Analysis

✅ **All tests pass**: Together AI is ready to use!
❌ **API Key issues**: Check your Together AI API key
❌ **Network errors**: Check your internet connection
❌ **Model errors**: Try different model names

## 📈 Performance Comparison

| Provider | Setup Difficulty | Rate Limits | Cost | Quality |
|----------|------------------|-------------|------|---------|
| Google AI | Easy | Very strict | Free tier | High |
| OpenAI | Easy | Moderate | $$$ | High |
| **Together AI** | **Easy** | **Generous** | **$** | **High** |
| Ollama | Hard | None | Free | Variable |
| vLLM | Very Hard | None | Free | Variable |

## 🎯 Why Choose Together AI?

1. **Reliability**: Hosted models, no local setup needed
2. **Scale**: Handles production workloads
3. **Cost-effective**: Much cheaper than proprietary APIs
4. **Latest models**: Access to cutting-edge open source models
5. **Good documentation**: Clear API docs and examples
6. **No vendor lock-in**: Standard OpenAI-compatible API

## 📚 Next Steps

1. Set up your Together AI account
2. Add your API key to `.env.local`
3. Run the test script
4. Enable Together AI in your configuration
5. Upload documents and start chatting!

---

**Need help?** Check the [Together AI documentation](https://docs.together.ai/) or our troubleshooting section above.
