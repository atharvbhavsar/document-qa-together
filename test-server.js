/**
 * This is a simple Express server to test our OCR functionality
 * when Next.js is having issues starting up.
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import our document processor OCR class
// We need to use dynamic import since it's an ES module
async function getDocumentProcessorOCR() {
  try {
    const { DocumentProcessorOCR } = await import('./lib/document-processor-ocr.js');
    return DocumentProcessorOCR;
  } catch (error) {
    console.error('Failed to import DocumentProcessorOCR:', error);
    return null;
  }
}

const app = express();
const port = 3001;

// Set up logging to a file
const logFile = path.join(__dirname, 'server-log.txt');
// Clear the log file on startup
fs.writeFileSync(logFile, `Server started at ${new Date().toISOString()}\n`);

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message); // Also log to console
}

// Clear the log file on startup
fs.writeFileSync(logFile, `Server started at ${new Date().toISOString()}\n`);

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(os.tmpdir(), 'ocr-uploads');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    logToFile(`Setting upload destination to: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    logToFile(`Setting filename to: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Simple endpoint to test if the server is running
app.get('/', (req, res) => {
  logToFile('GET / request received');
  res.send('OCR test server is running');
});

// Upload endpoint
app.post('/api/upload', (req, res) => {
  console.log('==== UPLOAD REQUEST RECEIVED ====');
  
  upload.single('file')(req, res, async function(err) {
    if (err) {
      console.error(`Error handling file upload: ${err.message}`);
      return res.status(500).json({ error: 'File upload failed: ' + err.message });
    }
    
    try {
      if (!req.file) {
        console.error('No file found in request');
        return res.status(400).json({ error: 'No file provided' });
      }
      
      console.log(`Received file: ${req.file.originalname} (${req.file.mimetype})`);
      console.log(`File size: ${req.file.size} bytes`);
      console.log(`Stored at: ${req.file.path}`);
      
      // Process the file with real OCR if possible
      let text = '';
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        
        // Try to use our OCR processor
        const DocumentProcessorOCR = await getDocumentProcessorOCR();
        
        if (DocumentProcessorOCR) {
          console.log('Using real OCR processor');
          const processor = new DocumentProcessorOCR();
          await processor.initialize();
          
          console.log('OCR processor initialized, processing document...');
          text = await processor.processDocument(fileBuffer, req.file.mimetype, req.file.originalname);
          await processor.terminate();
          
          console.log(`OCR processing complete. Extracted ${text.length} characters.`);
        } else {
          console.log('Real OCR processor not available, using simulated text');
          // Fallback to simulated text
          text = `This is simulated OCR text from ${req.file.originalname}. 
In a real implementation, we would process the file using our OCR code.`;
        }
      } catch (ocrError) {
        console.error(`Error using OCR processor: ${ocrError.message}`);
        console.error(ocrError.stack);
        // Fallback to simulated text
        text = `This is simulated OCR text from ${req.file.originalname}. 
Error processing with OCR: ${ocrError.message}`;
      }
      
      // Send a success response
      const response = {
        message: 'Document uploaded and processed successfully',
        filename: req.file.originalname,
        textLength: text.length,
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        textContent: text // Include the full text for testing purposes
      };
      
      console.log(`Sending response: ${JSON.stringify({
        message: response.message,
        filename: response.filename,
        textLength: response.textLength,
        preview: response.preview
      })}`);
      
      res.json(response);
      
    } catch (error) {
      console.error(`Error processing file: ${error.message}`);
      console.error(error.stack);
      res.status(500).json({ error: 'Failed to process file' });
    }
  });
});

// Start the server
app.listen(port, () => {
  logToFile(`OCR test server running at http://localhost:${port}`);
  console.log(`OCR test server running at http://localhost:${port}`);
});

// Start the server
app.listen(port, () => {
  console.log(`OCR test server running at http://localhost:${port}`);
});
