import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { RecordingControls } from "@/components/RecordingControls";
import { MedicalNoteEditor } from "@/components/MedicalNoteEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User } from "lucide-react";
import { Link } from "wouter";
import type { Visit, Patient, MedicalNote, Recording, MedicalTemplate } from "@/types/medical";

interface VisitDetails {
  visit: Visit;
  patient: Patient;
  medicalNote?: MedicalNote;
  recording?: Recording;
}

export default function PatientNote() {
  const [, params] = useRoute("/visit/:id");
  const [transcription, setTranscription] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);
  
  const visitId = params?.id;

  const { data: visitDetails, isLoading, error } = useQuery<VisitDetails>({
    queryKey: [`/api/visits/${visitId}`],
    enabled: !!visitId,
  });

  const { data: templates = [] } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
  });

  useEffect(() => {
    if (visitDetails?.visit.templateId && templates.length > 0) {
      const template = templates.find(t => t.id === visitDetails.visit.templateId);
      setSelectedTemplate(template || null);
    }
  }, [visitDetails, templates]);

  const handleTranscriptionReady = (newTranscription: string) => {
    setTranscription(newTranscription);
  };

  const getVisitTypeText = (type: string) => {
    switch (type) {
      case 'ilk':
        return 'İlk Muayene';
      case 'kontrol':
        return 'Kontrol Muayenesi';
      case 'konsultasyon':
        return 'Konsültasyon';
      default:
        return type;
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'ilk':
        return 'bg-green-100 text-green-800';
      case 'kontrol':
        return 'bg-blue-100 text-blue-800';
      case 'konsultasyon':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Hasta bilgileri yükleniyor...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !visitDetails) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hasta kaydı bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Aradığınız hasta kaydına erişilemiyor.
            </p>
            {/* Debug bilgisi */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
              <p className="text-sm text-red-800">
                <strong>Debug:</strong><br/>
                Visit ID: {visitId}<br/>
                Error: {error?.message || 'No data'}<br/>
                URL: {window.location.pathname}
              </p>
            </div>
            <Link href="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { visit, patient, medicalNote, recording } = visitDetails;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {patient.name} {patient.surname}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getVisitTypeColor(visit.visitType)}>
                    {getVisitTypeText(visit.visitType)}
                  </Badge>
                  {selectedTemplate && (
                    <Badge variant="outline">
                      {selectedTemplate.name}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">
                    {new Date(visit.visitDate!).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Recording Controls */}
          <RecordingControls 
            onTranscriptionReady={handleTranscriptionReady}
          />

          {/* Current Transcription Display */}
          {(transcription || recording?.transcription) && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Mevcut Transkripsiyon</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {transcription || recording?.transcription}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Note Editor */}
          <MedicalNoteEditor
            visit={visit}
            patient={patient}
            medicalNote={medicalNote}
            template={selectedTemplate || undefined}
            transcription={transcription || recording?.transcription}
          />
        </div>
      </main>
    </div>
  );
}
