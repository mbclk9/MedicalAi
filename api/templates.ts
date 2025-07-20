import { Client } from 'pg';

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
    await client.connect();
    connected = true;
    console.log('✅ Connected to Neon database');
  }
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await ensureConnection();
    
    console.log('📋 Fetching templates...');
    
    const result = await client.query(`
      SELECT id, name, specialty, description, structure, 
             created_at as "createdAt", updated_at as "updatedAt"
      FROM medical_templates 
      ORDER BY name ASC
    `);
    
    console.log(`✅ Found ${result.rows.length} templates`);
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Get templates error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      message: error.message 
    });
  }
} 