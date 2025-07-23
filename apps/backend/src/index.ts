import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes/index.js"; // .js uzantısı ESM modülleri için önemlidir
import { pool } from "@repo/db";

// ==============================================================================
// FONKSİYONLAR (Değişiklik yok, olduğu gibi kalabilir)
// ==============================================================================

function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL'];
  console.log("🔧 Ortam değişkenleri doğrulanıyor...");
  const missingRequired = requiredEnvVars.filter(env => !process.env[env]);
  if (missingRequired.length > 0) {
    const errorMessage = `❌ Gerekli ortam değişkenleri eksik: ${missingRequired.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  console.log("✅ Ortam değişkenleri doğrulandı.");
}

async function testDbConnection() {
  try {
    console.log("🔗 Veritabanına bağlanılıyor...");
    const client = await pool.connect();
    console.log("✅ Veritabanı istemcisi bağlandı.");
    await client.query('SELECT 1');
    client.release();
    console.log("✅ Veritabanı bağlantısı başarılı.");
  } catch (err: any) {
    console.error("❌ Veritabanı bağlantısı başarısız:", err.message);
    throw err;
  }
}

async function closeDbConnection() {
    try {
        console.log("🔌 Veritabanı bağlantısı kapatılıyor...");
        await pool.end();
        console.log("✅ Veritabanı bağlantısı kapatıldı.");
    } catch (error) {
        console.error("❌ Veritabanı bağlantısı kapatılırken hata:", error);
    }
}

// ==============================================================================
// EXPRESS UYGULAMASI VE CORS YAPILANDIRMASI (TÜM DEĞİŞİKLİKLER BURADA)
// ==============================================================================

const app = express();

// --- NİHAİ CORS YAPILANDIRMASI ---
const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  console.warn("⚠️  FRONTEND_URL ortam değişkeni tanımlanmamış. Production'da CORS sorunları yaşanabilir.");
}

// İzin verilecek adresleri tanımla. filter(Boolean) ile null/undefined değerler listeden çıkarılır.
const allowedOrigins = [frontendUrl, "http://localhost:3000"].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Cookie gibi bilgilerin gönderilmesine izin ver
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

console.log("✅ CORS için izin verilen adresler:", allowedOrigins);

// Hem ana istekler hem de 'preflight' (OPTIONS) istekleri için aynı CORS yapılandırmasını kullan.
app.use(cors(corsOptions));
// --- CORS YAPILANDIRMASI SONU ---


// Diğer middleware'ler
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ==============================================================================
// UYGULAMA BAŞLATMA VE EXPORT (Değişiklik yok)
// ==============================================================================

async function initializeApp() {
  try {
    validateEnvironment();
    await testDbConnection();
    registerRoutes(app);
    
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Hata:', err);
      res.status(err.status || 500).json({ message: err.message || "Sunucu Hatası" });
    });

    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK' });
    });

    console.log("✅ Uygulama başarıyla başlatıldı.");
    return app;
  } catch (error) {
    console.error("❌ Uygulama başlatılamadı:", error);
    throw error;
  }
}

// Vercel için uygulama export'u
let initializedApp: any = null;
async function getApp() {
  if (!initializedApp) {
    initializedApp = await initializeApp();
  }
  return initializedApp;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error: any) {
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
}