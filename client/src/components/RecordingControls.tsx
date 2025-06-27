import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  RotateCcw 
} from "lucide-react";
import { useAudioRecording } from "@/hooks/useAudioRecording";

interface RecordingControlsProps {
  onTranscriptionReady?: (transcription: string) => void;
}

export function RecordingControls({ onTranscriptionReady }: RecordingControlsProps) {
  const {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
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
    // The transcription callback will be handled by the useAudioRecording hook
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Recording Button */}
            <Button
              size="lg"
              variant={recordingState.isRecording ? "destructive" : "default"}
              onClick={recordingState.isRecording ? handleStopRecording : handleStartRecording}
              disabled={isTranscribing}
              className="w-12 h-12 rounded-full"
            >
              {recordingState.isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <div>
              <div className="text-sm font-medium text-gray-900">
                {recordingState.isRecording ? "Kayıt Aktif" : "Kayıt Hazır"}
              </div>
              <div className="text-sm text-gray-600">
                {formatDuration(recordingState.duration)}
              </div>
            </div>

            {/* Audio Wave Animation */}
            {recordingState.isRecording && !recordingState.isPaused && (
              <div className="audio-wave">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}

            {/* Recording Status */}
            {recordingState.isRecording && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-dot"></div>
                {recordingState.isPaused ? "Duraklatıldı" : "Aktif"}
              </Badge>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            {recordingState.isRecording && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={recordingState.isPaused ? resumeRecording : pauseRecording}
                >
                  {recordingState.isPaused ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {recordingState.isPaused ? "Devam Et" : "Duraklat"}
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopRecording}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Durdur
                </Button>
              </>
            )}

            {!recordingState.isRecording && recordingState.duration > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetRecording}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Sıfırla
              </Button>
            )}
          </div>
        </div>

        {/* Transcription Status */}
        {isTranscribing && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-sm text-blue-700">Ses metne çevriliyor...</span>
            </div>
          </div>
        )}

        {/* Transcription Result */}
        {recordingState.transcription && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Transkripsiyon ({Math.round(recordingState.confidence * 100)}% güven)
            </div>
            <p className="text-sm text-gray-700">{recordingState.transcription}</p>
          </div>
        )}

        {/* Error Display */}
        {transcriptionError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-700">
              Hata: {transcriptionError.message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
