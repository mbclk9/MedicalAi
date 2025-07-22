import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { client, db } from "@repo/db";
import { sql } from "drizzle-orm";
import cors from 'cors'; 

// Environment validation function
function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL'
  ];
  
  const optionalEnvVars = [
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'DEEPGRAM_API_KEY'
  ];
  
  console.log("🔧 Environment validation starting...");
  
  // Check required environment variables
  const missingRequired = requiredEnvVars.filter(env => !process.env[env]);
  if (missingRequired.length > 0) {
    console.error("❌ Missing required environment variables:", missingRequired.join(', '));
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }
  
  // Check optional environment variables
  const missingOptional = optionalEnvVars.filter(env => !process.env[env]);
  if (missingOptional.length > 0) {
    console.warn("⚠️  Missing optional environment variables:", missingOptional.join(', '));
    console.warn("⚠️  Some AI services may not work without these keys");
  }
  
  // API key format validation
  if (process.env.DEEPGRAM_API_KEY && !process.env.DEEPGRAM_API_KEY.startsWith('Token ')) {
    console.warn("⚠️  DEEPGRAM_API_KEY should start with 'Token '");
  }
  
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.warn("⚠️  OPENAI_API_KEY should start with 'sk-'");
  }
  
  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    console.warn("⚠️  ANTHROPIC_API_KEY should start with 'sk-ant-'");
  }
  
  console.log("✅ Environment validation completed");
}

// Veritabanı bağlantısını test etmek için bir fonksiyon
async function testDbConnection() {
  try {
    console.log("🔗 Neon veritabanına bağlanılıyor...");
    
    // Bağlantıyı aç
    await client.connect();
    console.log("✅ Neon veritabanı istemcisi başarıyla bağlandı.");
    
    // Basit bir sorgu çalıştırarak bağlantıyı doğrula
    const result = await client.query('SELECT 1 as test');
    console.log("✅ Neon veritabanı test sorgusu başarılı:", result.rows[0]);
    
    // Bağlantıyı kapatma - uygulama çalışırken açık kalsın
    // await client.end();
    // console.log("✅ Veritabanı bağlantısı kapatıldı.");
  } catch (err: any) {
    console.error("❌ Neon veritabanı bağlantısı başarısız:", err.message);
    throw err; // Hatayı fırlat, uygulama başlamasın
  }
}

// Bağlantıyı düzgün bir şekilde kapatmak için fonksiyon
async function closeDbConnection() {
    try {
        console.log("🔌 Veritabanı bağlantısı kapatılıyor...");
        await client.end();
        console.log("✅ Veritabanı bağlantısı kapatıldı.");
    } catch (error) {
        console.error("❌ Veritabanı bağlantısı kapatılırken hata:", error);
    }
}

const app = express();

// CORS middleware - Vercel için optimize edilmiş
// Frontend'inizin Vercel'deki tam adresini buraya yazın
const frontendURL = 'https://medical-ai-frontend-git-main-mbclk9s-projects.vercel.app';

app.use(cors({
  origin: frontendURL,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.url}`);
  next();
});

// Initialize app for Vercel
async function initializeApp() {
  try {
    // Validate environment first
    validateEnvironment();
    
    // Database bağlantısını test et - başarısız olursa uygulama başlamasın
    await testDbConnection();
    
    await registerRoutes(app);
    
    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    console.log("✅ App initialized successfully");
    return app;
  } catch (error) {
    console.error("❌ App initialization failed:", error);
    throw error; // Hatayı fırlat, uygulama başlamasın
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    await initializeApp();
    
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`🚀 Backend server running on port ${port}`);
      console.log(`📡 API endpoints available at http://localhost:${port}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Alınan sinyal: ${signal}, sunucu kapatılıyor...`);
      server.close(async () => {
        await closeDbConnection();
        console.log('✅ Sunucu başarıyla kapatıldı.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })();
}

// Initialize app for Vercel
let initializedApp: any = null;

async function getApp() {
  if (!initializedApp) {
    initializedApp = await initializeApp();
  }
  return initializedApp;
}

// For Vercel deployment - proper serverless function export
export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    console.error("❌ Handler error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}
