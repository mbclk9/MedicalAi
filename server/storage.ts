import { 
  doctors, patients, visits, medicalNotes, recordings, medicalTemplates,
  type Doctor, type Patient, type Visit, type MedicalNote, type Recording, type MedicalTemplate,
  type InsertDoctor, type InsertPatient, type InsertVisit, type InsertMedicalNote, type InsertRecording, type InsertTemplate
} from "@shared/schema";

export interface IStorage {
  // Doctor management
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Patient management
  getPatient(id: number): Promise<Patient | undefined>;
  getPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Visit management
  getVisit(id: number): Promise<Visit | undefined>;
  getVisitsByPatient(patientId: number): Promise<Visit[]>;
  getRecentVisits(limit?: number): Promise<(Visit & { patient: Patient })[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisitStatus(id: number, status: string): Promise<Visit>;
  
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

export class MemStorage implements IStorage {
  private doctors: Map<number, Doctor> = new Map();
  private patients: Map<number, Patient> = new Map();
  private visits: Map<number, Visit> = new Map();
  private medicalNotes: Map<number, MedicalNote> = new Map();
  private recordings: Map<number, Recording> = new Map();
  private templates: Map<number, MedicalTemplate> = new Map();
  
  private currentDoctorId = 1;
  private currentPatientId = 1;
  private currentVisitId = 1;
  private currentNoteId = 1;
  private currentRecordingId = 1;
  private currentTemplateId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default doctor
    const defaultDoctor: Doctor = {
      id: this.currentDoctorId++,
      name: "Dr. Mehmet Yılmaz",
      specialty: "Kardiyoloji",
      licenseNumber: "12345",
      email: "mehmet.yilmaz@hospital.tr",
      createdAt: new Date(),
    };
    this.doctors.set(defaultDoctor.id, defaultDoctor);

    // Create sample patients
    const samplePatients: Patient[] = [
      {
        id: this.currentPatientId++,
        name: "Mesut",
        surname: "Çelik",
        tcKimlik: "12345678901",
        birthDate: new Date("1975-03-15"),
        sgkNumber: "123456789",
        phone: "05551234567",
        createdAt: new Date(),
      },
      {
        id: this.currentPatientId++,
        name: "Ayşe",
        surname: "Kaya",
        tcKimlik: "98765432109",
        birthDate: new Date("1980-07-22"),
        sgkNumber: "987654321",
        phone: "05559876543",
        createdAt: new Date(),
      },
      {
        id: this.currentPatientId++,
        name: "Ahmed",
        surname: "Yılmaz",
        tcKimlik: "11122233344",
        birthDate: new Date("1965-12-05"),
        sgkNumber: "111222333",
        phone: "05551122334",
        createdAt: new Date(),
      },
    ];

    samplePatients.forEach(patient => {
      this.patients.set(patient.id, patient);
    });

    // Create comprehensive default templates like Freed.ai
    const defaultTemplates: MedicalTemplate[] = [
      {
        id: this.currentTemplateId++,
        name: "Akut Tıbbi Muayene",
        specialty: "Acil Tıp",
        description: "Acil servise başvuran hastalar için kapsamlı muayene şablonu",
        structure: {
          subjective: [
            "Ana şikayet ve süresi",
            "Semptomların detaylı tanımı",
            "Tetikleyici faktörler",
            "Geçmiş tıbbi öykü",
            "Kullandığı ilaçlar",
            "Alerji öyküsü",
            "Sosyal öykü (sigara, alkol, madde kullanımı)"
          ],
          objective: [
            "Vital bulgular (TA, nabız, ateş, solunum, oksijen saturasyonu)",
            "Genel görünüm ve bilinç durumu",
            "Baş-boyun muayenesi",
            "Kardiyovasküler sistem",
            "Solunum sistemi",
            "Abdomen muayenesi",
            "Nörolojik muayene",
            "Ekstremite muayenesi",
            "Laboratuvar sonuçları",
            "Görüntüleme sonuçları"
          ],
          assessment: [
            "Primer tanı",
            "Ayırıcı tanılar",
            "Risk faktörleri",
            "Prognoz değerlendirmesi"
          ],
          plan: [
            "Acil müdahale planı",
            "İlaç tedavisi",
            "Takip planı",
            "Hasta eğitimi",
            "Konsültasyon ihtiyacı",
            "Taburculuk kriterleri"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTemplateId++,
        name: "Takip Muayenesi",
        specialty: "Genel Tıp",
        description: "Mevcut hastalığı olan hastaların kontrol muayenesi",
        structure: {
          subjective: [
            "Son kontrolden bu yana değişiklikler",
            "Mevcut şikayetler",
            "İlaç uyumu ve yan etkiler",
            "Yaşam kalitesi değerlendirmesi",
            "Semptom kontrolü"
          ],
          objective: [
            "Vital bulgular karşılaştırması",
            "Hedeflenmiş fizik muayene",
            "Laboratuvar takibi",
            "Kontrol görüntüleme",
            "Fonksiyonel değerlendirme"
          ],
          assessment: [
            "Hastalık seyrinin değerlendirmesi",
            "Tedavi yanıtı",
            "Komplikasyon değerlendirmesi",
            "Risk faktörlerinde değişiklik"
          ],
          plan: [
            "Tedavi optimizasyonu",
            "Yaşam tarzı önerileri",
            "Sonraki kontrol zamanı",
            "Ek tetkik ihtiyacı",
            "Hasta eğitimi güncelleme"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTemplateId++,
        name: "Yeni Hasta Muayenesi",
        specialty: "Genel Tıp",
        description: "İlk kez gelen hastaların kapsamlı değerlendirmesi",
        structure: {
          subjective: [
            "Ana şikayet",
            "Mevcut hastalık öyküsü detayı",
            "Geçmiş tıbbi öykü",
            "Cerrahi öykü",
            "Aile öyküsü",
            "Sosyal öykü",
            "Mesleki öykü",
            "Kullandığı ilaçlar",
            "Alerji öyküsü",
            "Sistem sorgusu (ROS)"
          ],
          objective: [
            "Vital bulgular",
            "Genel görünüm",
            "HEENT muayenesi",
            "Kardiyovasküler sistem",
            "Solunum sistemi",
            "Gastrointestinal sistem",
            "Genitoüriner sistem",
            "Kas-iskelet sistemi",
            "Nörolojik muayene",
            "Cilt muayenesi",
            "Laboratuvar sonuçları"
          ],
          assessment: [
            "Problem listesi",
            "Tanı hipotezleri",
            "Risk stratifikasyonu",
            "Fonksiyonel durum"
          ],
          plan: [
            "Tanısal yaklaşım",
            "Tedavi planı",
            "Önleyici bakım",
            "Hasta eğitimi",
            "Takip sıklığı",
            "Konsültasyon planı"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTemplateId++,
        name: "Kardiyoloji Kontrolü",
        specialty: "Kardiyoloji",
        description: "Kardiyovasküler hastalıkları olan hastaların özel takibi",
        structure: {
          subjective: [
            "Kardiyak semptomlar (göğüs ağrısı, nefes darlığı, çarpıntı)",
            "Egzersiz kapasitesi değişimi",
            "Ödem, ortopne, PND",
            "Senkop/presenkop öyküsü",
            "İlaç uyumu (ACE inhibitörü, beta-bloker, diüretik)",
            "Diyet kontrolü (tuz kısıtlaması)",
            "Sigara, alkol kullanımı"
          ],
          objective: [
            "Vital bulgular (kan basıncı, nabız, kilo)",
            "Kalp sesleri ve üfürüm",
            "JVD ve hepatojugular reflü",
            "Akciğer oskültasyonu",
            "Ödem muayenesi",
            "Periferik nabızlar",
            "EKG bulguları",
            "Ekokardiyografi sonuçları",
            "Lab değerleri (BNP, troponin, lipid profili)"
          ],
          assessment: [
            "Kalp yetmezliği NYHA sınıfı",
            "Aritmi değerlendirmesi",
            "İskemik risk değerlendirmesi",
            "Hipertansiyon kontrolü",
            "Lipid hedeflerine ulaşım"
          ],
          plan: [
            "Medikal tedavi optimizasyonu",
            "Diyet ve egzersiz önerileri",
            "Aritmi yönetimi",
            "Risk faktörü modifikasyonu",
            "Kontrol EKG/Eko planı",
            "Invaziv girişim değerlendirmesi"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTemplateId++,
        name: "Pediatri Muayenesi",
        specialty: "Pediatri",
        description: "Çocuk hastaların gelişim odaklı değerlendirmesi",
        structure: {
          subjective: [
            "Ana şikayet (ebeveyn/çocuk perspektifi)",
            "Doğum öyküsü",
            "Büyüme-gelişim mihenk taşları",
            "Beslenme öyküsü",
            "Aşı durumu",
            "Aile öyküsü",
            "Sosyal gelişim",
            "Okul performansı (yaş uygunsa)"
          ],
          objective: [
            "Vital bulgular (yaşa göre)",
            "Büyüme parametreleri (boy, kilo, baş çevresi)",
            "Gelişim değerlendirmesi",
            "Genel görünüm ve davranış",
            "HEENT muayenesi",
            "Kardiyopulmoner muayene",
            "Abdomen ve GUS",
            "Nörolojik gelişim",
            "Kas-iskelet sistemi"
          ],
          assessment: [
            "Büyüme-gelişim durumu",
            "Akut/kronik sağlık sorunları",
            "Beslenme durumu",
            "Psikososyal durum"
          ],
          plan: [
            "Tedavi önerileri",
            "Beslenme danışmanlığı",
            "Gelişim destekleme",
            "Aşı güncelleme",
            "Ebeveyn eğitimi",
            "Kontrol takibi"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      },
      {
        id: this.currentTemplateId++,
        name: "İç Hastalıkları Konsültasyonu",
        specialty: "İç Hastalıkları",
        description: "Kompleks dahili hastalıkların multidisipliner yaklaşımı",
        structure: {
          subjective: [
            "Konsültasyon nedeni",
            "Detaylı hastalık öyküsü",
            "Sistemik semptomlar",
            "Komorbidite değerlendirmesi",
            "İlaç etkileşimleri",
            "Psikososyal faktörler"
          ],
          objective: [
            "Kapsamlı fizik muayene",
            "Sistemik bulgular",
            "Laboratuvar analizi",
            "Görüntüleme değerlendirmesi",
            "Fonksiyonel kapasite"
          ],
          assessment: [
            "Problem-odaklı değerlendirme",
            "Ayırıcı tanı",
            "Risk-fayda analizi",
            "Prognoz değerlendirmesi"
          ],
          plan: [
            "Entegre tedavi yaklaşımı",
            "Disiplinler arası koordinasyon",
            "Monitörizasyon planı",
            "Hasta ve aile eğitimi",
            "Uzun dönem strateji"
          ]
        },
        isDefault: true,
        createdAt: new Date(),
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Create sample visits
    const now = new Date();
    const sampleVisits: Visit[] = [
      {
        id: this.currentVisitId++,
        patientId: 1,
        doctorId: 1,
        templateId: 1,
        visitDate: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
        visitType: "kontrol",
        duration: 120, // 2 minutes
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: this.currentVisitId++,
        patientId: 2,
        doctorId: 1,
        templateId: 2,
        visitDate: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        visitType: "kontrol",
        duration: 300, // 5 minutes
        status: "completed",
        createdAt: new Date(),
      },
      {
        id: this.currentVisitId++,
        patientId: 3,
        doctorId: 1,
        templateId: 1,
        visitDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        visitType: "kontrol",
        duration: 180, // 3 minutes
        status: "completed",
        createdAt: new Date(),
      },
    ];

    sampleVisits.forEach(visit => {
      this.visits.set(visit.id, visit);
    });
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const newDoctor: Doctor = {
      ...doctor,
      id: this.currentDoctorId++,
      createdAt: new Date(),
    };
    this.doctors.set(newDoctor.id, newDoctor);
    return newDoctor;
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: this.currentPatientId++,
      createdAt: new Date(),
    };
    this.patients.set(newPatient.id, newPatient);
    return newPatient;
  }

  async getVisit(id: number): Promise<Visit | undefined> {
    return this.visits.get(id);
  }

  async getVisitsByPatient(patientId: number): Promise<Visit[]> {
    return Array.from(this.visits.values()).filter(visit => visit.patientId === patientId);
  }

  async getRecentVisits(limit = 10): Promise<(Visit & { patient: Patient })[]> {
    const visits = Array.from(this.visits.values())
      .sort((a, b) => new Date(b.visitDate!).getTime() - new Date(a.visitDate!).getTime())
      .slice(0, limit);

    return visits.map(visit => ({
      ...visit,
      patient: this.patients.get(visit.patientId)!,
    }));
  }

  async createVisit(visit: InsertVisit): Promise<Visit> {
    const newVisit: Visit = {
      ...visit,
      id: this.currentVisitId++,
      visitDate: new Date(),
      createdAt: new Date(),
    };
    this.visits.set(newVisit.id, newVisit);
    return newVisit;
  }

  async updateVisitStatus(id: number, status: string): Promise<Visit> {
    const visit = this.visits.get(id);
    if (!visit) throw new Error("Visit not found");
    
    const updatedVisit = { ...visit, status };
    this.visits.set(id, updatedVisit);
    return updatedVisit;
  }

  async getMedicalNote(visitId: number): Promise<MedicalNote | undefined> {
    return Array.from(this.medicalNotes.values()).find(note => note.visitId === visitId);
  }

  async createMedicalNote(note: InsertMedicalNote): Promise<MedicalNote> {
    const newNote: MedicalNote = {
      ...note,
      id: this.currentNoteId++,
      generatedAt: new Date(),
      updatedAt: new Date(),
    };
    this.medicalNotes.set(newNote.id, newNote);
    return newNote;
  }

  async updateMedicalNote(visitId: number, updates: Partial<MedicalNote>): Promise<MedicalNote> {
    const existingNote = Array.from(this.medicalNotes.values()).find(note => note.visitId === visitId);
    if (!existingNote) throw new Error("Medical note not found");

    const updatedNote = { ...existingNote, ...updates, updatedAt: new Date() };
    this.medicalNotes.set(existingNote.id, updatedNote);
    return updatedNote;
  }

  async getRecording(visitId: number): Promise<Recording | undefined> {
    return Array.from(this.recordings.values()).find(recording => recording.visitId === visitId);
  }

  async createRecording(recording: InsertRecording): Promise<Recording> {
    const newRecording: Recording = {
      ...recording,
      id: this.currentRecordingId++,
      recordedAt: new Date(),
    };
    this.recordings.set(newRecording.id, newRecording);
    return newRecording;
  }

  async getTemplates(): Promise<MedicalTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<MedicalTemplate | undefined> {
    return this.templates.get(id);
  }

  async getTemplatesBySpecialty(specialty: string): Promise<MedicalTemplate[]> {
    return Array.from(this.templates.values()).filter(template => template.specialty === specialty);
  }

  async createTemplate(template: InsertTemplate): Promise<MedicalTemplate> {
    const newTemplate: MedicalTemplate = {
      ...template,
      id: this.currentTemplateId++,
      createdAt: new Date(),
    };
    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }
}

export const storage = new MemStorage();
