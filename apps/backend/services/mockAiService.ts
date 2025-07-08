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

export class MockAiService {
  async generateMedicalNote(
    transcription: string,
    templateStructure: any,
    specialty: string = "Genel"
  ): Promise<MedicalNoteGeneration> {
    console.log(`Mock AI: Generating medical note for ${specialty} with transcription: ${transcription.substring(0, 50)}...`);
    
    // Basit keyword bazlı analiz
    const lowerTranscription = transcription.toLowerCase();
    const hasChestPain = lowerTranscription.includes('göğüs ağrısı') || lowerTranscription.includes('chest pain');
    const hasHeadache = lowerTranscription.includes('baş ağrısı') || lowerTranscription.includes('headache');
    const hasFever = lowerTranscription.includes('ateş') || lowerTranscription.includes('fever');
    const hasBreathing = lowerTranscription.includes('nefes') || lowerTranscription.includes('breathing');
    
    const result: MedicalNoteGeneration = {
      visitSummary: `${specialty} muayenesi - Hasta transkripsiyon kaydına göre değerlendirildi. Ana şikayet: ${hasChestPain ? 'göğüs ağrısı' : hasHeadache ? 'baş ağrısı' : 'genel şikayet'}.`,
      subjective: {
        complaint: hasChestPain ? "Göğüs ağrısı" : hasHeadache ? "Baş ağrısı" : hasBreathing ? "Nefes darlığı" : "Transkripsiyon kaydında belirtilen şikayetler",
        currentComplaints: transcription.length > 200 ? transcription.substring(0, 200) + "..." : transcription,
        medicalHistory: ["Önceki hastalık öyküsü sorgulandı", "Kronik hastalık sorgulandı"],
        medications: ["Mevcut ilaç kullanımı sorgulandı", "Alerji öyküsü sorgulandı"],
        socialHistory: "Sosyal öykü alındı",
        reviewOfSystems: "Sistem sorgusu yapıldı"
      },
      objective: {
        vitalSigns: {
          tansiyon: hasFever ? "130/85 mmHg" : "120/80 mmHg",
          nabiz: hasFever ? "92/dk" : "78/dk",
          ates: hasFever ? "38.2°C" : "36.8°C",
          solunum: hasBreathing ? "24/dk" : "18/dk",
          oksijen: hasBreathing ? "95%" : "98%"
        },
        physicalExam: hasChestPain ? 
          "Kardiyak muayene: Düzenli ritim, üfürüm yok. Akciğer muayenesi normal." : 
          hasHeadache ? 
            "Nörolojik muayene: Bilinç açık, koopere. Kranial sinir muayenesi normal." :
            "Genel durum iyi, vital bulgular stabil. Sistem muayeneleri yapıldı.",
        diagnosticResults: hasChestPain ? [
          {
            test: "EKG",
            results: ["Sinüs ritmi", "ST-T değişikliği yok"]
          }
        ] : []
      },
      assessment: {
        general: `${specialty} konsültasyonu tamamlandı. Hastanın genel durumu ${hasFever ? 'orta' : 'iyi'}.`,
        diagnoses: [
          {
            diagnosis: hasChestPain ? "Atipik göğüs ağrısı" : 
                     hasHeadache ? "Primer baş ağrısı" : 
                     hasBreathing ? "Dispne, etiyoloji araştırılacak" :
                     "Klinik değerlendirme yapıldı",
            icd10Code: hasChestPain ? "R07.9" : hasHeadache ? "R51" : undefined,
            type: "ana"
          }
        ]
      },
      plan: {
        treatment: hasChestPain ? 
          ["Kardiyoloji konsültasyonu önerildi", "EKG takibi"] :
          hasHeadache ?
            ["Analjetik tedavi", "Dinlenme önerildi"] :
            ["Semptomatik tedavi", "Takip önerildi"],
        medications: hasChestPain ? [
          {
            name: "ASA",
            dosage: "100 mg",
            frequency: "1x1",
            duration: "Sürekli"
          }
        ] : hasHeadache ? [
          {
            name: "Parasetamol",
            dosage: "500 mg",
            frequency: "3x1",
            duration: "3 gün"
          }
        ] : [],
        followUp: hasChestPain ? "1 hafta sonra kardiyoloji kontrolü" : "2 hafta sonra kontrol",
        lifestyle: hasChestPain ? 
          ["Sigara bırakılması önerildi", "Düzenli egzersiz", "Sağlıklı beslenme"] :
          ["Dinlenme önerildi", "Bol sıvı alımı", "Stres yönetimi"]
      }
    };

    // Kısa bir gecikme ekleyerek gerçek AI hissi veriyoruz
    await new Promise(resolve => setTimeout(resolve, 500));

    return result;
  }

  async generateVisitSummary(transcription: string): Promise<string> {
    console.log(`Mock AI: Generating visit summary for transcription: ${transcription.substring(0, 50)}...`);
    
    const lowerTranscription = transcription.toLowerCase();
    const hasChestPain = lowerTranscription.includes('göğüs ağrısı');
    const hasHeadache = lowerTranscription.includes('baş ağrısı');
    
    let summary = "Hasta muayeneye başvurdu. ";
    
    if (hasChestPain) {
      summary += "Göğüs ağrısı şikayeti ile değerlendirildi.";
    } else if (hasHeadache) {
      summary += "Baş ağrısı şikayeti ile muayene edildi.";
    } else {
      summary += "Genel şikayetleri ile konsültasyon yapıldı.";
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return summary;
  }
}

export const mockAiService = new MockAiService();