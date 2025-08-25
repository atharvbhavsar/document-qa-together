# 🚀 Complete Deployment Guide

## 🎯 Recommended Platform: **Vercel** (Best for Next.js)

### Why Vercel?
- ✅ Built specifically for Next.js
- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Environment variables support
- ✅ Free tier available

---

## 📋 Pre-Deployment Checklist

### 1. Clean Build Test
```bash
# Remove any build artifacts
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Fresh install and build
npm install
npm run build
```

### 2. Environment Variables Preparation
Create a list of all required environment variables:

```bash
# Required for Production
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
GOOGLE_API_KEY=your_google_api_key
TOGETHER_API_KEY=your_together_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=document-qa-together
PINECONE_ENVIRONMENT=gcp-starter
JWT_SECRET=your_jwt_secret
APP_API_KEY=your_app_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
USE_TOGETHER=true
USE_OPENAI=false
USE_OLLAMA=false
USE_FASTCHAT=false
USE_VLLM=false
```

---

## 🚀 Option 1: Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Directory
```bash
# Navigate to your project
cd "d:\project product space\3 DAYS HACKATHON (3)\3 DAYS HACKATHON\document-qa-chatbot"

# Deploy
vercel
```

### Step 4: Configure Environment Variables
```bash
# Set each environment variable
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add TOGETHER_API_KEY
vercel env add PINECONE_API_KEY
# ... add all others
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## 🌐 Option 2: Vercel Dashboard (GUI Method)

### Step 1: Prepare Your Code
```bash
# Create a GitHub repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/document-qa-chatbot.git
git push -u origin main
```

### Step 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all your environment variables
3. Set them for Production, Preview, and Development

---

## ☁️ Option 3: Azure Static Web Apps

### Step 1: Install Azure CLI
```bash
# Install Azure CLI
winget install Microsoft.AzureCLI
```

### Step 2: Login and Create Resource
```bash
az login
az staticwebapp create \
  --name document-qa-chatbot \
  --resource-group your-resource-group \
  --source https://github.com/yourusername/document-qa-chatbot \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --api-location "api" \
  --output-location ".next"
```

---

## 🐳 Option 4: Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Build and Deploy
```bash
# Build image
docker build -t document-qa-chatbot .

# Run locally to test
docker run -p 3000:3000 --env-file .env.local document-qa-chatbot

# Deploy to any cloud provider (AWS, Azure, GCP)
```

---

## 🔧 Required Configuration Updates

### 1. Update Google OAuth
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Navigate to APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add authorized redirect URIs:
  ```
  https://your-domain.vercel.app/auth/callback
  https://your-domain.com/auth/callback
  ```

### 2. Update CORS Settings
```typescript
// In your API routes, ensure CORS is configured
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### 3. Update Environment URLs
Make sure all URLs in your `.env` point to production:
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
```

---

## 🧪 Testing Your Deployment

### 1. Functionality Checklist
- [ ] Homepage loads
- [ ] Google Drive authentication works
- [ ] File upload works
- [ ] Chat responses work with Together AI
- [ ] Vector search works with Pinecone
- [ ] Document processing works
- [ ] Export functionality works

### 2. API Endpoints Test
```bash
# Test API health
curl https://your-domain.vercel.app/api/health

# Test authentication
curl https://your-domain.vercel.app/api/auth/status
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Failures
```bash
# Solution: Clean install
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

### Issue 2: Environment Variables Not Working
- Ensure no spaces around `=` in environment variables
- Restart deployment after adding new variables
- Check variable names match exactly

### Issue 3: Google OAuth Errors
- Verify redirect URIs in Google Console
- Ensure HTTPS is used in production
- Check client ID and secret are correct

### Issue 4: File Upload Limits
```javascript
// Increase body size limit in next.config.js
module.exports = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}
```

---

## 📊 Performance Optimization

### 1. Image Optimization
```bash
npm install next-optimized-images
```

### 2. Bundle Analysis
```bash
npm install @next/bundle-analyzer
ANALYZE=true npm run build
```

### 3. Caching Strategy
```javascript
// Add to next.config.js
module.exports = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 's-maxage=1, stale-while-revalidate' },
      ],
    },
  ],
}
```

---

## 💰 Cost Estimation

### Vercel (Recommended)
- **Free Tier**: 100GB bandwidth, 1000 serverless function invocations
- **Pro Tier**: $20/month - Unlimited bandwidth, 1M function invocations

### Azure Static Web Apps
- **Free Tier**: 250MB storage, 100GB bandwidth
- **Standard Tier**: $9/month per app

### Together AI Costs
- **Embeddings**: ~$0.0001 per 1K tokens
- **Chat**: ~$0.0008 per 1K tokens

### Pinecone Costs
- **Starter**: Free up to 1M vectors
- **Standard**: $70/month for 5M vectors

---

## 🎯 Quick Start (5 Minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to project
cd "d:\project product space\3 DAYS HACKATHON (3)\3 DAYS HACKATHON\document-qa-chatbot"

# 4. Deploy
vercel

# 5. Add environment variables (follow prompts)
vercel env add TOGETHER_API_KEY
vercel env add PINECONE_API_KEY
vercel env add GOOGLE_CLIENT_SECRET

# 6. Deploy to production
vercel --prod
```

Your app will be live at: `https://your-project-name.vercel.app`

---

## 📞 Support & Monitoring

### 1. Error Monitoring
- Use Vercel's built-in analytics
- Add Sentry for error tracking
- Monitor API usage in Together AI dashboard

### 2. Performance Monitoring
- Vercel Analytics
- Google PageSpeed Insights
- Core Web Vitals

### 3. Logs
```bash
# View deployment logs
vercel logs your-deployment-url
```

**Ready to deploy? Let's start with Vercel!** 🚀
