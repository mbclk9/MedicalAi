import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Square, 
  Play,
  Wand2
} from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { MedicalNote } from "@/types/medical";

interface RecordingControlsProps {
  onTranscriptionReady?: (transcription: string) => void;
  visitId?: number;
  templateId?: number;
}

export function RecordingControls({ onTranscriptionReady, visitId, templateId }: RecordingControlsProps) {
  // Note generation is now automatic via useAudioRecording hook (Freed.ai style)
  const queryClient = useQueryClient();
  
  const {
    recordingState,
    startRecording,
    stopRecording,
    formatDuration,
    isTranscribing,
    transcriptionError,
    isGeneratingNote,
    noteGenerationError,
  } = useAudioRecording(onTranscriptionReady, {
    visitId,
    templateId,
    autoGenerateNote: true, // Freed.ai style automatic note generation
  });

  // Not generation is now automatic via useAudioRecording hook (Freed.ai style)

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Recording failed:", error);
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  return (
    <div className="space-y-6">
      {/* Recording Section */}
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Ses Kaydı</h2>
            <p className="text-sm text-gray-600">Hasta-doktor görüşmesini kaydetmeye başlayın</p>
            <p className="text-xs text-gray-500">Bu kayıt KVKK uyarınca güvenli şekilde işlenir</p>
            
            {/* Recording Button - Large */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={recordingState.isRecording ? "destructive" : "default"}
                onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
                disabled={isTranscribing}
                className="w-20 h-20 rounded-full text-white shadow-lg hover:scale-105 transition-transform"
              >
                {recordingState.isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            {/* Timer Display */}
            <div className="space-y-2">
              <div className="text-3xl font-mono font-bold text-gray-900">
                {formatDuration(recordingState.duration)}
              </div>
              <p className="text-sm text-gray-600">
                {recordingState.isRecording 
                  ? "Ses kaydı devam ediyor..." 
                  : isTranscribing 
                  ? "Metne dönüştürülüyor..."
                  : "Hasta muayenesini kaydetmek için mikrofon butonuna tıklayın"
                }
              </p>
            </div>

            {/* Recording Status */}
            {recordingState.isRecording && (
              <div className="flex justify-center">
                <Badge variant="destructive" className="animate-pulse">
                  🎤 Ses Kaydediliyor
                </Badge>
              </div>
            )}

            {/* Transcription Error */}
            {transcriptionError && (
              <div className="text-red-600 text-sm mt-2">
                Transkripsiyon hatası: {transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Transcription Section */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Play className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Metne Dönüştürme</h3>
            <Badge variant="outline" className="text-xs">
              {isTranscribing ? "İşleniyor..." : "Hazır"}
            </Badge>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
            {recordingState.transcription ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {recordingState.transcription}
              </p>
            ) : (
              <p className="text-gray-400 italic text-center">
                Ses kaydı tamamlandıktan sonra metne dönüştürülen içerik burada görünecek
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Note Generation Section */}
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wand2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Tıbbi Not Oluşturma</h3>
            {isGeneratingNote && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Otomatik Oluşturuluyor...
              </Badge>
            )}
          </div>
          
          {isGeneratingNote ? (
            <div className="bg-blue-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p className="text-blue-700 font-medium">
                  AI otomatik tıbbi not oluşturuyor...
                </p>
              </div>
              
              <p className="text-gray-600 text-sm text-center">
                Freed.ai tarzında: Transkripsiyon tamamlandı, AI hemen tıbbi not hazırlıyor
              </p>
              
              {noteGenerationError && (
                <div className="text-red-600 text-sm text-center">
                  AI not oluşturma hatası: {noteGenerationError instanceof Error ? noteGenerationError.message : String(noteGenerationError)}
                </div>
              )}
            </div>
          ) : recordingState.transcription && !isGeneratingNote ? (
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  ✓ Tıbbi Not Otomatik Oluşturuldu
                </Badge>
              </div>
              <p className="text-green-700 text-sm">
                AI not oluşturmayı tamamladı. Muayene detaylarında görüntüleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">
                Ses kaydı tamamlandığında AI otomatik tıbbi not oluşturacak
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}