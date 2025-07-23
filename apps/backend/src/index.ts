import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes/index.js";
import { pool } from "@repo/db";

// Diğer yardımcı fonksiyonlarınız (validateEnvironment, testDbConnection vb.) burada kalabilir
// ...

const app = express();

// ==============================================================================
// NİHAİ VE EN GÜÇLÜ CORS ÇÖZÜMÜ
// Bu middleware, gelen her isteği en başta yakalar ve gerekli izinleri verir.
// ==============================================================================
app.use((req: Request, res: Response, next: NextFunction) => {
  // İzin verilen adresleri ortam değişkeninden ve localhost'tan al
  const allowedOrigins = [
    process.env.FRONTEND_URL, 
    "http://localhost:3000",
    "https://medical-ai-frontend.vercel.app",
    "https://medical-ai-frontend.vercel.app/",
    "https://medical-ai-frontend.vercel.app/*"
  ];
  const origin = req.headers.origin;

  // Gelen isteğin origin'i izin verilenler listesindeyse, o origin'e izin ver
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Geliştirme için tüm origin'lere izin ver (production'da kaldırın)
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // İzin verilen metodları, başlıkları ve cookie kullanımını belirt
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 saat

  // Tarayıcının gönderdiği 'preflight' (OPTIONS) isteğine hemen 'başarılı' yanıtı ver.
  // Bu, 404 hatasını çözecek olan en kritik kısımdır.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  // İstek bir 'preflight' değilse, normal akışına devam etsin
  next();
});

// Body parsing middleware (CORS'tan sonra gelmeli)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Rotaları kaydet
registerRoutes(app);

// Hata yönetimi middleware'i
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Hata:', err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Vercel'e export edilecek ana fonksiyon
// initializeApp gibi karmaşık sarmalayıcılara gerek olmadan, doğrudan app'i export etmek
// Vercel'in serverless ortamında daha stabil çalışır.
export default app;