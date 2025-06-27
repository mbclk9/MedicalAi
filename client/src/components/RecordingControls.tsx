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
  const [generatedNote, setGeneratedNote] = useState<MedicalNote | null>(null);
  const queryClient = useQueryClient();
  
  const {
    recordingState,
    startRecording,
    stopRecording,
    formatDuration,
    isTranscribing,
    transcriptionError,
  } = useAudioRecording(onTranscriptionReady);

  const generateNoteMutation = useMutation({
    mutationFn: async (transcription: string): Promise<MedicalNote> => {
      if (!visitId) throw new Error("Visit ID is required");
      
      const response = await apiRequest("POST", "/api/generate-note", {
        visitId,
        templateId,
        transcription,
      });
      return response.json();
    },
    onSuccess: (note) => {
      setGeneratedNote(note);
      // Invalidate visit details to refresh the page
      queryClient.invalidateQueries({ queryKey: [`/api/visits/${visitId}`] });
    },
    onError: (error) => {
      console.error("AI note generation failed:", error);
    },
  });

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
            {generateNoteMutation.isPending && (
              <Badge variant="outline" className="text-xs animate-pulse">
                Oluşturuluyor...
              </Badge>
            )}
          </div>
          
          {generatedNote ? (
            <div className="bg-green-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  Tıbbi Not Oluşturuldu ✓
                </Badge>
              </div>
              
              <div className="text-sm space-y-2">
                <div><strong>Özet:</strong> {generatedNote.visitSummary}</div>
                {generatedNote.subjective?.complaint && (
                  <div><strong>Şikayet:</strong> {generatedNote.subjective.complaint}</div>
                )}
                {generatedNote.assessment?.general && (
                  <div><strong>Değerlendirme:</strong> {generatedNote.assessment.general}</div>
                )}
              </div>
            </div>
          ) : recordingState.transcription ? (
            <div className="bg-blue-50 rounded-lg p-4 text-center space-y-4">
              <p className="text-gray-600 text-sm">
                Metne dönüştürme tamamlandı! SOAP formatında tıbbi not oluşturmak için butona tıklayın.
              </p>
              
              <Button 
                onClick={() => generateNoteMutation.mutate(recordingState.transcription)}
                disabled={generateNoteMutation.isPending || !visitId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {generateNoteMutation.isPending ? "Tıbbi Not Oluşturuluyor..." : "Tıbbi Not Oluştur"}
              </Button>
              
              {generateNoteMutation.error && (
                <div className="text-red-600 text-sm mt-2">
                  AI not oluşturma hatası: {generateNoteMutation.error instanceof Error ? generateNoteMutation.error.message : String(generateNoteMutation.error)}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500 text-sm">
                Ses kaydı tamamlandığında AI otomatik tıbbi not oluşturabilir
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}