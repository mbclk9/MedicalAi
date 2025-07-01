import { Router } from 'express';
import { storage } from '../database/storage';
import { insertPatientSchema } from '../schemas/shared/schema';
import { validateBody, validateParams } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await storage.getPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patients" });
  }
});

// Get patient by ID
router.get('/:id', validateParams(z.object({ id: z.string() })), async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await storage.getPatient(patientId);
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch patient" });
  }
});

// Create patient
router.post('/', validateBody(insertPatientSchema), async (req, res) => {
  try {
    console.log("Patient creation request:", req.body);
    
    // Convert date string to Date object
    const requestData = { ...req.body };
    if (requestData.birthDate && typeof requestData.birthDate === 'string') {
      requestData.birthDate = new Date(requestData.birthDate);
    }
    
    const patientData = insertPatientSchema.parse(requestData);
    console.log("Validated patient data:", patientData);
    
    const patient = await storage.createPatient(patientData);
    res.json(patient);
  } catch (error) {
    console.error("Create patient error:", error);
    res.status(500).json({ message: "Failed to create patient" });
  }
});

// Update patient
router.put('/:id', validateParams(z.object({ id: z.string() })), async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    // TODO: Implement patient update
    res.status(501).json({ message: "Patient update not implemented yet" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update patient" });
  }
});

// Delete patient
router.delete('/:id', validateParams(z.object({ id: z.string() })), async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    await storage.deletePatient(patientId);
    res.json({ success: true, message: "Hasta kaydı silindi" });
  } catch (error) {
    console.error("Delete patient error:", error);
    res.status(500).json({ message: "Hasta silinirken hata oluştu" });
  }
});

export default router;