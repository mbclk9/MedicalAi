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
    console.log('📝 Creating patient:', req.body);
    
    const { name, surname, tcKimlik, birthDate, gender, sgkNumber, phone, email, address } = req.body;
    
    if (!name || !surname) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name and surname are required' 
      });
    }

    // Transform data for database
    const patientData = {
      name: name.trim(),
      surname: surname.trim(),
      tcKimlik: tcKimlik || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender: gender ? gender.toLowerCase() : null,
      sgkNumber: sgkNumber || null,
      phone: phone || null,
      email: email || null,
      address: address || null
    };

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
    console.log('✅ Patient created:', patient.id);
    
    res.status(201).json({
      ...patient,
      message: "Patient created successfully"
    });
  } catch (error) {
    console.error('❌ Create patient error:', error);
    res.status(500).json({ 
      error: 'Failed to create patient',
      message: error.message 
    });
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;
    const patientId = parseInt(id);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }
    
    await client.query('DELETE FROM patients WHERE id = $1', [patientId]);
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('❌ Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
} 