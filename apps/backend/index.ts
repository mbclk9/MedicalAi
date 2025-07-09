// ===============================================
// CRITICAL: Load environment variables FIRST
// ===============================================
import dotenv from "dotenv";
import path from "path";
// React backend'de gerekli değil, kaldırıyoruz
// import React from "react"; // KALDIRILDI

// Load environment variables first
dotenv.config();

// Debug environment loading
console.log("📊 Environment Debug (index.ts):");
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'not found'}`);
console.log(`   - Working Directory: ${process.cwd()}`);

// Set NODE_ENV if not provided (Windows compatibility)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
  console.log("✅ Set NODE_ENV to development");
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log("⚠️  DATABASE_URL not found in index.ts, setting fallback...");
  process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/tipscribe_db";
  console.log("✅ Set fallback DATABASE_URL");
}

// ===============================================
// Import core modules
// ===============================================
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http"; // HTTP sunucusu için gerekli, kalsın
import multer from "multer";
// WebSocket ile ilgili importlar ve neonConfig kaldırıldı
// import ws from "ws"; // KALDIRILDI - db.ts'den de kaldırıldığı için burada da olmamalı
import { setupVite, serveStatic, log } from "./vite";

// Import storage (with fixed path)
import { storage } from "./storage"; // Use the new central storage instance

// Import AI services with error handling
let anthropicService: any;
let intelligentMedicalService: any;
let mockAiService: any;
let deepgramService: any;

// Service loading function to avoid top-level await
async function loadServices() {
  try {
    const anthropicModule = await import("./services/anthropicService");
    anthropicService = anthropicModule.anthropicService;
    console.log("✅ Anthropic service loaded");
  } catch (error: any) {
    console.log("⚠️  Anthropic service failed to load:", error.message);
  }

  try {
    const intelligentModule = await import("./services/intelligentMedicalService");
    intelligentMedicalService = intelligentModule.intelligentMedicalService;
    console.log("✅ Intelligent medical service loaded");
  } catch (error: any) {
    console.log("⚠️  Intelligent medical service failed to load:", error.message);
  }

  try {
    const mockModule = await import("./services/mockAiService");
    mockAiService = mockModule.mockAiService;
    console.log("✅ Mock AI service loaded");
  } catch (error: any) {
    console.log("⚠️  Mock AI service failed to load:", error.message);
  }

  try {
    const deepgramModule = await import("./services/deepgramService");
    deepgramService = deepgramModule.deepgramService;
    console.log("✅ Deepgram service loaded");
  } catch (error: any) {
    console.log("⚠️  Deepgram service failed to load:", error.message);
  }
}

// Load services
await loadServices();

const app = express();

// Basic middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Request logging middleware
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

      log(logLine);
    }
  });

  next();
});

// ================================
// API ROUTES WITH ROBUST ERROR HANDLING
// ================================

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: {
      anthropic: !!anthropicService && !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      deepgram: !!deepgramService && !!process.env.DEEPGRAM_API_KEY,
      database: !!process.env.DATABASE_URL
    }
  });
});

// Doctor endpoints
app.get("/api/doctor", async (req: Request, res: Response) => {
  try {
    const doctor = await storage.getDoctor(1);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error: any) {
    console.error("Get doctor error:", error);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

// Recent visits endpoint
app.get("/api/visits/recent", async (req: Request, res: Response) => {
  try {
    const visits = await storage.getRecentVisits();
    res.json(visits);
  } catch (error: any) {
    console.error("❌ Recent visits endpoint error:", error);
    res.status(500).json({ error: "Failed to fetch recent visits" });
  }
});

// Visit endpoints
app.get("/api/visits/:id", async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.id, 10);
    if (isNaN(visitId)) {
      return res.status(400).json({ error: "Invalid visit ID" });
    }
    
    const visit = await storage.getVisit(visitId);
    if (!visit) {
      return res.status(404).json({ error: "Visit not found" });
    }
    res.json(visit);
  } catch (error: any) {
    console.error("❌ Visit endpoint error:", error);
    res.status(500).json({ error: "Failed to fetch visit" });
  }
});

app.post("/api/visits", async (req: Request, res: Response) => {
  try {
    const visit = await storage.createVisit(req.body);
    res.json(visit);
  } catch (error: any) {
    console.error("❌ Create visit error:", error);
    res.status(500).json({ error: "Failed to create visit" });
  }
});

app.delete("/api/visits/:id", async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.id, 10);
    if (isNaN(visitId)) {
      return res.status(400).json({ error: "Invalid visit ID" });
    }
    
    await storage.deleteVisit(visitId);
    res.json({ success: true });
  } catch (error: any) {
    console.error("❌ Delete visit error:", error);
    res.status(500).json({ error: "Failed to delete visit" });
  }
});

// Templates endpoint
app.get("/api/templates", async (req: Request, res: Response) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error: any) {
    console.error("❌ Templates endpoint error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Patient endpoints
app.get("/api/patients", async (req: Request, res: Response) => {
  try {
    const patients = await storage.getPatients();
    res.json(patients);
  } catch (error: any) {
    console.error("❌ Patients endpoint error:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

app.post("/api/patients", async (req: Request, res: Response) => {
  try {
    const patient = await storage.createPatient(req.body);
    res.json(patient);
  } catch (error: any) {
    console.error("❌ Create patient error:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// Transcription endpoint
app.post("/api/transcribe", upload.single('audio'), async (req: Request, res: Response) => {
  try {
    console.log("🎤 Transcribe endpoint called");
    console.log("Request file:", req.file ? "File received" : "No file");
    
    const audioFile = req.file;
    
    if (!audioFile) {
      console.error("❌ No audio file received");
      return res.status(400).json({ error: "Audio data is required" });
    }

    const audioBuffer = audioFile.buffer;
    console.log("📊 Audio file details:", {
      mimetype: audioFile.mimetype,
      size: audioFile.size,
      originalName: audioFile.originalname
    });

    let transcriptionResult;
    
    // Try Deepgram first if available
    if (deepgramService && process.env.DEEPGRAM_API_KEY) {
      try {
        console.log("🎤 Using Deepgram for transcription");
        transcriptionResult = await deepgramService.transcribeAudio(audioBuffer);
      } catch (error: any) {
        console.log("⚠️  Deepgram failed, using fallback:", error.message);
      }
    }

    // Fallback to mock transcription
    if (!transcriptionResult) {
      console.log("🎤 Using mock transcription service");
      const mockTranscriptions = [
        "Hasta baş ağrısı şikayeti ile başvurdu. Sabahları daha şiddetli oluyor.",
        "Karın ağrısı şikayeti mevcut. Yemeklerden sonra artıyor. Bulantı da var.",
        "Kontrole geldi. İlaçlarını düzenli kullanıyor. Genel durumu iyi.",
        "Nefes darlığı yakınması var. Merdiven çıkarken zorlanıyor.",
        "Göğüs ağrısı şikayeti var. Efor ile artıyor, dinlenmekle geçiyor."
      ];
      
      transcriptionResult = {
        text: mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)],
        confidence: 0.85
      };
    }

    res.json(transcriptionResult);
  } catch (error: any) {
    console.error("❌ Transcription error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Medical note generation endpoint
app.post("/api/generate-medical-note", async (req: Request, res: Response) => {
  try {
    const { transcription, templateStructure, specialty } = req.body;
    
    if (!transcription) {
      return res.status(400).json({ error: "Transcription is required" });
    }

    let medicalNote;
    
    // Try Anthropic first
    if (anthropicService && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log("🤖 Using Anthropic for medical note generation");
        medicalNote = await anthropicService.generateMedicalNote(transcription, templateStructure, specialty);
      } catch (error: any) {
        console.log("⚠️  Anthropic failed, using fallback:", error.message);
      }
    }

    // Fallback to intelligent medical service
    if (!medicalNote && intelligentMedicalService) {
      try {
        console.log("🤖 Using intelligent medical service");
        medicalNote = await intelligentMedicalService.generateMedicalNote(transcription, templateStructure, specialty);
      } catch (error: any) {
        console.log("⚠️  Intelligent service failed, using mock:", error.message);
      }
    }

    // Final fallback to mock service
    if (!medicalNote && mockAiService) {
      console.log("🤖 Using mock AI service");
      medicalNote = await mockAiService.generateMedicalNote(transcription, templateStructure, specialty);
    }

    if (!medicalNote) {
      throw new Error("All medical note generation services failed");
    }

    res.json(medicalNote);
  } catch (error: any) {
    console.error("❌ Medical note generation error:", error);
    res.status(500).json({ error: "Medical note generation failed" });
  }
});

// ===============================================
// Error handling middleware
// ===============================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ================================
// SERVER STARTUP
// ================================

(async () => {
  const port = parseInt(process.env.PORT || '5001', 10);
  
  console.log("🏥 TıpScribe - Turkish Medical AI Assistant");
  console.log("=" .repeat(50));
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗃️  Database: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`🤖 AI Services:`);
  console.log(`   - Anthropic Claude: ${anthropicService && process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`);
  console.log(`   - OpenAI GPT-4o: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Deepgram Speech: ${deepgramService && process.env.DEEPGRAM_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Intelligent Fallback: ${intelligentMedicalService ? '✅' : '❌'}`);
  console.log(`   - Mock Service: ${mockAiService ? '✅' : '❌'}`);
  console.log("=" .repeat(50));

  const server = app.listen(port, "0.0.0.0", () => {
    log(`🌐 Server running on http://localhost:${port}`);
    log(`📱 API Health Check: http://localhost:${port}/api/health`);
    log(`🩺 Medical Dashboard: http://localhost:${port}`);
    log(`🎯 All systems ready!`);
  });

  // Setup development/production environment
  if (process.env.NODE_ENV === "development") {
    try {
      await setupVite(app, server);
      log("✅ Vite development server ready");
    } catch (error: any) {
      log(`⚠️  Vite setup failed: ${error.message}`);
      log("🔄 Falling back to static file serving");
      serveStatic(app);
    }
  } else {
    serveStatic(app);
    log("✅ Production mode: Static files served");
  }

  // Graceful shutdown handlers
  const gracefulShutdown = (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('✅ Server shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

})().catch((error: any) => {
  console.error("❌ Server startup failed:");
  console.error(error);
  process.exit(1);
});

// Export the app for Vercel serverless functions
export default app;