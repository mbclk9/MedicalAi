/**
 * TıpScribe TypeScript Definitions
 *
 * This file re-exports all shared types from the central @repo/db package
 * for use across the frontend application. It also defines frontend-specific
 * types for UI components, form data, and other client-side concerns.
 */

// Import and re-export all shared database types and schemas
export * from "@repo/db";

// Re-export specific types for clarity if needed, though '*' is generally sufficient
import type { Patient as DbPatient, MedicalTemplate as DbMedicalTemplate, Visit as DbVisit, MedicalNote as DbMedicalNote } from '@repo/db';
export type Patient = DbPatient;
export type MedicalTemplate = DbMedicalTemplate;
export type Visit = DbVisit;
export type MedicalNote = DbMedicalNote;


// --- Frontend-Specific Types ---

// Represents the structure of the AI-generated medical note content
export interface MedicalNoteGeneration {
  visitSummary: string;
  subjective: {
    complaint: string;
    currentComplaints: string;
    medicalHistory: string[];
    medications: string[];
  };
  objective: {
    vitalSigns: Record<string, string>;
    physicalExam: string;
    diagnosticResults: Array<{
      test: string;
      results: string[];
    }>;
  };
  assessment: {
    general: string;
    diagnoses: Array<{
      diagnosis: string;
      icd10Code?: string;
      type: "ana" | "yan" | "komplikasyon";
    }>;
  };
  plan: {
    treatment: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
    }>;
    followUp: string;
    lifestyle: string[];
  };
}

// State for the audio recording hook
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcription: string;
  confidence: number;
}

// Result from the transcription service
export interface TranscriptionResult {
  text: string;
  confidence: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Audio Recording Types
export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  transcription: string;
  isTranscribing: boolean;
  error: string | null;
}

// UI Component Props Types
export interface PatientSelectProps {
  value?: Patient | null;
  onSelect: (patient: Patient | null) => void;
  patients: Patient[];
  disabled?: boolean;
}

export interface TemplateSelectProps {
  value?: MedicalTemplate | null;
  onSelect: (template: MedicalTemplate) => void;
  templates: MedicalTemplate[];
  specialty?: string;
  disabled?: boolean;
}

export interface MedicalNoteEditorProps {
  visit: Visit;
  patient: Patient;
  medicalNote?: MedicalNote;
  template?: MedicalTemplate;
  transcription?: string;
  onSave?: (note: MedicalNote) => void;
}

export interface RecordingControlsProps {
  onTranscriptionReady?: (transcription: string) => void;
  visitId?: number;
  templateId?: number;
  disabled?: boolean;
}

// Form Types
export interface PatientFormData {
  name: string;
  surname: string;
  tcKimlik?: string;
  birthDate?: Date;
  gender?: 'erkek' | 'kadın';
  phone?: string;
  email?: string;
  address?: string;
  sgkNumber?: string;
}

export interface VisitFormData {
  patientId: number;
  doctorId: number;
  templateId?: number;
  visitType: 'ilk' | 'kontrol' | 'konsultasyon';
}

// Navigation Types
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  href: string;
  active?: boolean;
  badge?: string | number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Search and Filter Types
export interface PatientSearchFilters {
  query?: string;
  gender?: 'erkek' | 'kadın';
  ageRange?: { min: number; max: number };
  hasActiveVisits?: boolean;
}

export interface VisitSearchFilters {
  patientId?: number;
  doctorId?: number;
  visitType?: string;
  status?: string;
  dateRange?: { start: Date; end: Date };
}

// Chart and Analytics Types
export interface VisitStatistics {
  totalVisits: number;
  completedVisits: number;
  averageDuration: number;
  visitsByType: Record<string, number>;
  visitsBySpecialty: Record<string, number>;
  dailyVisits: Array<{ date: string; count: number }>;
}

export interface TranscriptionMetrics {
  totalTranscriptions: number;
  averageConfidence: number;
  averageProcessingTime: number;
  errorRate: number;
}

// Medical Specialty Types
export type MedicalSpecialty =
  | 'Dahiliye'
  | 'Kardiyoloji'
  | 'Nöroloji'
  | 'Endokrinoloji'
  | 'Gastroenteroloji'
  | 'Göğüs Hastalıkları'
  | 'Üroloji'
  | 'Kadın Doğum'
  | 'Çocuk Sağlığı ve Hastalıkları'
  | 'Psikiyatri'
  | 'Dermatoloji'
  | 'Göz Hastalıkları'
  | 'Kulak Burun Boğaz'
  | 'Ortopedi'
  | 'Genel Cerrahi';

// Visit Types
export type VisitType = 'ilk' | 'kontrol' | 'konsultasyon';

// Visit Status
export type VisitStatus = 'in_progress' | 'completed' | 'cancelled';

// Gender Types
export type Gender = 'erkek' | 'kadın';

// Notification Types
export interface NotificationProps {
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Pagination Types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
}