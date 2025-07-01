import { Router } from 'express';
import { storage } from '../database/storage';
import { anthropicService } from '../services/anthropicService';
import { insertMedicalNoteSchema } from '../schemas/shared/schema';
import { validateBody, validateParams } from '../middleware/validation';
import { aiRateLimit } from '../middleware/rateLimit';
import { z } from 'zod';

const router = Router();

// Generate medical note from transcription
router.post('/generate-note', aiRateLimit, validateBody(z.object({
  transcription: z.string().min(1),
  visitId: z.number(),
  templateId: z.number().optional()
})), async (req, res) => {
  try {
    const { transcription, visitId, templateId } = req.body;
    
    // Get visit and template info
    const visit = await storage.getVisit(visitId);
    if (!visit) {
      return res.status(404).json({ error: "Visit not found" });
    }
    
    let template = null;
    if (templateId) {
      template = await storage.getTemplate(templateId);
    }
    
    const specialty = template?.specialty || "Dahiliye";
    
    console.log(`Generating medical note for visit ${visitId}, specialty: ${specialty}`);
    
    const generatedNote = await anthropicService.generateMedicalNote(
      transcription,
      template?.structure || {},
      specialty
    );
    
    // Save to database
    const noteData = insertMedicalNoteSchema.parse({
      visitId,
      ...generatedNote
    });
    
    const savedNote = await storage.createMedicalNote(noteData);
    
    res.json(generatedNote);
  } catch (error) {
    console.error("Generate note error:", error);
    res.status(500).json({ error: "Failed to generate medical note" });
  }
});

// Get medical note by visit ID
router.get('/notes/:visitId', validateParams(z.object({ visitId: z.string() })), async (req, res) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const note = await storage.getMedicalNote(visitId);
    
    if (!note) {
      return res.status(404).json({ error: "Medical note not found" });
    }
    
    res.json(note);
  } catch (error) {
    console.error("Get medical note error:", error);
    res.status(500).json({ error: "Failed to fetch medical note" });
  }
});

// Update medical note
router.put('/notes/:visitId', validateParams(z.object({ visitId: z.string() })), async (req, res) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const updates = req.body;
    
    const updatedNote = await storage.updateMedicalNote(visitId, updates);
    res.json(updatedNote);
  } catch (error) {
    console.error("Update medical note error:", error);
    res.status(500).json({ error: "Failed to update medical note" });
  }
});

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await storage.getTemplates();
    res.json(templates);
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Get templates by specialty
router.get('/templates/specialty/:specialty', validateParams(z.object({ specialty: z.string() })), async (req, res) => {
  try {
    const { specialty } = req.params;
    const templates = await storage.getTemplatesBySpecialty(specialty);
    res.json(templates);
  } catch (error) {
    console.error("Get templates by specialty error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

export default router;