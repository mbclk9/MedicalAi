// api/index.js - Vercel Serverless Function Entry Point

const path = require('path');

async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Dynamic import backend app (ESM uyumluluğu için)
    const { default: app } = await import('../apps/backend/dist/index.js');
    
    // Express app'i serverless function olarak çalıştır
    return app(req, res);
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    res.status(500).json({
      error: 'API initialization failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.url
    });
  }
}

module.exports = handler;