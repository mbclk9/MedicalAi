import { eq, desc } from "drizzle-orm";
import { db } from "@repo/db";
import { 
  doctors, 
  patients, 
  visits, 
  medicalNotes, 
  recordings, 
  medicalTemplates,
  type Doctor,
  type Patient,
  type Visit,
  type MedicalNote,
  type Recording,
  type MedicalTemplate,
  type InsertDoctor,
  type InsertPatient,
  type InsertVisit,
  type InsertMedicalNote,
  type InsertRecording,
  type InsertTemplate
} from "@repo/db";
import type { IStorage } from "../storage";

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    try {
      console.log("🔄 Initializing database...");
      await this.seedData();
      this.initialized = true;
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
    }
  }

  private async seedData() {
    try {
      // Check if doctors exist
      const existingDoctors = await db.select().from(doctors).limit(1);
      if (existingDoctors.length === 0) {
        // Seed default doctor
        await db.insert(doctors).values({
          name: "Dr. Mehmet Yılmaz",
          specialty: "Kardiyoloji",
          licenseNumber: "12345",
          email: "dr.mehmet@tipscribe.com"
        });
        console.log("✅ Default doctor seeded");
      }

      // Check if templates exist
      const existingTemplates = await db.select().from(medicalTemplates).limit(1);
      if (existingTemplates.length === 0) {
        // Seed default templates
        const defaultTemplates = [
          {
            name: "Kardiyoloji Muayene",
            specialty: "Kardiyoloji",
            description: "Kardiyoloji uzmanı için standart muayene şablonu",
            structure: {
              subjective: ["Göğüs ağrısı", "Nefes darlığı", "Çarpıntı"],
              objective: ["Nabız", "Kan basıncı", "Kalp sesleri"],
              assessment: ["EKG", "Ekokardiyografi"],
              plan: ["Tedavi önerisi", "Kontrol randevusu"]
            },
            isDefault: true
          },
          {
            name: "Genel Muayene",
            specialty: "Genel",
            description: "Genel dahiliye muayene şablonu",
            structure: {
              subjective: ["Ana şikayet", "Hastalık öyküsü"],
              objective: ["Fizik muayene", "Vital bulgular"],
              assessment: ["Tanı", "Ayırıcı tanı"],
              plan: ["Tedavi", "Takip"]
            },
            isDefault: true
          }
        ];

        await db.insert(medicalTemplates).values(defaultTemplates);
        console.log("✅ Default templates seeded");
      }
    } catch (error) {
      console.error("❌ Seed data error:", error);
    }
  }

  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    await this.initialize();
    try {
      return await db.select().from(doctors);
    } catch (error) {
      console.error("Database error in getDoctors:", error);
      throw error;
    }
  }

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
      return newDoctor;
    } catch (error) {
      console.error("Database error in createDoctor:", error);
      throw error;
    }
  }

  async updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor> {
    await this.initialize();
    try {
      const [updatedDoctor] = await db
        .update(doctors)
        .set(doctor)
        .where(eq(doctors.id, id))
        .returning();
      return updatedDoctor;
    } catch (error) {
      console.error("Database error in updateDoctor:", error);
      throw error;
    }
  }

  async deleteDoctor(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(doctors).where(eq(doctors.id, id));
    } catch (error) {
      console.error("Database error in deleteDoctor:", error);
      throw error;
    }
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    await this.initialize();
    try {
      return await db.select().from(patients);
    } catch (error) {
      console.error("Database error in getPatients:", error);
      throw error;
    }
  }

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

  async createPatient(patient: InsertPatient): Promise<Patient> {
    await this.initialize();
    try {
      const [newPatient] = await db.insert(patients).values(patient).returning();
      return newPatient;
    } catch (error) {
      console.error("Database error in createPatient:", error);
      throw error;
    }
  }

  async updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient> {
    await this.initialize();
    try {
      const [updatedPatient] = await db
        .update(patients)
        .set(patient)
        .where(eq(patients.id, id))
        .returning();
      return updatedPatient;
    } catch (error) {
      console.error("Database error in updatePatient:", error);
      throw error;
    }
  }

  async deletePatient(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(patients).where(eq(patients.id, id));
    } catch (error) {
      console.error("Database error in deletePatient:", error);
      throw error;
    }
  }

  // Visit operations
  async getVisits(): Promise<Visit[]> {
    await this.initialize();
    try {
      return await db.select().from(visits);
    } catch (error) {
      console.error("Database error in getVisits:", error);
      throw error;
    }
  }

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

  async createVisit(visit: InsertVisit): Promise<Visit> {
    await this.initialize();
    try {
      const [newVisit] = await db.insert(visits).values(visit).returning();
      return newVisit;
    } catch (error) {
      console.error("Database error in createVisit:", error);
      throw error;
    }
  }

  async updateVisit(id: number, visit: Partial<InsertVisit>): Promise<Visit> {
    await this.initialize();
    try {
      const [updatedVisit] = await db
        .update(visits)
        .set(visit)
        .where(eq(visits.id, id))
        .returning();
      return updatedVisit;
    } catch (error) {
      console.error("Database error in updateVisit:", error);
      throw error;
    }
  }

  async deleteVisit(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(visits).where(eq(visits.id, id));
    } catch (error) {
      console.error("Database error in deleteVisit:", error);
      throw error;
    }
  }

  async getVisitsByPatient(patientId: number): Promise<Visit[]> {
    await this.initialize();
    try {
      return await db
        .select()
        .from(visits)
        .where(eq(visits.patientId, patientId))
        .orderBy(desc(visits.visitDate));
    } catch (error) {
      console.error("Database error in getVisitsByPatient:", error);
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

  async getAllVisits(limit = 100): Promise<(Visit & { patient: Patient })[]> {
    await this.initialize();
    try {
      const results = await db
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
            createdAt: patients.createdAt
          }
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .orderBy(desc(visits.visitDate))
        .limit(limit);
      
      return results as (Visit & { patient: Patient })[];
    } catch (error) {
      console.error("Database error in getAllVisits:", error);
      throw error;
    }
  }

  async getRecentVisits(limit = 10): Promise<(Visit & { patient: Patient })[]> {
    await this.initialize();
    try {
      const results = await db
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
            createdAt: patients.createdAt
          }
        })
        .from(visits)
        .leftJoin(patients, eq(visits.patientId, patients.id))
        .orderBy(desc(visits.visitDate))
        .limit(limit);
      
      return results as (Visit & { patient: Patient })[];
    } catch (error) {
      console.error("Database error in getRecentVisits:", error);
      throw error;
    }
  }

  // Medical Note operations
  async getMedicalNotes(): Promise<MedicalNote[]> {
    await this.initialize();
    try {
      return await db.select().from(medicalNotes);
    } catch (error) {
      console.error("Database error in getMedicalNotes:", error);
      throw error;
    }
  }

  async getMedicalNote(visitId: number): Promise<MedicalNote | undefined> {
    await this.initialize();
    try {
      const [note] = await db
        .select()
        .from(medicalNotes)
        .where(eq(medicalNotes.visitId, visitId));
      return note || undefined;
    } catch (error) {
      console.error("Database error in getMedicalNote:", error);
      throw error;
    }
  }

  async getMedicalNoteByVisit(visitId: number): Promise<MedicalNote | undefined> {
    await this.initialize();
    try {
      const [note] = await db
        .select()
        .from(medicalNotes)
        .where(eq(medicalNotes.visitId, visitId));
      return note || undefined;
    } catch (error) {
      console.error("Database error in getMedicalNoteByVisit:", error);
      throw error;
    }
  }

  async createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote> {
    await this.initialize();
    try {
      const [newNote] = await db.insert(medicalNotes).values(note).returning();
      return newNote;
    } catch (error) {
      console.error("Database error in createMedicalNote:", error);
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
      console.error("Database error in updateMedicalNote:", error);
      throw error;
    }
  }

  async deleteMedicalNote(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(medicalNotes).where(eq(medicalNotes.id, id));
    } catch (error) {
      console.error("Database error in deleteMedicalNote:", error);
      throw error;
    }
  }

  // Recording operations
  async getRecordings(): Promise<Recording[]> {
    await this.initialize();
    try {
      return await db.select().from(recordings);
    } catch (error) {
      console.error("Database error in getRecordings:", error);
      throw error;
    }
  }

  async getRecording(visitId: number): Promise<Recording | undefined> {
    await this.initialize();
    try {
      const [recording] = await db
        .select()
        .from(recordings)
        .where(eq(recordings.visitId, visitId));
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

  async updateRecording(id: number, recording: Partial<InsertRecording>): Promise<Recording> {
    await this.initialize();
    try {
      const [updatedRecording] = await db
        .update(recordings)
        .set(recording)
        .where(eq(recordings.id, id))
        .returning();
      return updatedRecording;
    } catch (error) {
      console.error("Database error in updateRecording:", error);
      throw error;
    }
  }

  async deleteRecording(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(recordings).where(eq(recordings.id, id));
    } catch (error) {
      console.error("Database error in deleteRecording:", error);
      throw error;
    }
  }

  // Template operations
  async getTemplates(): Promise<MedicalTemplate[]> {
    await this.initialize();
    try {
      return await db.select().from(medicalTemplates);
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
        .where(eq(medicalTemplates.specialty, specialty));
    } catch (error) {
      console.error("Database error in getTemplatesBySpecialty:", error);
      throw error;
    }
  }

  async createTemplate(template: InsertTemplate): Promise<MedicalTemplate> {
    await this.initialize();
    try {
      const [newTemplate] = await db.insert(medicalTemplates).values(template).returning();
      return newTemplate;
    } catch (error) {
      console.error("Database error in createTemplate:", error);
      throw error;
    }
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<MedicalTemplate> {
    await this.initialize();
    try {
      const [updatedTemplate] = await db
        .update(medicalTemplates)
        .set(template)
        .where(eq(medicalTemplates.id, id))
        .returning();
      return updatedTemplate;
    } catch (error) {
      console.error("Database error in updateTemplate:", error);
      throw error;
    }
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.initialize();
    try {
      await db.delete(medicalTemplates).where(eq(medicalTemplates.id, id));
    } catch (error) {
      console.error("Database error in deleteTemplate:", error);
      throw error;
    }
  }
}

export const databaseStorage = new DatabaseStorage(); 