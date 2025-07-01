import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  Square, 
  Play,
  Wand2,
  FileText,
  Edit3,
  Check,
  X
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
  // Note generation is now automatic via useAudioRecording hook (Freed.ai style)
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState("");
  const [editingSections, setEditingSections] = useState<{[key: string]: boolean}>({});
  const [editedSections, setEditedSections] = useState<{[key: string]: string}>({});
  
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
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
            {recordingState.transcription ? (
              <div className="space-y-3">
                {!isEditingTranscript ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed flex-1 pr-3">
                        {recordingState.transcription}
                      </p>
                      <Button
                        onClick={() => {
                          setIsEditingTranscript(true);
                          setEditedTranscript(recordingState.transcription);
                        }}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    {recordingState.confidence > 0 && (
                      <div className="text-xs text-gray-500">
                        Güvenilirlik: {Math.round(recordingState.confidence * 100)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={editedTranscript}
                      onChange={(e) => setEditedTranscript(e.target.value)}
                      className="min-h-[100px] text-sm"
                      placeholder="Transkripsiyon metnini düzenleyin..."
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => {
                          // Update transcription and trigger new AI note generation
                          if (onTranscriptionReady) {
                            onTranscriptionReady(editedTranscript);
                          }
                          setIsEditingTranscript(false);
                          // Note: The useAudioRecording hook will automatically regenerate the note
                        }}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Kaydet
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingTranscript(false);
                          setEditedTranscript("");
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : recordingState.isRecording ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                <p className="text-gray-600 italic text-center">
                  Canlı kayıt devam ediyor...
                </p>
              </div>
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
          ) : noteGenerated && medicalNote ? (
            <div className="space-y-4">
              {/* Success Header */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2">
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    ✓ Tıbbi Not Otomatik Oluşturuldu
                  </Badge>
                </div>
              </div>

              {/* Freed.ai Style Sections */}
              <div className="space-y-3">
                {/* Visit Summary */}
                {medicalNote.visitSummary && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <h4 className="font-medium text-blue-900 mb-2">📋 Muayene Özeti</h4>
                    <p className="text-blue-800 text-sm">{medicalNote.visitSummary}</p>
                  </div>
                )}

                {/* Subjective Section */}
                {medicalNote.subjective && (
                  <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                    <h4 className="font-medium text-orange-900 mb-2">🗣️ Subjektif (Hasta Anlatımı)</h4>
                    <div className="space-y-2 text-sm">
                      {medicalNote.subjective.complaint && (
                        <div>
                          <span className="font-medium text-orange-800">Ana Şikayet: </span>
                          <span className="text-orange-700">{medicalNote.subjective.complaint}</span>
                        </div>
                      )}
                      {medicalNote.subjective.currentComplaints && (
                        <div>
                          <span className="font-medium text-orange-800">Mevcut Şikayetler: </span>
                          <span className="text-orange-700">{medicalNote.subjective.currentComplaints.substring(0, 150)}...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Objective Section */}
                {medicalNote.objective && (
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                    <h4 className="font-medium text-purple-900 mb-2">🩺 Objektif (Muayene Bulguları)</h4>
                    <div className="space-y-2 text-sm">
                      {medicalNote.objective.physicalExam && (
                        <div>
                          <span className="font-medium text-purple-800">Fizik Muayene: </span>
                          <span className="text-purple-700">{medicalNote.objective.physicalExam}</span>
                        </div>
                      )}
                      {medicalNote.objective.vitalSigns && Object.keys(medicalNote.objective.vitalSigns).length > 0 && (
                        <div>
                          <span className="font-medium text-purple-800">Vital Bulgular: </span>
                          <span className="text-purple-700">
                            {Object.entries(medicalNote.objective.vitalSigns).map(([key, value]) => `${key}: ${value}`).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assessment Section */}
                {medicalNote.assessment && (
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                    <h4 className="font-medium text-red-900 mb-2">🔍 Değerlendirme</h4>
                    <div className="space-y-2 text-sm">
                      {medicalNote.assessment.general && (
                        <div>
                          <span className="font-medium text-red-800">Genel Değerlendirme: </span>
                          <span className="text-red-700">{medicalNote.assessment.general}</span>
                        </div>
                      )}
                      {medicalNote.assessment.diagnoses && medicalNote.assessment.diagnoses.length > 0 && (
                        <div>
                          <span className="font-medium text-red-800">Tanılar: </span>
                          <span className="text-red-700">
                            {medicalNote.assessment.diagnoses.map((d: any) => d.diagnosis).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Plan Section */}
                {medicalNote.plan && (
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                    <h4 className="font-medium text-green-900 mb-2">📋 Plan</h4>
                    <div className="space-y-2 text-sm">
                      {medicalNote.plan.treatment && medicalNote.plan.treatment.length > 0 && (
                        <div>
                          <span className="font-medium text-green-800">Tedavi: </span>
                          <span className="text-green-700">{medicalNote.plan.treatment.join(', ')}</span>
                        </div>
                      )}
                      {medicalNote.plan.followUp && (
                        <div>
                          <span className="font-medium text-green-800">Takip: </span>
                          <span className="text-green-700">{medicalNote.plan.followUp}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Full Note Button */}
              <div className="text-center pt-3">
                <Button
                  onClick={() => window.location.href = `/patient-note/${visitId}`}
                  variant="outline"
                  size="sm"
                  disabled={!visitId}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Detaylı Notu Görüntüle
                </Button>
              </div>
            </div>
          ) : noteGenerated && !medicalNote ? (
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                  ⏳ Not Yükleniyor...
                </Badge>
              </div>
              <p className="text-yellow-700 text-sm">
                Tıbbi not oluşturuldu, veriler yükleniyor...
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