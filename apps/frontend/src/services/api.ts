/**
 * TıpScribe API Service Layer
 * Centralized API communication functions
 */

import { Patient, Visit, MedicalNote, MedicalTemplate, Doctor } from '@repo/db';

interface VisitDetails {
  visit: Visit;
  patient: Patient;
  medicalNote?: MedicalNote;
  recording?: any;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest(method: string, endpoint: string, data?: any) {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookies
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'API request failed');
  }

  return response;
}

// Patient API
export const patientApi = {
  async getAll(): Promise<Patient[]> {
    const response = await apiRequest('GET', '/patients');
    return response.json();
  },

  async getById(id: number): Promise<Patient> {
    const response = await apiRequest('GET', `/patients/${id}`);
    return response.json();
  },

  async create(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    const response = await apiRequest('POST', '/patients', patient);
    return response.json();
  },

  async update(id: number, patient: Partial<Patient>): Promise<Patient> {
    const response = await apiRequest('PUT', `/patients/${id}`, patient);
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await apiRequest('DELETE', `/patients/${id}`);
  }
};

// Visit API
export const visitApi = {
  async getAll(): Promise<Visit[]> {
    const response = await apiRequest('GET', '/visits');
    return response.json();
  },

  async getRecent(limit = 10): Promise<(Visit & { patient: Patient })[]> {
    const response = await apiRequest('GET', `/visits/recent?limit=${limit}`);
    return response.json();
  },

  async getById(id: number): Promise<VisitDetails> {
    const response = await apiRequest('GET', `/visits/${id}`);
    return response.json();
  },

  async getByPatient(patientId: number): Promise<Visit[]> {
    const response = await apiRequest('GET', `/visits/patient/${patientId}`);
    return response.json();
  },

  async create(visit: {
    patientId: number;
    doctorId: number;
    templateId?: number;
    visitType: string;
  }): Promise<Visit> {
    const response = await apiRequest('POST', '/visits', visit);
    return response.json();
  },

  async updateStatus(id: number, status: string): Promise<Visit> {
    const response = await apiRequest('PUT', `/visits/${id}/status`, { status });
    return response.json();
  },

  async delete(id: number): Promise<void> {
    await apiRequest('DELETE', `/visits/${id}`);
  }
};

// Medical Note API
export const medicalNoteApi = {
  async getByVisit(visitId: number): Promise<MedicalNote | null> {
    try {
      const response = await apiRequest('GET', `/medical-notes/${visitId}`);
      return response.json();
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async create(note: {
    visitId: number;
    transcription?: string;
    generatedNote?: any;
  }): Promise<MedicalNote> {
    const response = await apiRequest('POST', '/medical-notes', note);
    return response.json();
  },

  async update(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote> {
    const response = await apiRequest('PUT', `/medical-notes/${visitId}`, updates);
    return response.json();
  },

  async generateFromTranscription(data: {
    transcription: string;
    visitId: number;
    templateId?: number;
  }): Promise<any> {
    const response = await apiRequest('POST', '/generate-note', data);
    return response.json();
  }
};

// Recording & Transcription API
export const recordingApi = {
  async transcribe(audioFile: File, language = 'tr'): Promise<{
    text: string;
    confidence: number;
  }> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);

    const response = await fetch(`${API_BASE}/transcribe`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Transcription failed');
    }

    return response.json();
  },

  async saveRecording(data: {
    visitId: number;
    audioFile: File;
    transcription?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('visitId', data.visitId.toString());
    formData.append('audio', data.audioFile);
    if (data.transcription) {
      formData.append('transcription', data.transcription);
    }

    const response = await fetch(`${API_BASE}/recordings`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Recording save failed');
    }

    return response.json();
  }
};

// Template API
export const templateApi = {
  async getAll(): Promise<MedicalTemplate[]> {
    const response = await apiRequest('GET', '/templates');
    return response.json();
  },

  async getById(id: number): Promise<MedicalTemplate> {
    const response = await apiRequest('GET', `/templates/${id}`);
    return response.json();
  },

  async getBySpecialty(specialty: string): Promise<MedicalTemplate[]> {
    const response = await apiRequest('GET', `/templates/specialty/${encodeURIComponent(specialty)}`);
    return response.json();
  },

  async create(template: Omit<MedicalTemplate, 'id' | 'createdAt'>): Promise<MedicalTemplate> {
    const response = await apiRequest('POST', '/templates', template);
    return response.json();
  }
};

// Doctor API
export const doctorApi = {
  async getCurrent(): Promise<Doctor> {
    const response = await apiRequest('GET', '/doctor');
    return response.json();
  },

  async getById(id: number): Promise<Doctor> {
    const response = await apiRequest('GET', `/doctors/${id}`);
    return response.json();
  }
};

export { ApiError };
export default {
  patient: patientApi,
  visit: visitApi,
  medicalNote: medicalNoteApi,
  recording: recordingApi,
  template: templateApi,
  doctor: doctorApi,
};