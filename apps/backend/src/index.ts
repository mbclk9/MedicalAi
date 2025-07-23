import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes/index.js";
import { pool } from "@repo/db";

// ... (validateEnvironment, testDbConnection gibi diğer yardımcı fonksiyonlarınız burada kalabilir) ...

const app = express();

// --- NİHAİ VE EN GÜÇLÜ CORS ÇÖZÜMÜ ---
// Bu middleware, Vercel'in tüm katmanlarından önce çalışarak CORS başlıklarını ekler.
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Tarayıcının 'preflight' (OPTIONS) isteğine hemen yanıt ver ve devam etme.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});


// Rotaları kaydet
registerRoutes(app);


// Hata yönetimi
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Hata:', err);
  res.status(err.status || 500).json({ message: err.message || "Sunucu Hatası" });
});


// Vercel için handler export'u
export default app;