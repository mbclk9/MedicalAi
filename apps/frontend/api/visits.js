import { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'DELETE':
        return handleDelete(req, res);
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('📋 Fetching visits...');
    
    const result = await client.query(`
      SELECT v.id, v.patient_id as "patientId", v.doctor_id as "doctorId", 
             v.template_id as "templateId", v.visit_date as "visitDate",
             v.visit_type as "visitType", v.duration, v.status, v.created_at as "createdAt",
             p.name as patient_name, p.surname as patient_surname
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      ORDER BY v.created_at DESC
      LIMIT 50
    `);
    
    const visits = result.rows.map(row => ({
      ...row,
      patient: {
        id: row.patientId,
        name: row.patient_name,
        surname: row.patient_surname
      }
    }));
    
    console.log(`✅ Found ${visits.length} visits`);
    res.json(visits);
  } catch (error: any) {
    console.error('❌ Get visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('📝 Creating visit:', req.body);
    
    const { patientId, doctorId, templateId, visitType } = req.body;
    
    if (!patientId || !doctorId || !visitType) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'PatientId, doctorId and visitType are required' 
      });
    }

    const result = await client.query(`
      INSERT INTO visits (patient_id, doctor_id, template_id, visit_type, status)
      VALUES ($1, $2, $3, $4, 'in_progress')
      RETURNING id, patient_id as "patientId", doctor_id as "doctorId", 
                template_id as "templateId", visit_date as "visitDate",
                visit_type as "visitType", duration, status, created_at as "createdAt"
    `, [patientId, doctorId, templateId || null, visitType]);

    const visit = result.rows[0];
    console.log('✅ Visit created:', visit.id);
    
    res.status(201).json({
      ...visit,
      message: "Visit created successfully"
    });
  } catch (error: any) {
    console.error('❌ Create visit error:', error);
    res.status(500).json({ 
      error: 'Failed to create visit',
      message: error.message 
    });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const visitId = parseInt(id as string);
    
    if (isNaN(visitId)) {
      return res.status(400).json({ error: 'Invalid visit ID' });
    }
    
    await client.query('DELETE FROM visits WHERE id = $1', [visitId]);
    res.json({ success: true, message: 'Visit deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete visit error:', error);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
} 