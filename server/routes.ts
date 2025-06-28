import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { deepgramService } from "./services/deepgramService";
import { anthropicService } from "./services/anthropicService";
import multer from "multer";
import { z } from "zod";
import { insertVisitSchema, insertPatientSchema, insertMedicalNoteSchema } from "@shared/schema";

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
      console.log("Patient creation request:", req.body);
      
      // Tarih string'ini Date objesine çevir
      const requestData = { ...req.body };
      if (requestData.birthDate && typeof requestData.birthDate === 'string') {
        requestData.birthDate = new Date(requestData.birthDate);
      }
      
      const patientData = insertPatientSchema.parse(requestData);
      console.log("Validated patient data:", patientData);
      const patient = await storage.createPatient(patientData);
      res.json(patient);
    } catch (error) {
      console.error("Patient creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid patient data", 
          errors: error.errors 
        });
      } else {
        res.status(400).json({ message: "Invalid patient data" });
      }
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
      const medicalNote = await storage.getMedicalNote(visitId);
      const recording = await storage.getRecording(visitId);
      
      res.json({
        visit,
        patient,
        medicalNote,
        recording
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visit details" });
    }
  });

  // Create new visit
  app.post("/api/visits", async (req, res) => {
    try {
      const visitData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(visitData);
      res.json(visit);
    } catch (error) {
      res.status(400).json({ message: "Invalid visit data" });
    }
  });

  // Update visit status
  app.patch("/api/visits/:id/status", async (req, res) => {
    try {
      const visitId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["in_progress", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const visit = await storage.updateVisitStatus(visitId, status);
      res.json(visit);
    } catch (error) {
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
      console.log("Transcription request received:", {
        hasFile: !!req.file,
        body: req.body,
        headers: req.headers['content-type']
      });

      if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log("Audio file details:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.buffer.length
      });

      const transcription = await deepgramService.transcribeAudio(req.file.buffer, "tr");
      res.json(transcription);
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  // Generate medical note from transcription
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

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get templates by specialty
  app.get("/api/templates/specialty/:specialty", async (req, res) => {
    try {
      const specialty = req.params.specialty;
      const templates = await storage.getTemplatesBySpecialty(specialty);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates by specialty" });
    }
  });

  // Get default doctor (for demo purposes)
  app.get("/api/doctor", async (req, res) => {
    try {
      const doctor = await storage.getDoctor(1); // Default doctor
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctor info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
