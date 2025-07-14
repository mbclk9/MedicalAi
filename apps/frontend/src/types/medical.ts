export interface Patient {
  id: number;
  name: string;
  surname: string;
  tcKimlik?: string;
  birthDate?: Date;
  sgkNumber?: string;
  phone?: string;
  createdAt?: Date;
}

export interface Doctor {
  id: number;
  name: string;
  title?: string;
  specialty: string;
  licenseNumber?: string;
  email?: string;
}

export interface Visit {
  id: number;
  patientId: number;
  doctorId: number;
  templateId?: number;
  visitDate?: Date;
  visitType: "ilk" | "kontrol" | "konsultasyon";
  duration?: number;
  status: "in_progress" | "completed" | "cancelled";
  patient?: Patient;
}

export interface MedicalTemplate {
  id: number;
  name: string;
  specialty: string;
  description?: string;
  structure: {
    subjective: string[];
    objective: string[];
    assessment: string[];
    plan: string[];
  };
  isDefault?: boolean;
}

export interface MedicalNote {
  id: number;
  visitId: number;
  transcription?: string;
  visitSummary?: string;
  subjective?: {
    complaint: string;
    currentComplaints: string;
    medicalHistory: string[];
    medications: string[];
    socialHistory?: string;
    reviewOfSystems?: string;
  };
  objective?: {
    vitalSigns: Record<string, string>;
    physicalExam: string;
    diagnosticResults: Array<{
      test: string;
      results: string[];
    }>;
  };
  assessment?: {
    general: string;
    diagnoses: Array<{
      diagnosis: string;
      icd10Code?: string;
      type: "ana" | "yan" | "komplikasyon";
    }>;
  };
  plan?: {
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
  generatedAt?: Date;
  updatedAt?: Date;
}

export interface Recording {
  id: number;
  visitId: number;
  duration?: number;
  transcription?: string;
  audioUrl?: string;
  recordedAt?: Date;
}

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

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcription: string;
  confidence: number;
}
