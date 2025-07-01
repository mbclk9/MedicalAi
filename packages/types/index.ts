// Export all types from schema
export * from './schema';

// Additional shared types for frontend/backend communication
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Audio and transcription types
export interface AudioFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
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
  duration?: number;
}

// Medical note generation types
export interface MedicalNoteRequest {
  transcription: string;
  visitId: number;
  templateId?: number;
}

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

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface AudioChunkEvent extends WebSocketEvent {
  type: 'audio-chunk';
  data: {
    chunk: ArrayBuffer;
    visitId: number;
  };
}

export interface TranscriptionUpdateEvent extends WebSocketEvent {
  type: 'transcription-update';
  data: {
    text: string;
    confidence: number;
    isFinal: boolean;
    visitId: number;
  };
}

// Health check types
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    database: boolean;
    deepgram: boolean;
    openai: boolean;
    anthropic: boolean;
  };
  timestamp: string;
  version: string;
}

// Configuration types
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  databaseUrl: string;
  corsOrigin: string;
  sessionSecret: string;
  maxFileSize: number;
  rateLimits: {
    general: number;
    transcription: number;
    ai: number;
  };
}

export interface ApiKeys {
  deepgram: string;
  openai: string;
  anthropic: string;
}