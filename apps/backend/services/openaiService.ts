import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "" 
});

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

export class OpenaiService {
  async generateMedicalNote(
    transcription: string, 
    templateStructure: any,
    specialty: string = "Genel Tıp"
  ): Promise<MedicalNoteGeneration> {
    try {
      const prompt = this.createTurkishMedicalPrompt(transcription, templateStructure, specialty);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Sen Türkiye'de çalışan uzman bir tıbbi sekretersin. Hasta-doktor konuşmalarını analiz ederek Türk sağlık sistemi standartlarına uygun tıbbi notlar oluşturuyorsun. SOAP formatında (Subjektif, Objektif, Değerlendirme, Plan) yapılandırılmış notlar hazırla. Türkçe tıbbi terminolojiyi doğru kullan ve SGK standartlarını dikkate al. Yanıtını JSON formatında ver.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, // Lower temperature for more consistent medical documentation
      });

      const result = response.choices[0].message.content;
      if (!result) {
        throw new Error("OpenAI returned empty response");
      }

      return JSON.parse(result) as MedicalNoteGeneration;
    } catch (error) {
      console.error("OpenAI medical note generation error:", error);
      throw new Error(`Failed to generate medical note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private createTurkishMedicalPrompt(transcription: string, templateStructure: any, specialty: string): string {
    return `
Sen Türkiye Cumhuriyeti Sağlık Bakanlığı standartlarında çalışan uzman bir tıbbi sekreter asistanısın. 

HASTA GİZLİLİĞİ UYARISI: Bu tıbbi kayıt 6698 sayılı KVKK kapsamında korunmaktadır.

Verilen hasta-doktor görüşmesi transkripsiyon metnini analiz ederek T.C. Sağlık Bakanlığı tıbbi dokümantasyon standartlarına uygun profesyonel SOAP formatında tıbbi not oluştur.

TRANSKRIPSIYON METNİ:
"${transcription}"

UZMANLIK ALANI: ${specialty}

ŞABLON YAPISI:
${JSON.stringify(templateStructure, null, 2)}

T.C. SAĞLIK BAKANLIĞI SOAP FORMATINDA TIBBİ NOT:

{
  "visitSummary": "Hasta [yaş]/[cinsiyet], [ana şikayet] nedeniyle başvurdu. [Muayene türü] yapıldı. [Genel durum değerlendirmesi]",
  "subjective": {
    "complaint": "Ana şikayet - Hastanın kendi ifadesiyle ana yakınması",
    "currentComplaints": "Mevcut hastalık öyküsü - Şikayetin başlama zamanı, karakteri, süresi, etkileyen faktörler",
    "medicalHistory": ["Diabetes mellitus", "Hipertansiyon", "vb geçmiş hastalıklar"],
    "medications": ["İlaç adı - doz - kullanım şekli", "örn: Metformin 500mg 2x1"],
    "socialHistory": "Sigara/alkol kullanımı, meslek, aile öyküsü",
    "reviewOfSystems": "Konuşmada geçen sistem yakınmaları"
  },
  "objective": {
    "vitalSigns": {
      "bloodPressure": "120/80 mmHg",
      "heartRate": "72/dk",
      "temperature": "36.5°C", 
      "respiratoryRate": "16/dk",
      "oxygen": "SaO2: %98"
    },
    "physicalExam": "Genel durum: [iyi/kötü], Bilinç: [açık/kapalı], Fizik muayene sistem bazında bulguları",
    "diagnosticResults": [
      {
        "test": "Laboratuvar/Görüntüleme test adı",
        "results": ["Test sonuçları ve değerleri"]
      }
    ]
  },
  "assessment": {
    "general": "Klinik tablonun genel değerlendirmesi ve hasta durumunun özetlenmesi",
    "diagnoses": [
      {
        "diagnosis": "Türkçe tanı adı",
        "icd10Code": "ICD-10 tanı kodu",
        "type": "ana" // ana, yan, komplikasyon
      }
    ]
  },
  "plan": {
    "treatment": ["Medikal tedavi yaklaşımı", "Cerrahi girişim gereksinimi", "Destekleyici tedavi"],
    "medications": [
      {
        "name": "İlaç adı (Türkiye'de kullanılan ticari/etkili madde adı)",
        "dosage": "mg/ml/g cinsinden doz",
        "frequency": "1x1, 2x1, 3x1 vb.",
        "duration": "7 gün, 1 ay, vb."
      }
    ],
    "followUp": "X gün/hafta/ay sonra kontrol muayenesi",
    "lifestyle": ["Diyet önerileri", "Egzersiz programı", "Yaşam tarzı değişiklikleri"]
  }
}

T.C. SAĞLIK BAKANLIĞI STANDARTLARI:
• 6698 sayılı KVKK uyumluluğu - hasta mahremiyeti korunmalı
• Türk Tabipleri Birliği Hekimlik Meslek Etiği Kuralları uygun
• SGK Sosyal Güvenlik Kurumu işlem kodlaması düşünülerek
• TİTCK Türkiye İlaç ve Tıbbi Cihaz Kurumu onaylı ilaçlar
• Hasta Hakları Yönetmeliği'ne uygun dil ve yaklaşım
• ICD-10 tanı kodlama sistemi kullanılmalı
• Türkiye Halk Sağlığı Kurumu kılavuzlarına uygun
• Sadece konuşmada açıkça geçen bilgileri kullan
• Varsayım yapma, objektif değerlendirme yap
• Tıbbi terminolojiyi Türkçe kullan
`;
  }

  async generateVisitSummary(transcription: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Sen Türkiye'de çalışan tıbbi sekretersin. Hasta-doktor konuşmalarından kısa ve öz muayene özetleri hazırlıyorsun."
          },
          {
            role: "user",
            content: `Aşağıdaki hasta-doktor konuşmasından 2-3 cümlelik kısa bir muayene özeti çıkar. Türkçe tıbbi terminoloji kullan:\n\n${transcription}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      return response.choices[0].message.content || "Muayene özeti oluşturulamadı.";
    } catch (error) {
      console.error("OpenAI summary generation error:", error);
      throw new Error("Failed to generate visit summary");
    }
  }
}

export const openaiService = new OpenaiService();
