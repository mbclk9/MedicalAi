# TıpScribe API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
TıpScribe uses session-based authentication. All requests must include session cookies.

## Error Responses
All endpoints return errors in the following format:
```json
{
  "error": "Error message",
  "status": 400
}
```

## Endpoints

### Doctor Management

#### Get Current Doctor
```http
GET /api/doctor
```

**Response:**
```json
{
  "id": 1,
  "name": "Dr. Mehmet Yılmaz",
  "specialty": "Dahiliye",
  "licenseNumber": "TR123456789",
  "email": "mehmet.yilmaz@tipscribe.com",
  "createdAt": "2025-06-28T10:00:00.000Z"
}
```

### Patient Management

#### Get All Patients
```http
GET /api/patients
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Ahmet",
    "surname": "Yılmaz",
    "tcKimlik": "12345678901",
    "birthDate": "1980-05-15T00:00:00.000Z",
    "gender": "erkek",
    "phone": "+90 555 111 2233",
    "email": "ahmet.yilmaz@email.com",
    "address": "Çankaya, Ankara",
    "sgkNumber": null,
    "createdAt": "2025-06-28T10:00:00.000Z"
  }
]
```

#### Get Patient by ID
```http
GET /api/patients/:id
```

#### Create New Patient
```http
POST /api/patients
```

**Request Body:**
```json
{
  "name": "Fatma",
  "surname": "Kaya",
  "tcKimlik": "98765432109",
  "birthDate": "1975-08-22T00:00:00.000Z",
  "gender": "kadın",
  "phone": "+90 555 444 5566",
  "email": "fatma.kaya@email.com",
  "address": "Kadıköy, İstanbul"
}
```

#### Update Patient
```http
PUT /api/patients/:id
```

#### Delete Patient
```http
DELETE /api/patients/:id
```

### Visit Management

#### Get Recent Visits
```http
GET /api/visits/recent?limit=10
```

**Response:**
```json
[
  {
    "id": 1,
    "patientId": 1,
    "doctorId": 1,
    "templateId": 1,
    "visitDate": "2025-06-28T14:30:00.000Z",
    "visitType": "ilk",
    "duration": 1800,
    "status": "completed",
    "createdAt": "2025-06-28T14:30:00.000Z",
    "patient": {
      "id": 1,
      "name": "Ahmet",
      "surname": "Yılmaz",
      "tcKimlik": "12345678901"
    }
  }
]
```

#### Get Visits by Patient
```http
GET /api/visits/patient/:patientId
```

#### Create New Visit
```http
POST /api/visits
```

**Request Body:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "templateId": 1,
  "visitType": "ilk"
}
```

#### Update Visit Status
```http
PUT /api/visits/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Delete Visit
```http
DELETE /api/visits/:id
```

### Audio Recording & Transcription

#### Transcribe Audio
```http
POST /api/transcribe
```

**Request:** Multipart form data
- `audio`: Audio file (WebM format)
- `language`: Language code (default: "tr")

**Response:**
```json
{
  "text": "Hasta göğüs ağrısından şikayetçi. Üç gündür devam eden ağrı...",
  "confidence": 0.95,
  "words": [
    {
      "word": "Hasta",
      "start": 0.1,
      "end": 0.5,
      "confidence": 0.98
    }
  ]
}
```

#### Save Recording
```http
POST /api/recordings
```

**Request:** Multipart form data
- `visitId`: Visit ID
- `audio`: Audio file
- `transcription`: Transcribed text (optional)

### Medical Note Generation

#### Generate Medical Note from Transcription
```http
POST /api/generate-note
```

**Request Body:**
```json
{
  "transcription": "Hasta göğüs ağrısından şikayetçi...",
  "visitId": 1,
  "templateId": 1
}
```

