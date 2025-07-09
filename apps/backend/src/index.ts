import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import { client, db } from "@repo/db";

// Veritabanı bağlantısını test etmek için bir fonksiyon
async function testDbConnection() {
  try {
    console.log("🔗 Veritabanına bağlanılıyor...");
    await client.connect();
    console.log("✅ Veritabanı istemcisi başarıyla bağlandı.");
    // Basit bir sorgu çalıştırarak bağlantıyı doğrula
    await db.execute('SELECT 1');
    console.log("✅ Veritabanı test sorgusu başarılı.");
  } catch (err) {
    console.error("❌ Veritabanı bağlantısı başarısız:", err);
    // Vercel'de process.exit kullanmayalım
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Bağlantıyı düzgün bir şekilde kapatmak için fonksiyon
async function closeDbConnection() {
    console.log("🔌 Veritabanı bağlantısı kapatılıyor...");
    await client.end();
    console.log("✅ Veritabanı bağlantısı kapatıldı.");
}

const app = express();

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-vercel-domain.vercel.app"] 
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(`[${new Date().toLocaleTimeString()}] ${logLine}`);
    }
  });

  next();
});

// Initialize app for Vercel
async function initializeApp() {
  try {
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
    return app; // Return app even if initialization fails
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
if (process.env.NODE_ENV === 'production') {
  initializeApp();
}

// Export the app for Vercel serverless functions
export default app;
