/**
 * TıpScribe TypeScript Definitions
 * Centralized type definitions for the application
 */

// Import and re-export shared schema types
import type {
  Doctor,
  Patient,
  Visit,
  MedicalNote,
  Recording,
  MedicalTemplate,
  InsertDoctor,
  InsertPatient,
  InsertVisit,
  InsertMedicalNote,
  InsertRecording,
  InsertTemplate,
} from '@shared/schema';

export type {
  Doctor,
  Patient,
  Visit,
  MedicalNote,
  Recording,
  MedicalTemplate,
  InsertDoctor,
  InsertPatient,
  InsertVisit,
  InsertMedicalNote,
  InsertRecording,
  InsertTemplate,
};

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

// Medical Note Generation Types
export interface MedicalNoteGeneration {
  visitSummary: string;
  subjective: {
    complaint: string;
    currentComplaints: string;
    medicalHistory: string[];
    medications: string[];
    socialHistory?: string;
    reviewOfSystems?: string;
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

// Audio Recording Types
export interface TranscriptionResult {
  text: string;
  confidence: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

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