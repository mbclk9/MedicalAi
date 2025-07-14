import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mic, 
  Square, 
  Play,
  Wand2,
  FileText,
  Edit3,
  Check,
  X,
  Mic2,
  Brain,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Loader2,
  Sparkles
} from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import type { MedicalNote } from "@/types/medical";

interface RecordingControlsProps {
  onTranscriptionReady?: (transcription: string) => void;
  visitId?: number;
  templateId?: number;
}

export function RecordingControls({ onTranscriptionReady, visitId, templateId }: RecordingControlsProps) {
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  
  // Fetch visit data which includes medical note
  const { data: visitData, isLoading: isFetchingNote } = useQuery({
    queryKey: [`/api/visits/${visitId}`],
    queryFn: async () => {
      if (!visitId) return null;
      const response = await apiRequest("GET", `/api/visits/${visitId}`);
      return response.json();
    },
    enabled: !!visitId,
    refetchOnWindowFocus: false,
  });
  
  const medicalNote = visitData?.medicalNote;
  
  const {
    recordingState,
    startRecording,
    stopRecording,
    formatDuration,
    isTranscribing,
    transcriptionError,
    isGeneratingNote,
    noteGenerationError,
    noteGenerated,
  } = useAudioRecording(onTranscriptionReady, {
    visitId,
    templateId,
    autoGenerateNote: true,
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

  const handleEditTranscript = () => {
    setIsEditingTranscript(true);
    setEditedTranscript(recordingState.transcription);
  };

  const handleSaveTranscript = () => {
    if (onTranscriptionReady) {
      onTranscriptionReady(editedTranscript);
    }
    setIsEditingTranscript(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTranscript(false);
    setEditedTranscript("");
  };

  return (
    <div className="space-y-4">
      {/* Recording Control */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Button
            size="lg"
            variant={recordingState.isRecording ? "destructive" : "default"}
            onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
            disabled={isTranscribing || isGeneratingNote}
            className="w-20 h-20 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            {recordingState.isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>

        {/* Timer */}
        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-gray-900">
            {formatDuration(recordingState.duration)}
          </div>
          <p className="text-xs text-gray-600">
            {recordingState.isRecording 
              ? "Kayıt devam ediyor" 
              : isTranscribing 
              ? "Metne dönüştürülüyor"
              : isGeneratingNote
              ? "AI not hazırlıyor"
              : "Kayıt başlatın"
            }
          </p>
        </div>

        {/* Recording Status */}
        {recordingState.isRecording && (
          <div className="flex justify-center">
            <Badge variant="destructive" className="animate-pulse text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              REC
            </Badge>
          </div>
        )}

        {/* Processing Status */}
        {(isTranscribing || isGeneratingNote) && (
          <div className="space-y-2">
            <Progress value={isTranscribing ? 50 : 85} className="h-1.5" />
            <p className="text-xs text-gray-500">
              {isTranscribing ? "Transkripsiyon işleniyor..." : "AI not oluşturuluyor..."}
            </p>
          </div>
        )}
      </div>

      {/* Transcription */}
      {recordingState.transcription && (
        <Card className="border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span>Transkripsiyon</span>
              </div>
              {recordingState.confidence > 0 && (
                <Badge variant="outline" className="text-xs">
                  %{Math.round(recordingState.confidence * 100)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {!isEditingTranscript ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {recordingState.transcription}
                  </p>
                </div>
                <Button
                  onClick={handleEditTranscript}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={editedTranscript}
                  onChange={(e) => setEditedTranscript(e.target.value)}
                  className="min-h-[80px] text-sm"
                  placeholder="Transkripsiyon metnini düzenleyin..."
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    İptal
                  </Button>
                  <Button
                    onClick={handleSaveTranscript}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Kaydet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Status */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-600" />
            <span>AI Tıbbi Not</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isGeneratingNote ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                <p className="text-sm text-purple-700">Oluşturuluyor...</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-700">
                  AI sistemi transkripsiyon metnini analiz ederek SOAP formatında tıbbi not hazırlıyor
                </p>
              </div>
            </div>
          ) : noteGenerated && medicalNote ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-700">Tamamlandı</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700">
                  Tıbbi not başarıyla oluşturuldu ve sağ panelde görüntüleniyor
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2 py-4">
              <Brain className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-500">
                Ses kaydı tamamlandığında AI otomatik olarak tıbbi not oluşturacak
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Messages */}
      {transcriptionError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Transkripsiyon hatası: {transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError)}
          </AlertDescription>
        </Alert>
      )}

      {noteGenerationError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            AI not oluşturma hatası: {noteGenerationError instanceof Error ? noteGenerationError.message : String(noteGenerationError)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}