# Production Deployment Checklist

## ✅ What Will Work in Production

### AI Services (Cloud-based)
- **Together AI** ✅ (Currently active: `USE_TOGETHER=true`)
- **OpenAI API** ✅ (Available: `USE_OPENAI=false` - can enable)
- **Google AI (Gemini)** ✅ (Available with Google API key)

### Database & Storage
- **Pinecone Vector Database** ✅ (Cloud-hosted)
- **Google Drive Integration** ✅ (OAuth configured)

### Application Features
- Document upload and processing ✅
- PDF, DOCX, TXT file support ✅
- OCR capabilities ✅
- Chat interface ✅
- Export functionality ✅

## ❌ What Won't Work in Production

### Local AI Services
- **Ollama** ❌ (localhost:11434 - local only)
- **FastChat** ❌ (localhost:8001 - local only)
- **vLLM** ❌ (localhost:8000 - local only)

## 🔧 Required Production Changes

### 1. Environment Variables
Create `.env.production` or configure in your hosting platform:

```bash
# Update URLs for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback

# Keep cloud services (these will work)
TOGETHER_API_KEY=your_key
PINECONE_API_KEY=your_key
GOOGLE_API_KEY=your_key
OPENAI_API_KEY=your_key

# Disable local services
USE_OLLAMA=false
USE_FASTCHAT=false
USE_VLLM=false
USE_TOGETHER=true
```

### 2. Google OAuth Setup
- Add your production domain to Google Console
- Update redirect URIs: `https://your-domain.com/auth/callback`

### 3. Security
- Use environment variables in hosting platform
- Don't commit API keys to git
- Set up proper CORS policies

## 🚀 Recommended Deployment Platforms

### Option 1: Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel --prod
```

### Option 2: Azure Static Web Apps + Container Apps
- Static frontend on Azure SWA
- API routes on Azure Container Apps
- Integrated with Azure services

### Option 3: Netlify
```bash
npm run build
# Deploy dist folder
```

## 📊 Performance Expectations

### What Will Be Fast
- Together AI responses (good rate limits)
- Pinecone vector searches (cloud-optimized)
- Google Drive file operations

### What Might Be Slower
- Large file uploads (depend on hosting limits)
- OCR processing (CPU intensive)

## 🔍 Testing Production Setup

1. **Test AI Services**:
   ```bash
   # Test Together AI
   curl -X POST https://api.together.ai/v1/chat/completions \
     -H "Authorization: Bearer YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"meta-llama/Llama-2-7b-chat-hf","messages":[{"role":"user","content":"Hello"}]}'
   ```

2. **Test Pinecone**:
   ```bash
   # Test vector database connection
   curl -X GET https://your-index.pinecone.io/describe_index_stats \
     -H "Api-Key: YOUR_PINECONE_KEY"
   ```

3. **Test Google Drive**:
   - Verify OAuth flow works with production URLs
   - Test file listing and upload

## 💡 Optimization Tips

1. **Use Together AI** - Best balance of performance and cost
2. **Implement caching** for vector searches
3. **Optimize bundle size** - remove unused dependencies
4. **Set up monitoring** - track API usage and errors
5. **Configure rate limiting** - protect against abuse

## 🚨 Common Issues

1. **CORS errors** - Configure allowed origins
2. **API key exposure** - Use environment variables only
3. **File size limits** - Check hosting platform limits
4. **Timeout errors** - Set appropriate timeouts for AI APIs

## 📋 Final Verification

Before going live:
- [ ] All API keys working in production environment
- [ ] Google OAuth redirect URIs updated
- [ ] File upload/download working
- [ ] Chat responses working with Together AI
- [ ] Vector search working with Pinecone
- [ ] Email export functionality working
- [ ] Error handling and user feedback working
