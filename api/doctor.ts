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
    
    console.log('👨‍⚕️ Fetching doctor info...');
    
    // Try to get doctor from database, or return default
    let result;
    try {
      result = await client.query(`
        SELECT id, name, email, title, specialty, license_number as "licenseNumber",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM doctors 
        ORDER BY id ASC 
        LIMIT 1
      `);
    } catch (dbError) {
      console.log('⚠️ No doctors table or data, returning default doctor');
      result = { rows: [] };
    }
    
    // Return first doctor or default doctor
    const doctor = result.rows[0] || {
      id: 1,
      name: "Muhammet Çelik",
      email: "mcelik34@gmail.com", 
      title: "Prof.",
      specialty: "Kardiyoloji",
      licenseNumber: "12345",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Doctor info retrieved:', doctor.name);
    res.json(doctor);
  } catch (error: any) {
    console.error('❌ Get doctor error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch doctor info',
      message: error.message 
    });
  }
} 