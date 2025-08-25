const { exec } = require('child_process');

// Open the browser to test the Ollama API endpoints
exec('start http://localhost:3000/api/test/ollama-embedding', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error opening browser: ${error.message}`);
    return;
  }
  console.log('Opened browser to test Ollama embedding endpoint');
});

// Wait a few seconds, then open the generation endpoint
setTimeout(() => {
  exec('start http://localhost:3000/api/test/ollama-generation', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening browser: ${error.message}`);
      return;
    }
    console.log('Opened browser to test Ollama generation endpoint');
  });
}, 3000);
