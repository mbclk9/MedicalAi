import {
  doctors, patients, visits, medicalNotes, recordings, medicalTemplates,
  type Doctor, type Patient, type Visit, type MedicalNote, type Recording, type MedicalTemplate,
  type InsertDoctor, type InsertPatient, type InsertVisit, type InsertMedicalNote, type InsertRecording, type InsertTemplate
} from "@shared/schema";
import { db } from "./db"; 
import { eq, desc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!this.initialized) {
      try {
        console.log("🔄 Initializing database...");
        await this.seedData();
        this.initialized = true;
        console.log("✅ Database initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize database:", error);
        this.initialized = true; // Prevent infinite retry
      }
    }
  }

  async seedData() {
    try {
      // Önce doktor verisi var mı kontrol edelim
      const existingDoctors = await db.select().from(doctors).limit(1);
      if (existingDoctors.length > 0) {
        console.log("📊 Database already seeded, skipping...");
        return;
      }

      console.log("🌱 Seeding database with initial data...");

      // Varsayılan doktor oluştur
      await db.insert(doctors).values({
        name: "Dr. Mehmet Yılmaz",
        specialty: "Kardiyoloji",
        licenseNumber: "12345",
        email: "dr.mehmet@example.com",
      });

      // Varsayılan şablonlar (hasta olmadan)
      await db.insert(medicalTemplates).values([
        {
          name: "Genel Muayene",
          specialty: "Genel",
          description: "Genel tıp muayenesi için standart şablon",
          structure: {
            subjective: ["Ana şikayet", "Mevcut hastalık öyküsü", "Geçmiş tıbbi öykü", "İlaç kullanımı"],
            objective: ["Vital bulgular", "Fizik muayene", "Laboratuvar sonuçları"],
            assessment: ["Ön tanı", "Ayırıcı tanı", "Risk faktörleri"],
            plan: ["Tedavi planı", "İlaç reçetesi", "Takip önerileri", "Yaşam tarzı önerileri"]
          },
          isDefault: true,
        },
        {
          name: "Kardiyoloji Konsültasyonu",
          specialty: "Kardiyoloji",
          description: "Kalp hastalıkları için özel muayene şablonu",
          structure: {
            subjective: ["Göğüs ağrısı", "Nefes darlığı", "Çarpıntı", "Aile öyküsü", "Risk faktörleri"],
            objective: ["Vital bulgular", "Kardiyak muayene", "EKG", "Ekokardiyografi"],
            assessment: ["Kardiyak değerlendirme", "Risk stratifikasyonu"],
            plan: ["Kardiyak tedavi", "İlaç ayarlaması", "Yaşam tarzı değişiklikleri", "Takip planı"]
          },
          isDefault: false,
        },
        {
          name: "İç Hastalıkları Muayenesi",
          specialty: "İç Hastalıkları",
          description: "Genel iç hastalıkları değerlendirmesi",
          structure: {
            subjective: ["Ana şikayet", "Sistemik sorgu", "Geçmiş hastalık öyküsü", "İlaçlar"],
            objective: ["Vital bulgular", "Sistemik muayene", "Laboratuvar", "Görüntüleme"],
            assessment: ["Ön tanı", "Ayırıcı tanı", "Komorbidite"],
            plan: ["Tedavi", "Takip", "Konsültasyon", "Yaşam tarzı"]
          },
          isDefault: false,
        },
        {
          name: "Pediatri Muayenesi",
          specialty: "Pediatri",
          description: "Çocuk hastalıkları değerlendirmesi",
          structure: {
            subjective: ["Ana şikayet", "Gelişim öyküsü", "Aşı durumu", "Beslenme"],
            objective: ["Büyüme parametreleri", "Fizik muayene", "Nörolojik muayene"],
            assessment: ["Gelişimsel değerlendirme", "Tanı", "Risk faktörleri"],
            plan: ["Tedavi", "Aşı planı", "Beslenme önerileri", "Takip"]
          },
          isDefault: false,
        }
      ]);

      console.log("✅ Database seeded successfully - Ready for patient registration");
    } catch (error) {
      console.error("❌ Failed to seed database:", error);
      throw error;
    }
  }

  // Doctor management
  async getDoctor(id: number): Promise<Doctor | undefined> {
    await this.initialize();
    try {
      const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
      return doctor || undefined;
    } catch (error) {
      console.error("Database error in getDoctor:", error);
      throw error;
    }
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    await this.initialize();
    try {
      const [newDoctor] = await db.insert(doctors).values(doctor).returning();
      console.log("✅ Doctor created:", newDoctor.name);
      return newDoctor;
    } catch (error) {
      console.error("Database error in createDoctor:", error);
      throw error;
    }
  }

  // Patient management
  async getPatient(id: number): Promise<Patient | undefined> {
    await this.initialize();
    try {
      const [patient] = await db.select().from(patients).where(eq(patients.id, id));
      return patient || undefined;
    } catch (error) {
      console.error("Database error in getPatient:", error);
      throw error;
    }
  }

  async getPatients(): Promise<Patient[]> {
    await this.initialize();
    try {
      const patientList = await db.select().from(patients).orderBy(desc(patients.createdAt));
      console.log(`📊 Retrieved ${patientList.length} patients from database`);
      return patientList;
    } catch (error) {
      console.error("Database error in getPatients:", error);
      throw error;
    }
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    await this.initialize();
    try {
      console.log("➕ Creating new patient:", patient.name, patient.surname);

      // Validate required fields
      if (!patient.name || !patient.surname) {
        throw new Error("Patient name and surname are required");
      }

      const [newPatient] = await db.insert(patients).values({
        ...patient,
        createdAt: new Date(),
      }).returning();

      console.log("✅ Patient created successfully:", {
        id: newPatient.id,
        name: newPatient.name,
        surname: newPatient.surname,
        tcKimlik: newPatient.tcKimlik
      });

      return newPatient;
    } catch (error) {
      console.error("❌ Database error in createPatient:", error);
      throw error;
    }
  }

  async deletePatient(id: number): Promise<void> {
    await this.initialize();
    try {
      console.log("🗑️ Deleting patient:", id);

      // İlişkili kayıtları da silmeli: önce bu hastanın ziyaretlerini bul
      const patientVisits = await db.select({ id: visits.id }).from(visits).where(eq(visits.patientId, id));

      console.log(`Found ${patientVisits.length} visits for patient ${id}`);

      // Her ziyaret için tıbbi notları ve ses kayıtlarını sil
      for (const visit of patientVisits) {
        await db.delete(medicalNotes).where(eq(medicalNotes.visitId, visit.id));
        await db.delete(recordings).where(eq(recordings.visitId, visit.id));
      }

      // Ziyaretleri sil
      await db.delete(visits).where(eq(visits.patientId, id));

      // Son olarak hastayı sil
      await db.delete(patients).where(eq(patients.id, id));

      console.log("✅ Patient and related records deleted successfully");
    } catch (error) {
      console.error("❌ Database error in deletePatient:", error);
      throw error;
    }
  }

  // Visit management
  async getVisit(id: number): Promise<Visit | undefined> {
    await this.initialize();
    try {
      const [visit] = await db.select().from(visits).where(eq(visits.id, id));
      return visit || undefined;
    } catch (error) {
      console.error("Database error in getVisit:", error);
      throw error;
    }
  }

  async getVisitsByPatient(patientId: number): Promise<Visit[]> {
    await this.initialize();
    try {
      return await db.select().from(visits).where(eq(visits.patientId, patientId)).orderBy(desc(visits.createdAt));
    } catch (error) {
      console.error("Database error in getVisitsByPatient:", error);
      throw error;
    }
  }

  async getRecentVisits(limit = 10): Promise<(Visit & { patient: Patient })[]> {
    await this.initialize();
    try {
      const recentVisits = await db
        .select({
          id: visits.id,
          patientId: visits.patientId,
          doctorId: visits.doctorId,
          templateId: visits.templateId,
          visitDate: visits.visitDate,
          visitType: visits.visitType,
          duration: visits.duration,
          status: visits.status,
          createdAt: visits.createdAt,
          patient: {
            id: patients.id,
            name: patients.name,
            surname: patients.surname,
            tcKimlik: patients.tcKimlik,
            birthDate: patients.birthDate,
            gender: patients.gender,
            sgkNumber: patients.sgkNumber,
            phone: patients.phone,
            email: patients.email,
            address: patients.address,
            createdAt: patients.createdAt,
          }
        })
        .from(visits)
        .innerJoin(patients, eq(visits.patientId, patients.id))
        .orderBy(desc(visits.createdAt))
        .limit(limit);

      return recentVisits;
    } catch (error) {
      console.error("Database error in getRecentVisits:", error);
      return [];
    }
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    await this.initialize();
    try {
      console.log("➕ Creating new visit for patient:", visit.patientId);

      const [newVisit] = await db.insert(visits).values({
        ...visit,
        status: visit.status || "in_progress",
        visitDate: visit.visitDate || new Date(),
      }).returning();

      console.log("✅ Visit created successfully:", newVisit.id);
      return newVisit;
    } catch (error) {
      console.error("❌ Database error in createVisit:", error);
      throw error;
    }
  }

  async updateVisitStatus(id: number, status: string): Promise<Visit> {
    await this.initialize();
    try {
      const [updatedVisit] = await db
        .update(visits)
        .set({ status })
        .where(eq(visits.id, id))
        .returning();
      return updatedVisit;
    } catch (error) {
      console.error("Database error in updateVisitStatus:", error);
      throw error;
    }
  }

  async deleteVisit(id: number): Promise<void> {
    await this.initialize();
    try {
      // İlişkili kayıtları da silmeli: tıbbi notlar ve ses kayıtları
      await db.delete(medicalNotes).where(eq(medicalNotes.visitId, id));
      await db.delete(recordings).where(eq(recordings.visitId, id));
      await db.delete(visits).where(eq(visits.id, id));

      console.log("✅ Visit deleted successfully:", id);
    } catch (error) {
      console.error("❌ Database error in deleteVisit:", error);
      throw error;
    }
  }

  // Medical notes
  async getMedicalNote(visitId: number): Promise<MedicalNote | undefined> {
    await this.initialize();
    try {
      const [note] = await db.select().from(medicalNotes).where(eq(medicalNotes.visitId, visitId));
      return note || undefined;
    } catch (error) {
      console.error("Database error in getMedicalNote:", error);
      throw error;
    }
  }

  async createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote> {
    await this.initialize();
    try {
      const [newNote] = await db.insert(medicalNotes).values(note).returning();
      console.log("✅ Medical note created for visit:", note.visitId);
      return newNote;
    } catch (error) {
      console.error("❌ Database error in createMedicalNote:", error);
      throw error;
    }
  }

  async updateMedicalNote(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote> {
    await this.initialize();
    try {
      const [updatedNote] = await db
        .update(medicalNotes)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(medicalNotes.visitId, visitId))
        .returning();
      return updatedNote;
    } catch (error) {
      console.error("❌ Database error in updateMedicalNote:", error);
      throw error;
    }
  }

  // Recordings
  async getRecording(visitId: number): Promise<Recording | undefined> {
    await this.initialize();
    try {
      const [recording] = await db.select().from(recordings).where(eq(recordings.visitId, visitId));
      return recording || undefined;
    } catch (error) {
      console.error("Database error in getRecording:", error);
      throw error;
    }
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    await this.initialize();
    try {
      const [newRecording] = await db.insert(recordings).values(recording).returning();
      return newRecording;
    } catch (error) {
      console.error("❌ Database error in createRecording:", error);
      throw error;
    }
  }

  // Templates
  async getTemplates(): Promise<MedicalTemplate[]> {
    await this.initialize();
    try {
      const templateList = await db.select().from(medicalTemplates).orderBy(medicalTemplates.name);
      console.log(`📋 Retrieved ${templateList.length} templates from database`);
      return templateList;
    } catch (error) {
      console.error("Database error in getTemplates:", error);
      throw error;
    }
  }

  async getTemplate(id: number): Promise<MedicalTemplate | undefined> {
    await this.initialize();
    try {
      const [template] = await db.select().from(medicalTemplates).where(eq(medicalTemplates.id, id));
      return template || undefined;
    } catch (error) {
      console.error("Database error in getTemplate:", error);
      throw error;
    }
  }

  async getTemplatesBySpecialty(specialty: string): Promise<MedicalTemplate[]> {
    await this.initialize();
    try {
      return await db
        .select()
        .from(medicalTemplates)
        .where(eq(medicalTemplates.specialty, specialty))
        .orderBy(medicalTemplates.name);
    } catch (error) {
      console.error("Database error in getTemplatesBySpecialty:", error);
      throw error;
    }
  }

  async createTemplate(template: InsertTemplate): Promise<MedicalTemplate> {
    await this.initialize();
    try {
      const [newTemplate] = await db.insert(medicalTemplates).values(template).returning();
      console.log("✅ Template created:", newTemplate.name);
      return newTemplate;
    } catch (error) {
      console.error("❌ Database error in createTemplate:", error);
      throw error;
    }
  }
}