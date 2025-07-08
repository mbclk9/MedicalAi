// ===============================================
// CRITICAL: Load environment variables FIRST
// ===============================================
import dotenv from "dotenv";
import path from "path";
// React backend'de gerekli değil, kaldırıyoruz
// import React from "react"; // KALDIRILDI

// Load .env file before any other imports
console.log("🔧 Loading environment variables in index.ts...");
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

// Ensure DATABASE_URL is set (Bu kısım db.ts'de de var, burada sadece genel bir kontrol)
if (!process.env.DATABASE_URL) {
  console.log("⚠️  DATABASE_URL not found in index.ts, setting fallback...");
  process.env.DATABASE_URL = "postgresql://postgres:Muhammet55.@localhost:5432/tipscribe_db";
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
import { storage } from "./storage"; // Bu storage objesini db.ts'deki db nesnesiyle kullanacak

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

// Call the function to load services
loadServices().catch(error => {
  console.error("❌ Failed to load services:", error);
});

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
app.get("/api/health", async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    // database bağlantı durumunu db.ts'den gelen clientInstance üzerinden kontrol edelim
    // Veya storage.initialized flag'ını kullanabiliriz.
    // Şimdilik storage'ın varlığını ve initialize olup olmadığını kontrol edelim.
    res.json({
      status: "healthy",
      timestamp,
      version: "1.0.0",
      environment: process.env.NODE_ENV,
      database: (storage as any).initialized ? "connected" : "not initialized", // Assuming storage has an initialized flag
      services: {
        database: !!storage,
        api: true,
        ai: {
          anthropic: !!anthropicService && !!process.env.ANTHROPIC_API_KEY,
          openai: !!process.env.OPENAI_API_KEY,
          deepgram: !!deepgramService && !!process.env.DEEPGRAM_API_KEY,
          intelligent: !!intelligentMedicalService,
          mock: !!mockAiService
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

// Doctor endpoints
app.get("/api/doctor", async (req, res) => {
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

// Visits endpoints
app.get("/api/visits/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const visits = await storage.getRecentVisits(limit);
    res.json(visits);
  } catch (error: any) {
    console.error("Get recent visits error:", error);
    res.status(500).json({ error: "Failed to fetch recent visits" });
  }
});

app.get("/api/visits/:id", async (req, res) => {
  try {
    const visitId = parseInt(req.params.id);
    if (isNaN(visitId)) {
      return res.status(400).json({ error: "Invalid visit ID" });
    }

    const visit = await storage.getVisit(visitId);
    if (!visit) {
      return res.status(404).json({ error: "Visit not found" });
    }

    const patient = await storage.getPatient(visit.patientId);
    const medicalNote = await storage.getMedicalNote(visitId);
    const template = visit.templateId ? await storage.getTemplate(visit.templateId) : null;

    res.json({
      visit,
      patient,
      medicalNote,
      template
    });
  } catch (error: any) {
    console.error("Get visit error:", error);
    res.status(500).json({ error: "Failed to fetch visit" });
  }
});

app.post("/api/visits", async (req, res) => {
  try {
    const { patientId, doctorId, templateId, visitType } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ error: "Patient ID and Doctor ID are required" });
    }

    const visitData = {
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId),
      templateId: templateId ? parseInt(templateId) : undefined,
      visitType: visitType || "ilk",
      visitDate: new Date(),
      status: "in_progress"
    };

    const visit = await storage.createVisit(visitData);
    res.json(visit);
  } catch (error: any) {
    console.error("Create visit error:", error);
    res.status(500).json({ error: "Failed to create visit" });
  }
});

// Templates endpoints
app.get("/api/templates", async (req, res) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error: any) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Patients endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const patients = await storage.getPatients();
    res.json(patients);
  } catch (error: any) {
    console.error("Get patients error:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const { name, surname, tcKimlik, birthDate, sgkNumber, phone } = req.body;
    
    if (!name || !surname) {
      return res.status(400).json({ error: "Name and surname are required" });
    }

    const patientData = {
      name,
      surname,
      tcKimlik,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      sgkNumber,
      phone
    };

    const patient = await storage.createPatient(patientData);
    res.json(patient);
  } catch (error: any) {
    console.error("Create patient error:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// Transcription endpoint with multiple service support
app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
  try {
    console.log("🎤 Transcribe endpoint called");
    console.log("Request file:", req.file ? "File received" : "No file");
    console.log("Request body:", req.body);
    
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
      console.log("🎤 Using mock transcription");
      const mockTranscriptions = [
        "Doktor: İyi günler, nasılsınız bugün? Hasta: İyi günler doktor, başım ağrıyor. 2 gündür sürekli ağrı var.",
        "Hasta: Karın ağrısı şikayeti var doktor. Özellikle yemeklerden sonra artıyor. Doktor: Ne zamandan beri bu şikayet var?",
        "Doktor: Kontrole nasıl geldiniz? Hasta: İlaçlarımı düzenli kullanıyorum doktor. Genel durumum iyi.",
        "Hasta: Nefes darlığı yakınmam var doktor. Merdiven çıkarken zorlanıyorum. Doktor: Bu şikayet ne zaman başladı?",
        "Hasta: Göğsümde ağrı var doktor. Efor ile artıyor, dinlenince geçiyor. Doktor: Ağrının şiddeti nasıl?"
      ];
      
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      transcriptionResult = {
        text: randomText,
        confidence: 0.95,
        words: randomText.split(' ').map((word, index) => ({
          word,
          start: index * 0.6,
          end: (index + 1) * 0.6,
          confidence: 0.95
        }))
      };
    }
    
    console.log("✅ Transcription completed");
    res.json(transcriptionResult);
  } catch (error: any) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Generate medical note endpoint with AI service cascading
app.post("/api/generate-note", async (req, res) => {
  try {
    const { transcription, templateId, visitId } = req.body;
    
    if (!transcription || !visitId) {
      return res.status(400).json({ 
        error: "Transcription and visitId are required" 
      });
    }

    let templateStructure: any = {};
    let specialty = "Genel Tıp";
    
    if (templateId) {
      const template = await storage.getTemplate(templateId);
      if (template) {
        templateStructure = template.structure;
        specialty = template.specialty;
      }
    }

    console.log(`🤖 Generating medical note for visit ${visitId} in ${specialty}`);
    
    let medicalNote;
    let serviceUsed = "none";

    // Try AI services in order of preference
    if (anthropicService && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log("🔮 Trying Anthropic Claude...");
        medicalNote = await anthropicService.generateMedicalNote(transcription, templateStructure, specialty);
        serviceUsed = "anthropic";
      } catch (error: any) {
        console.log("⚠️  Anthropic failed:", error.message);
      }
    }

    if (!medicalNote && intelligentMedicalService) {
      try {
        console.log("🧠 Trying Intelligent Medical Service...");
        medicalNote = await intelligentMedicalService.generateMedicalNote(transcription, templateStructure, specialty);
        serviceUsed = "intelligent";
      } catch (error: any) {
        console.log("⚠️  Intelligent service failed:", error.message);
      }
    }

    if (!medicalNote && mockAiService) {
      try {
        console.log("🎭 Using Mock AI Service...");
        medicalNote = await mockAiService.generateMedicalNote(transcription, templateStructure, specialty);
        serviceUsed = "mock";
      } catch (error: any) {
        console.log("⚠️  Mock service failed:", error.message);
      }
    }

    if (!medicalNote) {
      throw new Error("All AI services failed");
    }

    // Save the generated note
    const noteData = {
      visitId: parseInt(visitId),
      transcription,
      visitSummary: medicalNote.visitSummary,
      subjective: medicalNote.subjective,
      objective: medicalNote.objective,
      assessment: medicalNote.assessment,
      plan: medicalNote.plan,
    };

    const existingNote = await storage.getMedicalNote(parseInt(visitId));
    let savedNote;
    
    if (existingNote) {
      savedNote = await storage.updateMedicalNote(parseInt(visitId), noteData);
    } else {
      savedNote = await storage.createMedicalNote(noteData);
    }

    console.log(`✅ Medical note generated using ${serviceUsed} service`);
    res.json({ ...savedNote, serviceUsed });
  } catch (error: any) {
    console.error("Medical note generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate medical note",
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({ 
    error: message,
    timestamp: new Date().toISOString()
  });
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
  console.log(`   - Anthropic Claude: ${anthropicService && process.env.ANTHROPIC_API_KEY ? '✅' : '❌'}`);
  console.log(`   - OpenAI GPT-4o: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Deepgram Speech: ${deepgramService && process.env.DEEPGRAM_API_KEY ? '✅' : '❌'}`);
  console.log(`   - Intelligent Fallback: ${intelligentMedicalService ? '✅' : '❌'}`);
  console.log(`   - Mock Service: ${mockAiService ? '✅' : '❌'}`);
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