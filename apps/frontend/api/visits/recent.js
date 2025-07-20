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
    
    console.log('📋 Fetching recent visits...');
    
    const limit = parseInt(req.query.limit || '10');
    
    const result = await client.query(`
      SELECT v.id, v.patient_id as "patientId", v.doctor_id as "doctorId", 
             v.template_id as "templateId", v.visit_date as "visitDate",
             v.visit_type as "visitType", v.duration, v.status, v.created_at as "createdAt",
             p.name as patient_name, p.surname as patient_surname
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      ORDER BY v.created_at DESC
      LIMIT $1
    `, [limit]);
    
    const visits = result.rows.map(row => ({
      ...row,
      patient: {
        id: row.patientId,
        name: row.patient_name,
        surname: row.patient_surname
      }
    }));
    
    console.log(`✅ Found ${visits.length} recent visits`);
    res.json(visits);
  } catch (error: any) {
    console.error('❌ Get recent visits error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent visits',
      message: error.message 
    });
  }
} 