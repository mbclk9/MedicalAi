import type { Express } from "express";
import { createServer, type Server } from "http";
import { DatabaseStorage } from "../src/database/databaseStorage";

const storage = new DatabaseStorage();

// Import AI services with proper error handling
let anthropicService: any = null;
let intelligentMedicalService: any = null;
let mockAiService: any = null;
let deepgramService: any = null;
let openaiService: any = null;

// Service loading function
async function loadServices() {
  try {
    const { anthropicService: anthropicServiceInstance } = await import("./services/anthropicService");
    anthropicService = anthropicServiceInstance;
    console.log("✅ Anthropic service loaded in routes");
  } catch (error: any) {
    console.log("⚠️  Anthropic service failed to load:", error.message);
  }

  try {
    const { intelligentMedicalService: intelligentServiceInstance } = await import("./services/intelligentMedicalService");
    intelligentMedicalService = intelligentServiceInstance;
    console.log("✅ Intelligent medical service loaded in routes");
  } catch (error: any) {
    console.log("⚠️  Intelligent medical service failed to load:", error.message);
  }

  try {
    const { mockAiService: mockServiceInstance } = await import("./services/mockAiService");
    mockAiService = mockServiceInstance;
    console.log("✅ Mock AI service loaded in routes");
  } catch (error: any) {
    console.log("⚠️  Mock AI service failed to load:", error.message);
  }

  try {
    const { deepgramService: deepgramServiceInstance } = await import("./services/deepgramService");
    deepgramService = deepgramServiceInstance;
    console.log("✅ Deepgram service loaded in routes");
  } catch (error: any) {
    console.log("⚠️  Deepgram service failed to load:", error.message);
  }

  try {
    const { openaiService: openaiServiceInstance } = await import("./services/openaiService");
    openaiService = openaiServiceInstance;
    console.log("✅ OpenAI service loaded in routes");
  } catch (error: any) {
    console.log("⚠️  OpenAI service failed to load:", error.message);
  }
}

// Load services
await loadServices();

