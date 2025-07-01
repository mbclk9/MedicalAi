import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from "./routes/auth";
import patientRoutes from "./routes/patients";
import medicalRoutes from "./routes/medical";
import transcriptionRoutes from "./routes/transcription";

// Import middleware
import { generalRateLimit } from "./middleware/rateLimit";
import { storage } from "./database/storage";
import { anthropicService } from "./services/anthropicService";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

      console.log(`[express] ${logLine}`);
    }
  });

  next();
});

// Apply rate limiting
app.use("/api", generalRateLimit);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/medical", medicalRoutes);
app.use("/api/transcribe", transcriptionRoutes);

// Legacy routes for compatibility
app.get("/api/doctor", async (req, res) => {
  try {
    const doctor = await storage.getDoctor(1);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

app.get("/api/visits/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const visits = await storage.getRecentVisits(limit);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent visits" });
  }
});

app.get("/api/visits/:id", async (req, res) => {
  try {
    const visitId = parseInt(req.params.id);
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
  } catch (error) {
    console.error("Get visit error:", error);
    res.status(500).json({ error: "Failed to fetch visit" });
  }
});

app.post("/api/visits", async (req, res) => {
  try {
    const { patientId, doctorId, templateId, visitType } = req.body;
    
    const visitData = {
      patientId,
      doctorId,
      templateId,
      visitType: visitType || "ilk",
      visitDate: new Date(),
      status: "active"
    };

    const visit = await storage.createVisit(visitData);
    res.json(visit);
  } catch (error) {
    console.error("Create visit error:", error);
    res.status(500).json({ error: "Failed to create visit" });
  }
});

app.get("/api/templates", async (req, res) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Legacy generate-note endpoint (redirects to medical module)
app.post("/api/generate-note", async (req, res) => {
  try {
    const { transcription, templateId, visitId } = req.body;
    
    if (!transcription || !visitId) {
      return res.status(400).json({ message: "Transcription and visitId are required" });
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

    const medicalNote = await anthropicService.generateMedicalNote(
      transcription, 
      templateStructure, 
      specialty
    );

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

    res.json(savedNote);
  } catch (error) {
    console.error("Medical note generation error:", error);
    res.status(500).json({ message: "Failed to generate medical note" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Basic health check
    const timestamp = new Date().toISOString();
    res.json({
      status: "healthy",
      timestamp,
      version: "1.0.0",
      services: {
        database: true,
        api: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

export function createApp() {
  return app;
}

export function registerRoutes(app: any): Promise<Server> {
  const server = createServer(app);
  return Promise.resolve(server);
}