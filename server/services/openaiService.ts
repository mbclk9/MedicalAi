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
Aşağıdaki hasta-doktor konuşmasını analiz ederek ${specialty} alanında profesyonel bir tıbbi not oluştur:

KONUŞMA METNİ:
${transcription}

ŞABLONStructure:
${JSON.stringify(templateStructure, null, 2)}

TALEP EDİLEN FORMAT:
{
  "visitSummary": "Muayenenin kısa özeti (2-3 cümle)",
  "subjective": {
    "complaint": "Hastanın ana şikayeti",
    "currentComplaints": "Mevcut yakınmalar detayı",
    "medicalHistory": ["Geçmiş hastalıklar listesi"],
    "medications": ["Kullandığı ilaçlar listesi"],
    "socialHistory": "Sosyal öykü (isteğe bağlı)",
    "reviewOfSystems": "Sistem sorgusu (isteğe bağlı)"
  },
  "objective": {
    "vitalSigns": {
      "heartRate": "Kalp hızı",
      "bloodPressure": "Tansiyon",
      "temperature": "Ateş",
      "respiratoryRate": "Solunum sayısı"
    },
    "physicalExam": "Fizik muayene bulguları",
    "diagnosticResults": [
      {
        "test": "Test adı",
        "results": ["Sonuçlar listesi"]
      }
    ]
  },
  "assessment": {
    "general": "Genel değerlendirme",
    "diagnoses": [
      {
        "diagnosis": "Tanı adı",
        "icd10Code": "ICD-10 kodu (varsa)",
        "type": "ana"
      }
    ]
  },
  "plan": {
    "treatment": ["Tedavi planı adımları"],
    "medications": [
      {
        "name": "İlaç adı",
        "dosage": "Doz",
        "frequency": "Kullanım sıklığı",
        "duration": "Süre"
      }
    ],
    "followUp": "Kontrol önerisi",
    "lifestyle": ["Yaşam tarzı önerileri"]
  }
}

ÖNEMLİ KURALLAR:
1. Türkçe tıbbi terminoloji kullan
2. Türk sağlık sistemi standartlarına uygun ol
3. ICD-10 kodlarını Türkçe tanı adlarıyla eşleştir
4. İlaç adlarını Türkiye'de kullanılan isimlerle yaz
5. SGK işlem kodlaması düşün
6. Hasta mahremiyetini koru
7. Belirsiz bilgileri varsayma, sadece konuşmada geçenleri kullan
8. Profesyonel ve objektif dil kullan
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
