import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { RecordingControls } from "@/components/RecordingControls";
import { MedicalNoteEditor } from "@/components/MedicalNoteEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Calendar, Clock, AlertCircle, CheckCircle, Mic2, Brain, Stethoscope } from "lucide-react";
import { Link } from "wouter";
import type { Visit, Patient, MedicalNote, Recording, MedicalTemplate } from "@/types/medical";
import { motion } from "framer-motion";
import { AnimatedPage, slideVariants } from "@/components/AnimatedPage";

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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'kontrol':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'konsultasyon':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Hasta Bilgileri Yükleniyor</h3>
              <p className="text-gray-600">Lütfen bekleyiniz...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !visitDetails) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Hasta Kaydı Bulunamadı</h3>
              <p className="text-gray-600">
                Aradığınız hasta kaydına erişilemiyor. Kayıt silinmiş veya ID hatalı olabilir.
              </p>
            </div>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <AnimatedPage>
          {/* Header */}
          <motion.header 
            className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Geri
                    </Button>
                  </motion.div>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <User className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {patient.name} {patient.surname}
                    </h1>
                    <div className="flex items-center space-x-3 mt-1">
                      <Badge className={getVisitTypeColor(visit.visitType)}>
                        {getVisitTypeText(visit.visitType)}
                      </Badge>
                      {selectedTemplate && (
                        <Badge variant="outline" className="text-xs">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          {selectedTemplate.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(visit.visitDate!).toLocaleDateString('tr-TR')} - {new Date(visit.visitDate!).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Recording & AI */}
          <aside className="w-96 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Ses Kaydı ve AI İşleme</h2>
              <p className="text-sm text-gray-600 mt-1">Hasta görüşmesini kaydedin ve AI analizi alın</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <RecordingControls 
                onTranscriptionReady={handleTranscriptionReady}
                visitId={visit.id}
                templateId={visit.templateId || undefined}
              />
            </div>
          </aside>

          {/* Right Content - Medical Note */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Patient Summary */}
              <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">TC Kimlik:</span>
                      <p className="font-mono text-gray-900">{patient.tcKimlik || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Telefon:</span>
                      <p className="text-gray-900">{patient.phone || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Muayene Durumu:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        {medicalNote ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Brain className="h-4 w-4 text-blue-600" />
                        )}
                        <span className="text-sm">
                          {medicalNote ? "Tıbbi not hazır" : "İşleniyor"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Note Editor */}
              <MedicalNoteEditor
                visit={{...visit, patient}}
                medicalNote={medicalNote}
                template={selectedTemplate || undefined}
                transcription={transcription || recording?.transcription}
              />
            </div>
          </div>
        </div>
        </AnimatedPage>
      </main>
    </div>
  );
}
