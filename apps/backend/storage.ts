import type {
  Doctor, Patient, Visit, MedicalNote, Recording, MedicalTemplate,
  InsertDoctor, InsertPatient, InsertVisit, InsertMedicalNote, InsertRecording, InsertTemplate
} from "@repo/db";
import { DatabaseStorage } from "./src/database/databaseStorage";

export interface IStorage {
  // Doctor management
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Patient management
  getPatient(id: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  deletePatient(id: number): Promise<void>;
  
  // Visit management
  getVisit(id: number): Promise<Visit | undefined>;
  getVisitsByPatient(patientId: number): Promise<Visit[]>;
  getRecentVisits(limit?: number): Promise<(Visit & { patient: Patient })[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisitStatus(id: number, status: string): Promise<Visit>;
  deleteVisit(id: number): Promise<void>;
  
  // Medical notes
  getMedicalNote(visitId: number): Promise<MedicalNote | undefined>;
  createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote>;
  updateMedicalNote(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote>;
  
  // Recordings
  getRecording(visitId: number): Promise<Recording | undefined>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  
  // Templates
  getTemplates(): Promise<MedicalTemplate[]>;
  getTemplate(id: number): Promise<MedicalTemplate | undefined>;
  getTemplatesBySpecialty(specialty: string): Promise<MedicalTemplate[]>;
  createTemplate(template: InsertTemplate): Promise<MedicalTemplate>;
}

export const storage: IStorage = new DatabaseStorage();