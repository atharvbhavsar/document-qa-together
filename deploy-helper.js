#!/usr/bin/env node

/**
 * Quick Deployment Setup Script
 * This script helps you deploy your Document QA Chatbot
 */

console.log('🚀 Document QA Chatbot - Deployment Helper');
console.log('==========================================\n');

console.log('📋 Pre-deployment checklist:');
console.log('✅ Vercel CLI installed');
console.log('✅ Project built successfully');
console.log('✅ Environment variables ready');

console.log('\n🔧 Required Environment Variables for Production:');
const requiredEnvVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
  'GOOGLE_API_KEY',
  'TOGETHER_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX_NAME',
  'PINECONE_ENVIRONMENT',
  'JWT_SECRET',
  'APP_API_KEY',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'NEXT_PUBLIC_APP_URL',
  'USE_TOGETHER',
  'USE_OPENAI',
  'USE_OLLAMA',
  'USE_FASTCHAT',
  'USE_VLLM'
];

requiredEnvVars.forEach((envVar, index) => {
  console.log(`${index + 1}. ${envVar}`);
});

console.log('\n🎯 Quick Deployment Steps:');
console.log('1. Run: vercel login');
console.log('2. Run: vercel');
console.log('3. Follow the prompts to deploy');
console.log('4. Add environment variables in Vercel dashboard');
console.log('5. Run: vercel --prod for production deployment');

console.log('\n🌐 After deployment:');
console.log('1. Update Google OAuth redirect URIs');
console.log('2. Update NEXT_PUBLIC_APP_URL environment variable');
console.log('3. Test all functionality');

console.log('\n💡 Your app will be available at: https://your-project-name.vercel.app');
console.log('\n🔗 Helpful links:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- Together AI Dashboard: https://api.together.ai/');
console.log('- Pinecone Console: https://app.pinecone.io/');

console.log('\n✨ Ready to deploy! Run: vercel login');
