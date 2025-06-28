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
        await this.seedData();
        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize database:", error);
        this.initialized = true; // Prevent infinite retry
      }
    }
  }

  async seedData() {
    try {
      // Önce doktor verisi var mı kontrol edelim
      const existingDoctors = await db.select().from(doctors).limit(1);
      if (existingDoctors.length > 0) {
        return; // Veri zaten var, seed etmeye gerek yok
      }

      console.log("Seeding database with initial data...");

      // Varsayılan doktor oluştur
      await db.insert(doctors).values({
        name: "Dr. Mehmet Yılmaz",
        specialty: "Kardiyoloji",
        licenseNumber: "12345",
        email: "dr.mehmet@example.com",
      });

      // Örnek hasta verileri
      await db.insert(patients).values([
        {
          name: "Mesut",
          surname: "Çelik",
          tcKimlik: "12345678901",
          sgkNumber: "123456789",
          phone: "05551234567",
          birthDate: new Date("1985-05-15"),
        },
        {
          name: "Ayşe",
          surname: "Kaya", 
          tcKimlik: "98765432109",
          sgkNumber: "987654321",
          phone: "05559876543",
          birthDate: new Date("1990-08-20"),
        }
      ]);

      // Varsayılan şablonlar
      await db.insert(medicalTemplates).values([
        {
          name: "Akut Tıbbi Muayene",
          specialty: "Genel",
          description: "Acil durumlar için standart muayene şablonu",
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
          name: "Çocuk Doktoru Muayenesi",
          specialty: "Çocuk Doktoru",
          description: "Pediatrik hastalık değerlendirmesi",
          structure: {
            subjective: ["Ana şikayet", "Gelişim öyküsü", "Aşı durumu", "Beslenme"],
            objective: ["Büyüme parametreleri", "Fizik muayene", "Nörolojik muayene"],
            assessment: ["Gelişimsel değerlendirme", "Tanı", "Risk faktörleri"],
            plan: ["Tedavi", "Aşı planı", "Beslenme önerileri", "Takip"]
          },
          isDefault: false,
        }
      ]);

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Failed to seed database:", error);
    }
  }

  // Doctor management
  async getDoctor(id: number): Promise<Doctor | undefined> {
    await this.initialize();
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    await this.initialize();
    const [newDoctor] = await db.insert(doctors).values(doctor).returning();
    return newDoctor;
  }

  // Patient management
  async getPatient(id: number): Promise<Patient | undefined> {
    await this.initialize();
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatients(): Promise<Patient[]> {
    await this.initialize();
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    await this.initialize();
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async deletePatient(id: number): Promise<void> {
    await this.initialize();
    // İlişkili kayıtları da silmeli: önce bu hastanın ziyaretlerini bul
    const patientVisits = await db.select({ id: visits.id }).from(visits).where(eq(visits.patientId, id));
    
    // Her ziyaret için tıbbi notları ve ses kayıtlarını sil
    for (const visit of patientVisits) {
      await db.delete(medicalNotes).where(eq(medicalNotes.visitId, visit.id));
      await db.delete(recordings).where(eq(recordings.visitId, visit.id));
    }
    
    // Ziyaretleri sil
    await db.delete(visits).where(eq(visits.patientId, id));
    
    // Son olarak hastayı sil
    await db.delete(patients).where(eq(patients.id, id));
  }

  // Visit management
  async getVisit(id: number): Promise<Visit | undefined> {
    await this.initialize();
    const [visit] = await db.select().from(visits).where(eq(visits.id, id));
    return visit || undefined;
  }

  async getVisitsByPatient(patientId: number): Promise<Visit[]> {
    await this.initialize();
    return await db.select().from(visits).where(eq(visits.patientId, patientId)).orderBy(desc(visits.createdAt));
  }

  async getRecentVisits(limit = 10): Promise<(Visit & { patient: Patient })[]> {
    await this.initialize();
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
          sgkNumber: patients.sgkNumber,
          phone: patients.phone,
          createdAt: patients.createdAt,
        }
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .orderBy(desc(visits.createdAt))
      .limit(limit);

    return recentVisits;
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    await this.initialize();
    const [newVisit] = await db.insert(visits).values({
      ...visit,
      status: visit.status || "in_progress",
    }).returning();
    return newVisit;
  }

  async updateVisitStatus(id: number, status: string): Promise<Visit> {
    await this.initialize();
    const [updatedVisit] = await db
      .update(visits)
      .set({ status })
      .where(eq(visits.id, id))
      .returning();
    return updatedVisit;
  }

  async deleteVisit(id: number): Promise<void> {
    await this.initialize();
    // İlişkili kayıtları da silmeli: tıbbi notlar ve ses kayıtları
    await db.delete(medicalNotes).where(eq(medicalNotes.visitId, id));
    await db.delete(recordings).where(eq(recordings.visitId, id));
    await db.delete(visits).where(eq(visits.id, id));
  }

  // Medical notes
  async getMedicalNote(visitId: number): Promise<MedicalNote | undefined> {
    await this.initialize();
    const [note] = await db.select().from(medicalNotes).where(eq(medicalNotes.visitId, visitId));
    return note || undefined;
  }

  async createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote> {
    await this.initialize();
    const [newNote] = await db.insert(medicalNotes).values(note).returning();
    return newNote;
  }

  async updateMedicalNote(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote> {
    await this.initialize();
    const [updatedNote] = await db
      .update(medicalNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(medicalNotes.visitId, visitId))
      .returning();
    return updatedNote;
  }

  // Recordings
  async getRecording(visitId: number): Promise<Recording | undefined> {
    await this.initialize();
    const [recording] = await db.select().from(recordings).where(eq(recordings.visitId, visitId));
    return recording || undefined;
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    await this.initialize();
    const [newRecording] = await db.insert(recordings).values(recording).returning();
    return newRecording;
  }

  // Templates
  async getTemplates(): Promise<MedicalTemplate[]> {
    await this.initialize();
    return await db.select().from(medicalTemplates).orderBy(medicalTemplates.name);
  }

  async getTemplate(id: number): Promise<MedicalTemplate | undefined> {
    await this.initialize();
    const [template] = await db.select().from(medicalTemplates).where(eq(medicalTemplates.id, id));
    return template || undefined;
  }

  async getTemplatesBySpecialty(specialty: string): Promise<MedicalTemplate[]> {
    await this.initialize();
    return await db
      .select()
      .from(medicalTemplates)
      .where(eq(medicalTemplates.specialty, specialty))
      .orderBy(medicalTemplates.name);
  }

  async createTemplate(template: InsertTemplate): Promise<MedicalTemplate> {
    await this.initialize();
    const [newTemplate] = await db.insert(medicalTemplates).values(template).returning();
    return newTemplate;
  }
}