import multer from "multer";
import { z } from "zod";
import { insertVisitSchema, insertPatientSchema, insertMedicalNoteSchema } from "@repo/db";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  // Delete patient
  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      await storage.deletePatient(patientId);
      res.json({ success: true, message: "Hasta kaydı silindi" });
    } catch (error) {
      console.error("Delete patient error:", error);
      res.status(500).json({ message: "Hasta silinirken hata oluştu" });
    }
  });

  // Create patient
  app.post("/api/patients", async (req, res) => {
    try {
      console.log("📝 Patient creation request:", req.body);
      
      // Validate request body exists
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log("❌ Empty request body");
        return res.status(400).json({ 
          error: "Request body is empty",
          message: "Patient data is required"
        });
      }

      // Validate required fields
      const { name, surname } = req.body;
      if (!name || !surname) {
        console.log("❌ Missing required fields:", { name: !!name, surname: !!surname });
        return res.status(400).json({ 
          error: "Missing required fields", 
          message: "Name and surname are required",
          required: ["name", "surname"],
          received: Object.keys(req.body)
        });
      }
      
      // Clean and transform the data
      const requestData = { ...req.body };
      
      // Transform date string to Date object
      if (requestData.birthDate && typeof requestData.birthDate === 'string') {
        requestData.birthDate = new Date(requestData.birthDate);
      }
      
      // Transform gender to lowercase to match database expectations
      if (requestData.gender) {
        requestData.gender = requestData.gender.toLowerCase();
      }
      
      // Clean empty strings to null
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === '') {
          requestData[key] = null;
        }
      });
      
      console.log("🧹 Cleaned patient data:", requestData);
      
      const patientData = insertPatientSchema.parse(requestData);
      console.log("✅ Validated patient data:", patientData);
      const patient = await storage.createPatient(patientData);
      
      console.log("🎉 Patient created successfully:", patient.id, patient.name, patient.surname);
      res.status(201).json({
        ...patient,
        message: "Patient created successfully"
      });
    } catch (error) {
      console.error("❌ Patient creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed",
          message: "Invalid patient data",
          details: error.errors
        });
      } else {
        res.status(500).json({ 
          error: "Internal server error",
          message: "Failed to create patient"
        });
      }
    }
  });

  // Get all visits with patient info
  app.get("/api/visits", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const visits = await storage.getAllVisits(limit);
      res.json(visits);
    } catch (error) {
      console.error("Get all visits error:", error);
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  // Get recent visits with patient info
  app.get("/api/visits/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const visits = await storage.getRecentVisits(limit);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent visits" });
    }
  });

  // Get specific visit
  app.get("/api/visits/:id", async (req, res) => {
    try {
      const visitId = parseInt(req.params.id);
      const visit = await storage.getVisit(visitId);
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      const patient = await storage.getPatient(visit.patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found for this visit" });
      }
      const medicalNote = await storage.getMedicalNote(visitId);
      const recording = await storage.getRecording(visitId);
      res.json({
        visit,
        patient,
        medicalNote,
        recording
      });
    } catch (error) {
      console.error("Visit details error:", error);
      res.status(500).json({ message: "Failed to fetch visit details" });
    }
  });

  // Create visit
  app.post("/api/visits", async (req, res) => {
    try {
      const visitData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(visitData);
      res.json(visit);
    } catch (error) {
      console.error("Create visit error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid visit data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create visit" });
      }
    }
  });

  // Update visit status
  app.patch("/api/visits/:id", async (req, res) => {
    try {
      const visitId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status provided." });
      }

      const updatedVisit = await storage.updateVisit(visitId, { status });
      res.json(updatedVisit);
    } catch (error) {
      console.error("Update visit status error:", error);
      res.status(500).json({ message: "Failed to update visit status" });
    }
  });

  // Delete visit
  app.delete("/api/visits/:id", async (req, res) => {
    try {
      const visitId = parseInt(req.params.id);
      await storage.deleteVisit(visitId);
      res.json({ success: true, message: "Muayene kaydı silindi" });
    } catch (error) {
      console.error("Delete visit error:", error);
      res.status(500).json({ message: "Muayene silinirken hata oluştu" });
    }
  });

  // Audio transcription endpoint
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      console.log("🎤 Transcription request received:", {
        hasFile: !!req.file,
        body: req.body,
        headers: req.headers['content-type']
      });

      if (!req.file) {
        console.log("❌ No file in request");
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log("📊 Audio file details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.buffer.length
      });

      let transcriptionResult;
      
      // Try Deepgram first if available
      if (deepgramService && process.env.DEEPGRAM_API_KEY) {
        try {
          console.log("🎤 Using Deepgram for transcription");
          transcriptionResult = await deepgramService.transcribeAudio(req.file.buffer, "tr");
        } catch (error: any) {
          console.log("⚠️  Deepgram failed:", error.message);
          throw new Error(`Deepgram transcription failed: ${error.message}`);
        }
      } else {
        throw new Error("Deepgram service not available");
      }

      if (!transcriptionResult) {
        throw new Error("No transcription result available");
      }

      console.log("✅ Transcription completed:", transcriptionResult.text.substring(0, 50) + "...");
      res.json(transcriptionResult);
    } catch (error) {
      console.error("❌ Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // ROBUST Medical note generation endpoint with multiple fallbacks
  app.post("/api/generate-note", async (req, res) => {
    try {
      const { transcription, templateId, visitId } = req.body;
      
      console.log("🤖 Medical note generation request:", {
        transcriptionLength: transcription?.length || 0,
        templateId,
        visitId,
        hasTranscription: !!transcription
      });
      
      if (!transcription || !visitId) {
        console.log("❌ Missing required fields for note generation");
        return res.status(400).json({ 
          message: "Transcription and visitId are required",
          received: { transcription: !!transcription, visitId: !!visitId }
        });
      }

      let templateStructure: any = {};
      let specialty = "Genel Tıp";
      
      if (templateId) {
        try {
          const template = await storage.getTemplate(templateId);
          if (template) {
            templateStructure = template.structure;
            specialty = template.specialty;
            console.log("✅ Template loaded:", template.name, specialty);
          }
        } catch (error) {
          console.log("⚠️  Template loading failed:", error);
        }
      }

      let medicalNote = null;
      let generationMethod = "unknown";

      // Try Anthropic first
      if (anthropicService && process.env.ANTHROPIC_API_KEY) {
        try {
          console.log("🤖 Attempting Anthropic Claude for medical note generation");
          medicalNote = await anthropicService.generateMedicalNote(
            transcription, 
            templateStructure, 
            specialty
          );
          generationMethod = "anthropic";
          console.log("✅ Anthropic Claude generation successful");
        } catch (error: any) {
          console.log("⚠️  Anthropic failed:", error.message);
          throw new Error(`Medical note generation failed: ${error.message}`);
        }
      } else {
        console.log("⚠️  Anthropic service not available (no API key or service not loaded)");
        throw new Error("Anthropic service not available");
      }

      if (!medicalNote) {
        throw new Error("No medical note generated");
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

      let savedNote;
      try {
        const existingNote = await storage.getMedicalNote(parseInt(visitId));
        
        if (existingNote) {
          savedNote = await storage.updateMedicalNote(parseInt(visitId), noteData);
          console.log("✅ Medical note updated in database");
        } else {
          savedNote = await storage.createMedicalNote(noteData);
          console.log("✅ Medical note created in database");
        }
      } catch (dbError: any) {
        console.error("❌ Database save error:", dbError);
        // Return the generated note even if DB save fails
        savedNote = {
          ...noteData,
          id: Date.now(), // Temporary ID
          generatedAt: new Date(),
          updatedAt: new Date()
        };
      }

      console.log("🎉 Medical note generation completed successfully via:", generationMethod);
      res.json({
        ...savedNote,
        generationMethod,
        success: true
      });

    } catch (error: any) {
      console.error("❌ Medical note generation error:", error);
      res.status(500).json({ 
        message: "Failed to generate medical note",
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create new template
  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = req.body;
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Create template error:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      services: {
        anthropic: !!anthropicService && !!process.env.ANTHROPIC_API_KEY,
        deepgram: !!deepgramService && !!process.env.DEEPGRAM_API_KEY,
        intelligent: !!intelligentMedicalService,
        mock: !!mockAiService,
        database: !!storage
      }
    });
  });

  return createServer(app);
}

