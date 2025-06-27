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

export class MockTranscriptionService {
  async transcribeAudio(audioBuffer: Buffer, language = "tr"): Promise<TranscriptionResult> {
    console.log(`Mock Transcription: Processing ${audioBuffer.length} bytes of audio data`);
    
    // Test için Türkçe tıbbi transkripsiyon örnekleri
    const mockTranscriptions = [
      "Hastanın göğüs ağrısı şikayeti var. Son bir haftadır devam ediyor. Efor ile artıyor, dinlenmekle geçiyor.",
      "Baş ağrısı şikayeti ile başvurdu. Sabahları daha şiddetli oluyor. Ateş yok.",
      "Nefes darlığı yakınması var. Merdiven çıkarken zorlanıyor. Öksürük de eşlik ediyor.",
      "Karın ağrısı şikayeti mevcut. Yemeklerden sonra artı iyor. Bulantı da var.",
      "Kontrole geldi. İlaçlarını düzenli kullanıyor. Genel durumu iyi. Kan basıncı normal.",
      "Diabet kontrolü için geldi. Şeker düzeyleri yüksek. Diyet önerisi yapıldı.",
      "Hipertansiyon tanısı var. İlaç tedavisi düzenlendi. Takip gerekli."
    ];
    
    // Rastgele bir transkripsiyon seç
    const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    
    // Gerçekçi bir gecikme ekle
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const words = randomText.split(' ').map((word, index) => ({
      word,
      start: index * 0.6,
      end: (index + 1) * 0.6,
      confidence: 0.8 + Math.random() * 0.2 // 0.8-1.0 arası confidence
    }));

    const result: TranscriptionResult = {
      text: randomText,
      confidence: 0.87 + Math.random() * 0.1, // 0.87-0.97 arası
      words
    };

    console.log(`Mock Transcription Result: "${result.text}" (confidence: ${result.confidence.toFixed(2)})`);
    return result;
  }

  createLiveTranscriptionConnection() {
    // Mock live connection
    return {
      on: (event: string, callback: Function) => {
        console.log(`Mock live transcription event: ${event}`);
      },
      send: (data: any) => {
        console.log('Mock send data to live transcription');
      },
      finish: () => {
        console.log('Mock finish live transcription');
      }
    };
  }
}

export const mockTranscriptionService = new MockTranscriptionService();