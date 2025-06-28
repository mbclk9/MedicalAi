import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TranscriptionResult, RecordingState } from "@/types/medical";

export function useAudioRecording(
  onTranscriptionReady?: (transcription: string) => void,
  options?: {
    visitId?: number;
    templateId?: number;
    autoGenerateNote?: boolean;
  }
) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    transcription: "",
    confidence: 0,
  });
  
  const [noteGenerated, setNoteGenerated] = useState(false);

  const queryClient = useQueryClient();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transcribeMutation = useMutation({
    mutationFn: async (audioBlob: Blob): Promise<TranscriptionResult> => {
      console.log("Starting transcription request for blob:", audioBlob.size, "bytes");
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      
      console.log("Sending transcription request...");
      const response = await apiRequest("POST", "/api/transcribe", formData);
      const result = await response.json();
      console.log("Transcription response:", result);
      return result;
    },
    onError: (error) => {
      console.error("Transcription mutation error:", error);
    },
  });

  const generateNoteMutation = useMutation({
    mutationFn: async (transcription: string) => {
      if (!options?.visitId) throw new Error("Visit ID is required for note generation");
      
      console.log("Auto-generating medical note for transcription:", transcription.substring(0, 50) + "...");
      
      const response = await apiRequest("POST", "/api/generate-note", {
        visitId: options.visitId,
        templateId: options.templateId,
        transcription,
      });
      return response.json();
    },
    onSuccess: (note) => {
      console.log("Medical note auto-generated successfully:", note);
      setNoteGenerated(true);
      // Invalidate visit details to refresh the page and show the generated note
      if (options?.visitId) {
        queryClient.invalidateQueries({ queryKey: [`/api/visits/${options.visitId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      }
    },
    onError: (error) => {
      console.error("Auto note generation failed:", error);
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      // Try different audio formats based on browser support
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/wav";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ""; // Use default
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: mimeType || "audio/webm;codecs=opus" 
        });
        
        console.log("Audio blob created:", audioBlob.size, "bytes");
        
        // Only transcribe if we have audio data
        if (audioBlob.size > 0) {
          transcribeMutation.mutate(audioBlob, {
            onSuccess: (result) => {
              console.log("Transcription successful, updating state:", result);
              setRecordingState(prev => ({
                ...prev,
                transcription: result.text,
                confidence: result.confidence,
              }));
              
              // Call the callback if provided
              if (onTranscriptionReady && result.text) {
                onTranscriptionReady(result.text);
              }
              
              // Auto-generate medical note if enabled (Freed.ai style)
              if (options?.autoGenerateNote && result.text && options.visitId) {
                console.log("Auto-triggering medical note generation (Freed.ai style)");
                generateNoteMutation.mutate(result.text);
              }
            },
            onError: (error) => {
              console.error("Transcription failed:", error);
            }
          });
        } else {
          console.warn("No audio data recorded");
        }
      };

      mediaRecorder.start(1000); // Collect data every second

      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
      }));

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      throw new Error("Mikrofona erişim sağlanamadı. Lütfen mikrofon izinlerini kontrol edin.");
    }
  }, [transcribeMutation.mutateAsync]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      setRecordingState(prev => ({
        ...prev,
        isPaused: true,
      }));
    }
  }, [recordingState.isRecording]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState.isPaused) {
      mediaRecorderRef.current.resume();
      
      intervalRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
      
      setRecordingState(prev => ({
        ...prev,
        isPaused: false,
      }));
    }
  }, [recordingState.isPaused]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setRecordingState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false,
    }));
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      transcription: "",
      confidence: 0,
    });
    setNoteGenerated(false);
    chunksRef.current = [];
  }, [stopRecording]);

  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} dakika ${remainingSeconds} saniye`;
  }, []);

  return {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatDuration,
    isTranscribing: transcribeMutation.isPending,
    transcriptionError: transcribeMutation.error,
    isGeneratingNote: generateNoteMutation.isPending,
    noteGenerationError: generateNoteMutation.error,
    noteGenerated,
  };
}
