const { Client } = require('pg');

// Neon database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to database
let connected = false;
async function ensureConnection() {
  if (!connected) {
    try {
      await client.connect();
      connected = true;
      console.log('✅ Connected to Neon database');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();

    if (req.method === 'GET') {
      const result = await client.query(`
        SELECT id, name, content, category, created_at as "createdAt"
        FROM templates 
        ORDER BY created_at DESC
      `);
      
      res.json(result.rows);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}; 