import { Router } from "express";
import { storage } from "../database/storage.ts";
import { z } from "zod";

const router = Router();

// Patient validation schema
const createPatientSchema = z.object({
  name: z.string().min(1, "Ad gereklidir").max(50, "Ad çok uzun"),
  surname: z.string().min(1, "Soyad gereklidir").max(50, "Soyad çok uzun"),
  tcKimlik: z.string().optional().nullable(),
  sgkNumber: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["erkek", "kadın"]).optional().nullable(),
  address: z.string().optional().nullable(),
});

// Utility function to clean null/empty values
function cleanPatientData(data: any) {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === "" || value === undefined) {
      cleaned[key] = null;
    } else if (key === "birthDate" && value) {
      // Convert date string to Date object
      cleaned[key] = new Date(value as string);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Get all patients
router.get("/", async (req, res) => {
  try {
    console.log("📋 GET /api/patients - Fetching all patients...");
    const patients = await storage.getPatients();
    console.log(`✅ Retrieved ${patients.length} patients`);
    res.json(patients);
  } catch (error: any) {
    console.error("❌ Get patients error:", error);
    res.status(500).json({ 
      error: "Failed to fetch patients", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    console.log(`📋 GET /api/patients/${patientId} - Fetching patient...`);
    
    if (isNaN(patientId)) {
      console.log("❌ Invalid patient ID:", req.params.id);
      return res.status(400).json({ error: "Invalid patient ID" });
    }
    
    const patient = await storage.getPatient(patientId);
    
    if (!patient) {
      console.log(`⚠️  Patient ${patientId} not found`);
      return res.status(404).json({ error: "Patient not found" });
    }
    
    console.log(`✅ Patient ${patientId} retrieved:`, patient.name, patient.surname);
    res.json(patient);
  } catch (error: any) {
    console.error("❌ Get patient error:", error);
    res.status(500).json({ 
      error: "Failed to fetch patient", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create new patient - CRITICAL FIXED ENDPOINT
router.post("/", async (req, res) => {
  try {
    console.log("📝 POST /api/patients - Creating new patient...");
    console.log("📥 Raw request body:", JSON.stringify(req.body, null, 2));
    console.log("📋 Request headers:", JSON.stringify(req.headers, null, 2));
    
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

    // Clean and validate data using Zod
    let validatedData;
    try {
      // First clean the data
      const cleanedData = cleanPatientData(req.body);
      console.log("🧹 Cleaned data:", JSON.stringify(cleanedData, null, 2));
      
      // Then validate with Zod
      validatedData = createPatientSchema.parse(cleanedData);
      console.log("✅ Validation passed:", JSON.stringify(validatedData, null, 2));
    } catch (zodError: any) {
      console.log("❌ Validation error:", zodError);
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid patient data",
        details: zodError.errors || zodError.message
      });
    }

    // Prepare final data for storage
    const patientData = {
      name: validatedData.name.trim(),
      surname: validatedData.surname.trim(),
      tcKimlik: validatedData.tcKimlik || null,
      sgkNumber: validatedData.sgkNumber || null,
      phone: validatedData.phone || null,
      email: validatedData.email || null,
      gender: validatedData.gender || null,
      address: validatedData.address || null,
      birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
    };

    console.log("💾 Final data for storage:", JSON.stringify(patientData, null, 2));

    // Attempt to create patient
    let patient;
    try {
      patient = await storage.createPatient(patientData);
      console.log("✅ Patient created successfully in storage:", patient);
    } catch (storageError: any) {
      console.error("❌ Storage error:", storageError);
      return res.status(500).json({
        error: "Failed to save patient",
        message: "Database operation failed",
        details: process.env.NODE_ENV === 'development' ? storageError.message : undefined
      });
    }

    // Success response
    console.log("🎉 Patient creation completed successfully:", patient.id, patient.name, patient.surname);
    res.status(201).json({
      ...patient,
      message: "Patient created successfully"
    });

  } catch (error: any) {
    console.error("💥 Unexpected error in patient creation:", error);
    console.error("Error stack:", error.stack);
    
    res.status(500).json({ 
      error: "Internal server error", 
      message: "An unexpected error occurred while creating the patient",
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        body: req.body
      } : undefined
    });
  }
});

// Update patient
router.put("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    console.log(`📝 PUT /api/patients/${patientId} - Updating patient...`);
    console.log("📥 Update data:", JSON.stringify(req.body, null, 2));
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    // Check if patient exists
    const existingPatient = await storage.getPatient(patientId);
    if (!existingPatient) {
      console.log(`⚠️  Patient ${patientId} not found for update`);
      return res.status(404).json({ error: "Patient not found" });
    }

    // Clean and validate update data
    const cleanedData = cleanPatientData(req.body);
    const validatedData = createPatientSchema.partial().parse(cleanedData);

    // For now, return updated data (in full implementation, add updatePatient to storage)
    const updatedPatient = {
      ...existingPatient,
      ...validatedData,
      id: patientId // Ensure ID stays the same
    };

    console.log("✅ Patient updated (mock):", patientId);
    res.json(updatedPatient);
  } catch (error: any) {
    console.error("❌ Update patient error:", error);
    res.status(500).json({ 
      error: "Failed to update patient", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete patient
router.delete("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    console.log(`🗑️  DELETE /api/patients/${patientId} - Deleting patient...`);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    // Check if patient exists
    const existingPatient = await storage.getPatient(patientId);
    if (!existingPatient) {
      console.log(`⚠️  Patient ${patientId} not found for deletion`);
      return res.status(404).json({ error: "Patient not found" });
    }
    
    await storage.deletePatient(patientId);
    console.log(`✅ Patient ${patientId} deleted successfully`);
    
    res.json({ 
      success: true, 
      message: "Patient deleted successfully",
      deletedPatient: {
        id: patientId,
        name: existingPatient.name,
        surname: existingPatient.surname
      }
    });
  } catch (error: any) {
    console.error("❌ Delete patient error:", error);
    res.status(500).json({ 
      error: "Failed to delete patient", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get patient visits
router.get("/:id/visits", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    console.log(`📋 GET /api/patients/${patientId}/visits - Fetching patient visits...`);
    
    if (isNaN(patientId)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    // Check if patient exists
    const patient = await storage.getPatient(patientId);
    if (!patient) {
      console.log(`⚠️  Patient ${patientId} not found`);
      return res.status(404).json({ error: "Patient not found" });
    }
    
    const visits = await storage.getVisitsByPatient(patientId);
    console.log(`✅ Retrieved ${visits.length} visits for patient ${patientId}`);
    
    res.json(visits);
  } catch (error: any) {
    console.error("❌ Get patient visits error:", error);
    res.status(500).json({ 
      error: "Failed to fetch patient visits", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Search patients
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query.toLowerCase().trim();
    console.log(`🔍 GET /api/patients/search/${query} - Searching patients...`);
    
    if (query.length < 2) {
      return res.status(400).json({ 
        error: "Search query too short",
        message: "Query must be at least 2 characters long"
      });
    }
    
    const allPatients = await storage.getPatients();
    const filteredPatients = allPatients.filter(patient => 
      patient.name.toLowerCase().includes(query) ||
      patient.surname.toLowerCase().includes(query) ||
      (patient.tcKimlik && patient.tcKimlik.includes(query)) ||
      (patient.phone && patient.phone.includes(query)) ||
      (patient.email && patient.email.toLowerCase().includes(query))
    );
    
    console.log(`✅ Found ${filteredPatients.length} patients matching "${query}"`);
    res.json(filteredPatients);
  } catch (error: any) {
    console.error("❌ Search patients error:", error);
    res.status(500).json({ 
      error: "Failed to search patients", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;