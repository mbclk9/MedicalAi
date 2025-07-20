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

  const { id } = req.query;
  const patientId = parseInt(id as string);

  if (isNaN(patientId)) {
    return res.status(400).json({ error: 'Invalid patient ID' });
  }

  try {
    await ensureConnection();

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, patientId);
      case 'DELETE':
        return handleDelete(req, res, patientId);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function handleGet(req: any, res: any, patientId: number) {
  try {
    console.log(`📋 Fetching patient ${patientId}...`);
    
    const result = await client.query(`
      SELECT id, name, surname, tc_kimlik as "tcKimlik", birth_date as "birthDate", 
             gender, sgk_number as "sgkNumber", phone, email, address, 
             created_at as "createdAt"
      FROM patients 
      WHERE id = $1
    `, [patientId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log(`✅ Found patient ${patientId}`);
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error(`❌ Get patient ${patientId} error:`, error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
}

async function handleDelete(req: any, res: any, patientId: number) {
  try {
    console.log(`🗑️ Deleting patient ${patientId}...`);
    
    const result = await client.query('DELETE FROM patients WHERE id = $1', [patientId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    console.log(`✅ Patient ${patientId} deleted`);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error: any) {
    console.error(`❌ Delete patient ${patientId} error:`, error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
} 