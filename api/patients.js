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

// Initialize database tables if not exists
async function initializeDatabase() {
  try {
    // Create patients table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        tc_kimlik TEXT,
        birth_date TIMESTAMP,
        gender TEXT,
        sgk_number TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Patients table ready');
  } catch (error) {
    console.error('❌ Table initialization error:', error);
  }
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();
    await initializeDatabase();

    // Parse URL path for ID
    const urlPath = req.url.split('?')[0];
    const pathParts = urlPath.split('/');
    const id = pathParts[pathParts.length - 1];
    
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'DELETE':
        if (id && !isNaN(parseInt(id))) {
          return handleDelete(req, res, parseInt(id));
        }
        res.status(400).json({ error: 'Invalid patient ID' });
        break;
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
    console.log('📋 Fetching patients...');
    
    const result = await client.query(`
      SELECT id, name, surname, tc_kimlik as "tcKimlik", birth_date as "birthDate", 
             gender, sgk_number as "sgkNumber", phone, email, address, 
             created_at as "createdAt"
      FROM patients 
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} patients`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
}

async function handlePost(req, res) {
  try {
    console.log('📝 Creating patient with body:', req.body);
    
    const { name, surname, tcKimlik, birthDate, gender, sgkNumber, phone, email, address } = req.body;
    
    if (!name || !surname) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name and surname are required',
        received: { name: !!name, surname: !!surname }
      });
    }

    // Clean and validate data
    const patientData = {
      name: name.trim(),
      surname: surname.trim(),
      tcKimlik: tcKimlik || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender || null,
      sgkNumber: sgkNumber || null,
      phone: phone || null,
      email: email || null,
      address: address || null
    };

    console.log('💾 Inserting patient data:', patientData);

    const result = await client.query(`
      INSERT INTO patients (name, surname, tc_kimlik, birth_date, gender, sgk_number, phone, email, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, surname, tc_kimlik as "tcKimlik", birth_date as "birthDate", 
                gender, sgk_number as "sgkNumber", phone, email, address, 
                created_at as "createdAt"
    `, [
      patientData.name,
      patientData.surname,
      patientData.tcKimlik,
      patientData.birthDate,
      patientData.gender,
      patientData.sgkNumber,
      patientData.phone,
      patientData.email,
      patientData.address
    ]);

    const patient = result.rows[0];
    console.log('✅ Patient created:', patient.id, patient.name, patient.surname);
    
    res.status(201).json({
      ...patient,
      message: "Patient created successfully"
    });
  } catch (error) {
    console.error('❌ Create patient error:', error);
    res.status(500).json({ 
      error: 'Failed to create patient',
      message: error.message,
      details: error.detail || undefined
    });
  }
}

async function handleDelete(req, res, patientId) {
  try {
    console.log('🗑️ Deleting patient:', patientId);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    // Check if patient exists
    const checkResult = await client.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    await client.query('DELETE FROM patients WHERE id = $1', [patientId]);
    console.log('✅ Patient deleted:', patientId);
    
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('❌ Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
}