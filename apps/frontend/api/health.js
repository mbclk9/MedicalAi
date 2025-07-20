export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: {
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown'
    },
    database: {
      configured: !!process.env.DATABASE_URL,
      provider: 'Neon PostgreSQL'
    },
    endpoints: [
      'GET /api/health',
      'GET /api/doctor',
      'GET /api/patients',
      'POST /api/patients', 
      'DELETE /api/patients/:id',
      'GET /api/visits',
      'POST /api/visits',
      'DELETE /api/visits/:id',
      'GET /api/visits/recent',
      'GET /api/visits/[id]',
      'GET /api/templates'
    ]
  });
} 