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
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

async function handleGet(req, res) {
  try {
    console.log('📋 Fetching visits...');
    
    const result = await client.query(`
      SELECT v.id, v.patient_id as "patientId", v.visit_date as "visitDate", 
             v.visit_type as "visitType", v.symptoms, v.diagnosis, v.treatment, 
             v.notes, v.created_at as "createdAt",
             p.name as "patientName", p.surname as "patientSurname"
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      ORDER BY v.visit_date DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} visits`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
}

async function handlePost(req, res) {
  try {
    console.log('📝 Creating visit:', req.body);
    
    const { patientId, visitDate, visitType, symptoms, diagnosis, treatment, notes } = req.body;
    
    if (!patientId || !visitDate) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Patient ID and visit date are required' 
      });
    }

    const result = await client.query(`
      INSERT INTO visits (patient_id, visit_date, visit_type, symptoms, diagnosis, treatment, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, patient_id as "patientId", visit_date as "visitDate", 
                visit_type as "visitType", symptoms, diagnosis, treatment, notes, 
                created_at as "createdAt"
    `, [
      patientId,
      new Date(visitDate),
      visitType || null,
      symptoms || null,
      diagnosis || null,
      treatment || null,
      notes || null
    ]);

    const visit = result.rows[0];
    console.log('✅ Visit created:', visit.id);
    
    res.status(201).json({
      ...visit,
      message: "Visit created successfully"
    });
  } catch (error) {
    console.error('❌ Create visit error:', error);
    res.status(500).json({ 
      error: 'Failed to create visit',
      message: error.message 
    });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    const visitId = parseInt(id);
    
    if (isNaN(visitId)) {
      return res.status(400).json({ error: 'Invalid visit ID' });
    }
    
    await client.query('DELETE FROM visits WHERE id = $1', [visitId]);
    res.json({ success: true, message: 'Visit deleted successfully' });
  } catch (error) {
    console.error('❌ Delete visit error:', error);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
} 