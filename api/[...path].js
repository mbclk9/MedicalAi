// Vercel Serverless Function for Backend API
const path = require('path');

// Import the backend application
let app;

try {
  // Try to import the built backend
  app = require('../apps/backend/dist/index.js');
} catch (error) {
  console.error('Failed to import backend:', error);
  
  // Fallback: try to run the backend directly
  try {
    app = require('../apps/backend/index.ts');
  } catch (fallbackError) {
    console.error('Fallback import failed:', fallbackError);
    throw new Error('Unable to load backend application');
  }
}

// Export the Vercel serverless function
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Forward the request to the backend app
    if (app && typeof app === 'function') {
      return app(req, res);
    } else if (app && app.default && typeof app.default === 'function') {
      return app.default(req, res);
    } else {
      throw new Error('Backend app is not a valid Express application');
    }
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}; 