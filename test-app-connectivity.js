// Simple app connectivity test
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testAppConnectivity() {
  console.log('Testing application connectivity...');
  console.log(`APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
  
  try {
    // Simple GET request to the application root
    console.log('\nTesting app root URL...');
    try {
      const rootResponse = await fetch(process.env.NEXT_PUBLIC_APP_URL, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`Root URL status: ${rootResponse.status}`);
      console.log(`Root URL response OK: ${rootResponse.ok}`);
    } catch (rootError) {
      console.error('Error connecting to root URL:', rootError.message);
    }
    
    // Try the health API endpoint if available
    console.log('\nTesting health endpoint...');
    try {
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`Health endpoint status: ${healthResponse.status}`);
      console.log(`Health endpoint response OK: ${healthResponse.ok}`);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log('Health response:', healthData);
      }
    } catch (healthError) {
      console.error('Error connecting to health endpoint:', healthError.message);
    }
    
    // Try a simple API endpoint
    console.log('\nTesting documents API endpoint...');
    try {
      const docsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents`, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`Documents endpoint status: ${docsResponse.status}`);
      console.log(`Documents endpoint response OK: ${docsResponse.ok}`);
      
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        console.log(`Documents count: ${docsData.documents ? docsData.documents.length : 0}`);
      }
    } catch (docsError) {
      console.error('Error connecting to documents endpoint:', docsError.message);
    }
    
  } catch (error) {
    console.error('Error testing app connectivity:', error.message);
  }
  
  // Always exit to avoid hanging
  process.exit(0);
}

// Run the test
testAppConnectivity().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
