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
        }
      );

      console.log("Deepgram response:", JSON.stringify(response, null, 2));

      const transcript = response.result?.results?.channels?.[0]?.alternatives?.[0];
      
      if (!transcript || !transcript.transcript) {
        console.log("No transcript found in Deepgram response");
        throw new Error("No transcription result from Deepgram");
      }

      const result: TranscriptionResult = {
        text: transcript.transcript,
        confidence: transcript.confidence || 0,
        words: transcript.words?.map(word => ({
          word: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        }))
      };

      console.log("Deepgram transcription result:", result);
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
