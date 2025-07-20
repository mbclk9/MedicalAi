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
  const visitId = parseInt(id as string);

  if (isNaN(visitId)) {
    return res.status(400).json({ error: 'Invalid visit ID' });
  }

  try {
    await ensureConnection();

    switch (req.method) {
      case 'GET':
        return handleGet(req, res, visitId);
      case 'DELETE':
        return handleDelete(req, res, visitId);
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

async function handleGet(req: any, res: any, visitId: number) {
  try {
    console.log(`📋 Fetching visit ${visitId}...`);
    
    const result = await client.query(`
      SELECT v.id, v.patient_id as "patientId", v.doctor_id as "doctorId", 
             v.template_id as "templateId", v.visit_date as "visitDate",
             v.visit_type as "visitType", v.duration, v.status, v.created_at as "createdAt",
             p.name as patient_name, p.surname as patient_surname,
             p.tc_kimlik as patient_tc, p.birth_date as patient_birth_date,
             p.gender as patient_gender, p.phone as patient_phone,
             t.name as template_name, t.specialty as template_specialty
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      LEFT JOIN medical_templates t ON v.template_id = t.id
      WHERE v.id = $1
    `, [visitId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const row = result.rows[0];
    const visit = {
      id: row.id,
      patientId: row.patientId,
      doctorId: row.doctorId,
      templateId: row.templateId,
      visitDate: row.visitDate,
      visitType: row.visitType,
      duration: row.duration,
      status: row.status,
      createdAt: row.createdAt,
      patient: {
        id: row.patientId,
        name: row.patient_name,
        surname: row.patient_surname,
        tcKimlik: row.patient_tc,
        birthDate: row.patient_birth_date,
        gender: row.patient_gender,
        phone: row.patient_phone
      },
      template: row.templateId ? {
        id: row.templateId,
        name: row.template_name,
        specialty: row.template_specialty
      } : null
    };
    
    console.log(`✅ Found visit ${visitId}`);
    res.json(visit);
  } catch (error: any) {
    console.error(`❌ Get visit ${visitId} error:`, error);
    res.status(500).json({ error: 'Failed to fetch visit' });
  }
}

async function handleDelete(req: any, res: any, visitId: number) {
  try {
    console.log(`🗑️ Deleting visit ${visitId}...`);
    
    const result = await client.query('DELETE FROM visits WHERE id = $1', [visitId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    console.log(`✅ Visit ${visitId} deleted`);
    res.json({ success: true, message: 'Visit deleted successfully' });
  } catch (error: any) {
    console.error(`❌ Delete visit ${visitId} error:`, error);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
} 