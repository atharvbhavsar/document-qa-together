# Google API Key Troubleshooting Guide

## Current Issues

Our application is experiencing two issues with the Google API key:

1. **Embedding Model Error**: `API key expired. Please renew the API key.`
2. **Chat Model Error**: `Quota exceeded for quota metric 'Generate Content API requests per minute'` with a quota limit value of 0.

## Steps to Fix

### 1. Create a New API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click on "Create API Key"
3. Copy the new API key and update your `.env.local` file with the new key

### 2. Check and Request Quota Increases

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project → APIs & Services → Quotas & System Limits
3. Filter for "generativelanguage.googleapis.com"
4. Check your current quota limits
5. Request quota increases for:
   - Generate Content API requests per minute
   - Embedding API requests per minute

### 3. Enable Required APIs

Ensure the following APIs are enabled in your Google Cloud project:
- Gemini API
- Vertex AI API (if using embeddings)

### 4. Testing Your New Setup

After updating your API key and requesting quota increases:

1. Run the test scripts to verify your API key is working:
   ```
   node test-embedding.js
   ```

2. Check for the specific region with the best quota:
   ```
   node test-regions.js
   ```

### 5. Paid Tier Considerations

If you continue to face quota limits:
- Consider upgrading to a paid tier in Google Cloud
- This will automatically increase your quota limits
- Visit [Google AI Pricing](https://cloud.google.com/vertex-ai/pricing) for more details

## Additional Resources

- [Google Cloud Quotas Documentation](https://cloud.google.com/docs/quotas)
- [Request Quota Increases](https://cloud.google.com/docs/quotas/help/request_increase)
- [Gemini API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Embeddings API Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/embeddings/get-text-embeddings)
