module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: process.env.NODE_ENV || 'development',
    database: !!process.env.DATABASE_URL
  });
}; 