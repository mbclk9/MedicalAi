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
      console.log(`Deepgram Transcription: Processing ${audioBuffer.length} bytes of audio data`);
      
      if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error("DEEPGRAM_API_KEY environment variable is not set");
      }
      
      const response = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: "nova-2",
          language: language,
          smart_format: true,
          punctuate: true,
          diarize: false,
          utterances: false,
          word_timestamps: true,
          // Remove encoding to let Deepgram auto-detect
          // encoding: "webm",
          // sample_rate: 48000,
          // channels: 1,
        }
      );

      console.log("Deepgram response:", JSON.stringify(response, null, 2));

      const transcript = response.result?.results?.channels?.[0]?.alternatives?.[0];
      
      if (!transcript) {
        throw new Error("No transcript found in Deepgram response");
      }

      const transcriptionResult: TranscriptionResult = {
        text: transcript.transcript || "",
        confidence: transcript.confidence || 0,
        words: transcript.words?.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence || 0
        }))
      };

      console.log("Deepgram transcription successful:", transcriptionResult.text.substring(0, 100) + "...");
      return transcriptionResult;

    } catch (error) {
      console.error("Deepgram transcription error:", error);
      
      if (error instanceof DeepgramError) {
        throw new Error(`Deepgram API error: ${error.message}`);
      }
      
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  createLiveTranscriptionConnection() {
    try {
      if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error("DEEPGRAM_API_KEY environment variable is not set");
      }

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

      console.log("Live transcription connection created successfully");
      return connection;
    } catch (error) {
      console.error("Failed to create live transcription connection:", error);
      throw error;
    }
  }

  // Test connection to Deepgram
  async testConnection(): Promise<boolean> {
    try {
      if (!process.env.DEEPGRAM_API_KEY) {
        console.error("DEEPGRAM_API_KEY environment variable is not set");
        return false;
      }

      // Create a simple test buffer (1 second of silence)
      const testBuffer = Buffer.alloc(16000); // 16kHz, 1 second of silence
      
      await this.transcribeAudio(testBuffer);
      console.log("✅ Deepgram connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Deepgram connection test failed:", error);
      return false;
    }
  }
}

export const deepgramService = new DeepgramService();
