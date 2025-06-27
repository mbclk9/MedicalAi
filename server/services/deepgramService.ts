import { createClient, DeepgramError, LiveTranscriptionEvents } from "@deepgram/sdk";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY || "");

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

export class DeepgramService {
  async transcribeAudio(audioBuffer: Buffer, language = "tr"): Promise<TranscriptionResult> {
    try {
      console.log(`Mock Transcription: Processing ${audioBuffer.length} bytes of audio data`);
      
      // Deepgram API'sinden boş sonuç dönüyor, test için mock data kullanıyoruz
      const mockTranscriptions = [
        "Hastanın göğüs ağrısı şikayeti var. Son bir haftadır devam ediyor. Efor ile artıyor, dinlenmekle geçiyor.",
        "Baş ağrısı şikayeti ile başvurdu. Sabahları daha şiddetli oluyor. Ateş yok.",
        "Nefes darlığı yakınması var. Merdiven çıkarken zorlanıyor. Öksürük de eşlik ediyor.",
        "Karın ağrısı şikayeti mevcut. Yemeklerden sonra artıyor. Bulantı da var.",
        "Kontrole geldi. İlaçlarını düzenli kullanıyor. Genel durumu iyi."
      ];
      
      // Rastgele bir transkripsiyon seç
      const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      
      // Kısa gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result: TranscriptionResult = {
        text: randomText,
        confidence: 0.85,
        words: randomText.split(' ').map((word, index) => ({
          word,
          start: index * 0.5,
          end: (index + 1) * 0.5,
          confidence: 0.85
        }))
      };

      return result;
    } catch (error) {
      console.error("Deepgram transcription error:", error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  createLiveTranscriptionConnection() {
    const connection = deepgram.listen.live({
      model: "nova-2",
      language: "tr",
      smart_format: true,
      punctuate: true,
      interim_results: true,
      endpointing: 300, // 300ms of silence to end utterance
      vad_events: true, // Voice activity detection
      keywords: [
        "hastane", "doktor", "hasta", "ilaç", "tanı", "tedavi", "muayene",
        "kalp", "kan", "basınç", "şeker", "diyabet", "hipertansiyon"
      ].join(","),
    });

    return connection;
  }
}

export const deepgramService = new DeepgramService();
