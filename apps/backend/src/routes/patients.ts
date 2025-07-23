import { Router } from "express";
import { storage } from "../../storage.js";
import { z } from "zod";
import { fromZodError } from 'zod-validation-error';

const router = Router();

// ==============================================================================
// NİHAİ VE TEMİZLENMİŞ HASTA DOĞRULAMA ŞEMASI
// Yinelenen tüm alanlar kaldırıldı ve formla tam uyumlu hale getirildi.
// ==============================================================================
const createPatientSchema = z.object({
  // Kimlik Bilgileri
  name: z.string().min(1, "Ad alanı zorunludur."),
  surname: z.string().min(1, "Soyad alanı zorunludur."),
  tcKimlik: z.string().optional().nullable(),
  passportNo: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(), // String'i otomatik Date objesine çevirir
  birthPlace: z.string().optional().nullable(),
  gender: z.preprocess(
    (val) => (val === "" ? null : val), 
    z.enum(["Erkek", "Kadın", "Diğer"]).optional().nullable()
  ),
  maritalStatus: z.string().optional().nullable(),
  
  // İletişim Bilgileri
  phone: z.string().optional().nullable(),
  email: z.string().email("Geçersiz e-posta formatı").optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  
  // Sağlık Sigortası
  sgkNumber: z.string().optional().nullable(),
  insuranceType: z.string().optional().nullable(),
  insuranceCompany: z.string().optional().nullable(),
  
  // Acil Durum
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  
  // Tıbbi Bilgiler
  bloodType: z.string().optional().nullable(),
  chronicDiseases: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  medications: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).passthrough(); // Şemada olmayan ekstra alanlara izin ver

// Gelen verideki boş string'leri null'a çevirir.
function cleanPatientData(data: any) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data)) {
    cleaned[key] = value === "" ? null : value;
  }
  return cleaned;
}

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await storage.getPatients();
    res.json(patients);
  } catch (error: any) {
    console.error("❌ Get patients error:", error);
    res.status(500).json({ message: "Hastalar alınırken bir hata oluştu." });
  }
});

// Get patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Geçersiz hasta ID." });
    }
    const patient = await storage.getPatient(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Hasta bulunamadı." });
    }
    res.json(patient);
  } catch (error: any) {
    console.error(`❌ Get patient by ID error (ID: ${req.params.id}):`, error);
    res.status(500).json({ message: "Hasta alınırken bir hata oluştu." });
  }
});


// Create new patient
router.post("/", async (req, res) => {
  try {
    console.log("📝 POST /api/patients - Creating new patient...");
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "İstek gövdesi boş olamaz." });
    }

    let validatedData;
    try {
      const cleanedData = cleanPatientData(req.body);
      validatedData = createPatientSchema.parse(cleanedData);
      console.log("✅ Validation passed.");

    } catch (zodError: any) {
      const validationError = fromZodError(zodError);
      console.error("❌ Validation error:", validationError.toString());
      return res.status(400).json({
        error: "Validation failed",
        message: validationError.toString(),
      });
    }

    // Doğrulanmış veri doğrudan veritabanı katmanına gönderilir.
    const patient = await storage.createPatient(validatedData);
    console.log("🎉 Patient creation completed successfully:", patient.id);
    
    res.status(201).json(patient);

  } catch (error: any) {
    console.error("💥 Unexpected error in patient creation:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Hasta oluşturulurken beklenmedik bir hata oluştu."
    });
  }
});

// Update patient
router.put("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
     if (isNaN(patientId)) {
      return res.status(400).json({ message: "Geçersiz hasta ID." });
    }

    // Kısmi doğrulama için .partial() kullanılır
    const validatedData = createPatientSchema.partial().parse(req.body);
    
    const updatedPatient = await storage.updatePatient(patientId, validatedData);
    res.json(updatedPatient);

  } catch (error: any)
    {
    console.error(`❌ Update patient error (ID: ${req.params.id}):`, error);
    if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
    }
    res.status(500).json({ message: "Hasta güncellenirken bir hata oluştu." });
  }
});

// Delete patient
router.delete("/:id", async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    if (isNaN(patientId)) {
      return res.status(400).json({ message: "Geçersiz hasta ID." });
    }
    await storage.deletePatient(patientId);
    res.status(200).json({ message: "Hasta başarıyla silindi." });
  } catch (error: any) {
    console.error(`❌ Delete patient error (ID: ${req.params.id}):`, error);
    res.status(500).json({ message: "Hasta silinirken bir hata oluştu." });
  }
});

export default router;