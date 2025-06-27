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

interface RecordingControlsProps {
  onTranscriptionReady?: (transcription: string) => void;
}

export function RecordingControls({ onTranscriptionReady }: RecordingControlsProps) {
  const {
    recordingState,
    startRecording,
    stopRecording,
    formatDuration,
    isTranscribing,
    transcriptionError,
  } = useAudioRecording(onTranscriptionReady);

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
            <h2 className="text-xl font-semibold text-gray-900">Yeni Kayıt</h2>
            <p className="text-sm text-gray-600">Hasta muayenesini kaydetmeye başlayın</p>
            
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
                  ? "Kayıt devam ediyor..." 
                  : isTranscribing 
                  ? "Transkripsiyon işleniyor..."
                  : "Kayıt başlatmak için butona tıklayın"
                }
              </p>
            </div>

            {/* Recording Status */}
            {recordingState.isRecording && (
              <div className="flex justify-center">
                <Badge variant="destructive" className="animate-pulse">
                  Kayıt Devam Ediyor
                </Badge>
              </div>
            )}

            {/* Transcription Error */}
            {transcriptionError && (
              <div className="text-red-600 text-sm mt-2">
                Transkripsiyon hatası: {transcriptionError}
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
            <h3 className="text-lg font-medium text-gray-900">Canlı Transkripsiyon</h3>
            <Badge variant="outline" className="text-xs">
              {isTranscribing ? "İşleniyor..." : "Bekleniyor"}
            </Badge>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
            {recordingState.transcription ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {recordingState.transcription}
              </p>
            ) : (
              <p className="text-gray-400 italic text-center">
                Kayıt başladığında transkripsiyon burada görünecek
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
            <h3 className="text-lg font-medium text-gray-900">AI Oluşturulan Not</h3>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm mb-4">
              Kayıt tamamlandığında AI otomatik tıbbi not burada görünecek
            </p>
            
            {recordingState.transcription && (
              <Badge variant="secondary" className="text-xs">
                Transkripsiyon hazır - AI ile not oluşturulabilir
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}