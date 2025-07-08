// Dosya: server/database/storage.ts

import type { Doctor, Patient, Visit, MedicalNote, Recording, MedicalTemplate,
    InsertDoctor, InsertPatient, InsertVisit, InsertMedicalNote, InsertRecording, InsertTemplate
} from "@shared/schema";

// Bu interface, DatabaseStorage sınıfınızın implement ettiği metodları tanımlar.
// Eksik olan veya eklenecek metodlar varsa buraya eklenmelidir.
export interface IStorage {
    getDoctor(id: number): Promise<Doctor | undefined>;
    createDoctor(doctor: InsertDoctor): Promise<Doctor>;

    getPatient(id: number): Promise<Patient | undefined>;
    getPatients(): Promise<Patient[]>;
    createPatient(patient: InsertPatient): Promise<Patient>;
    deletePatient(id: number): Promise<void>;

    getVisit(id: number): Promise<Visit | undefined>;
    getVisitsByPatient(patientId: number): Promise<Visit[]>;
    getRecentVisits(limit?: number): Promise<(Visit & { patient: Patient })[]>;
    createVisit(visit: InsertVisit): Promise<Visit>;
    updateVisitStatus(id: number, status: string): Promise<Visit>;
    deleteVisit(id: number): Promise<void>;

    getMedicalNote(visitId: number): Promise<MedicalNote | undefined>;
    createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote>;
    updateMedicalNote(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote>;

    getRecording(visitId: number): Promise<Recording | undefined>;
    createRecording(recording: InsertRecording): Promise<Recording>;

    getTemplates(): Promise<MedicalTemplate[]>;
    getTemplate(id: number): Promise<MedicalTemplate | undefined>;
    getTemplatesBySpecialty(specialty: string): Promise<MedicalTemplate[]>;
    createTemplate(template: InsertTemplate): Promise<MedicalTemplate>;
}