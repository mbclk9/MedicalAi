// Vercel serverless function entry point for TıpScribe API
const path = require('path');

try {
  // Import the built backend application
  const app = require('../apps/backend/dist/index.js');
  
  // Export the Express app for Vercel serverless functions
  module.exports = app.default || app;
  
  console.log('✅ TıpScribe API loaded successfully for Vercel');
} catch (error) {
  console.error('❌ Failed to load TıpScribe API:', error);
  
  // Fallback handler for errors
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'API initialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  };
} 