**Response:**
```json
{
  "visitSummary": "45 yaşında erkek hasta göğüs ağrısı şikayeti ile değerlendirildi...",
  "subjective": {
    "complaint": "Göğüs ağrısı",
    "currentComplaints": "3 gündür devam eden göğüs ağrısı...",
    "medicalHistory": ["Hipertansiyon", "Diyabet tip 2"],
    "medications": ["Lisinopril 10mg", "Metformin 1000mg"],
    "socialHistory": "Sigara içmiyor, alkol kullanmıyor",
    "reviewOfSystems": "Nefes darlığı, çarpıntı yok"
  },
  "objective": {
    "vitalSigns": {
      "nabız": "78/dk",
      "tansiyon": "130/80 mmHg",
      "ateş": "36.5°C",
      "solunum": "18/dk"
    },
    "physicalExam": "Kardiyovasküler sistem muayenesi normal...",
    "diagnosticResults": [
      {
        "test": "EKG",
        "results": ["Normal sinüs ritmi", "ST segment değişikliği yok"]
      }
    ]
  },
  "assessment": {
    "general": "Atipik göğüs ağrısı, kardiyak nedenli görünmüyor",
    "diagnoses": [
      {
        "diagnosis": "Atipik göğüs ağrısı",
        "icd10Code": "R06.02",
        "type": "ana"
      }
    ]
  },
  "plan": {
    "treatment": ["Semptomatik tedavi", "Stres testi önerisi"],
    "medications": [
      {
        "name": "İbuprofen",
        "dosage": "400mg",
        "frequency": "Günde 2 kez",
        "duration": "5 gün"
      }
    ],
    "followUp": "1 hafta sonra kontrol",
    "lifestyle": ["Düzenli egzersiz", "Stres yönetimi"]
  }
}
```

#### Get Medical Note by Visit
```http
GET /api/medical-notes/:visitId
```

#### Update Medical Note
```http
PUT /api/medical-notes/:visitId
```

### Template Management

#### Get All Templates
```http
GET /api/templates
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Dahiliye Genel Muayene",
    "specialty": "Dahiliye",
    "description": "Dahiliye branşı için genel muayene şablonu",
    "structure": {
      "subjective": {
        "complaint": "Ana şikayet",
        "currentComplaints": "Mevcut şikayetler detayı"
      }
    },
    "isDefault": true,
    "createdAt": "2025-06-28T10:00:00.000Z"
  }
]
```

#### Get Templates by Specialty
```http
GET /api/templates/specialty/:specialty
```

#### Get Template by ID
```http
GET /api/templates/:id
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error - Server-side issue |

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- 100 requests per minute per IP for general endpoints
- 10 requests per minute for transcription endpoints
- 50 requests per minute for medical note generation

## File Upload Limits

- Maximum file size: 50MB
- Supported audio formats: WebM, MP3, WAV
- Maximum transcription length: 30 minutes

## WebSocket Events

### Real-time Transcription
```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Listen for transcription updates
socket.on('transcription-update', (data) => {
  console.log('Partial transcription:', data.text);
});

// Send audio chunks for real-time processing
socket.emit('audio-chunk', audioData);
```

## SDK Usage Examples

### JavaScript/TypeScript
```typescript
import api from './services/api';

// Create a new patient
const patient = await api.patient.create({
  name: 'Ahmet',
  surname: 'Yılmaz',
  tcKimlik: '12345678901',
  birthDate: new Date('1980-05-15'),
  gender: 'erkek',
  phone: '+90 555 111 2233',
  email: 'ahmet.yilmaz@email.com',
  address: 'Çankaya, Ankara'
});

// Start a new visit
const visit = await api.visit.create({
  patientId: patient.id,
  doctorId: 1,
  templateId: 1,
  visitType: 'ilk'
});

// Transcribe audio
const transcription = await api.recording.transcribe(audioFile);

// Generate medical note
const medicalNote = await api.medicalNote.generateFromTranscription({
  transcription: transcription.text,
  visitId: visit.id,
  templateId: 1
});
```