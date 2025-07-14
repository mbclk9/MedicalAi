import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Stethoscope, Clock } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { TemplateModal } from "@/components/TemplateModal";
import { RecordingControls } from "@/components/RecordingControls";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, MedicalTemplate } from "@/types/medical";

export default function NewVisit() {
  const [, setLocation] = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);
  const [visitType, setVisitType] = useState<"ilk" | "kontrol" | "konsultasyon">("kontrol");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [visitCreated, setVisitCreated] = useState(false);
  const [createdVisitId, setCreatedVisitId] = useState<number | null>(null);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [generatedNote, setGeneratedNote] = useState<any>(null);
  const [showMedicalNote, setShowMedicalNote] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: templates = [] } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
  });

  // URL'den template ID ve patient ID'yi al
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    const patientId = urlParams.get('patientId');
    
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === parseInt(templateId));
      if (template) {
        setSelectedTemplate(template);
      }
    }
    
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === parseInt(patientId));
      if (patient) {
        setSelectedPatient(patient);
      }
    }
  }, [templates, patients]);

  const createVisitMutation = useMutation({
    mutationFn: async (visitData: {
      patientId: number;
      doctorId: number;
      templateId?: number;
      visitType: string;
    }) => {
      const response = await apiRequest("POST", "/api/visits", visitData);
      return response.json();
    },
    onSuccess: (visit) => {
      setCreatedVisitId(visit.id);
      setVisitCreated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      toast({
        title: "Başarılı",
        description: "Yeni muayene kaydı oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Muayene kaydı oluşturulurken hata oluştu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartVisit = async () => {
    if (!selectedPatient) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir hasta seçin.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "Uyarı", 
        description: "Lütfen bir şablon seçin.",
        variant: "destructive",
      });
      return;
    }

    await createVisitMutation.mutateAsync({
      patientId: selectedPatient.id,
      doctorId: 1, // Default doctor
      templateId: selectedTemplate.id,
      visitType: visitType,
    });
  };

  const handleTemplateSelect = (template: MedicalTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(false);
  };

  const handleTemplateModalClose = () => {
    setShowTemplateModal(false);
  };

  const generateNoteMutation = useMutation({
    mutationFn: async (data: { transcription: string; visitId: number; templateId?: number }) => {
      const response = await apiRequest("POST", "/api/generate-note", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "Tıbbi not başarıyla oluşturuldu.",
      });
      setGeneratedNote(data);
      setShowMedicalNote(true);
      setIsGeneratingNote(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Tıbbi not oluşturulurken hata oluştu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleTranscriptionReady = async (newTranscription: string) => {
    setTranscription(newTranscription);
    
    // Otomatik olarak tıbbi not oluştur
    if (createdVisitId && selectedTemplate && newTranscription.trim()) {
      setIsGeneratingNote(true);
      try {
        await generateNoteMutation.mutateAsync({
          transcription: newTranscription,
          visitId: createdVisitId,
          templateId: selectedTemplate.id,
        });
      } catch (error) {
        console.error("Failed to generate note:", error);
      } finally {
        setIsGeneratingNote(false);
      }
    }
  };

  const handleCompleteAndNavigate = () => {
    if (createdVisitId) {
      setLocation(`/visit/${createdVisitId}`);
    }
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

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === parseInt(patientId));
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  const handleVisitTypeChange = (value: string) => {
    setVisitType(value as "ilk" | "kontrol" | "konsultasyon");
  };

  // Mock patients for demonstration
  const mockPatients = [
    {
      id: 1,
      name: "Ayşe",
      surname: "Yılmaz",
      tcKimlik: "12345678901",
      phone: "0532 123 45 67",
      createdAt: new Date()
    },
    {
      id: 2,
      name: "Mehmet",
      surname: "Demir",
      tcKimlik: "98765432109",
      phone: "0533 987 65 43",
      createdAt: new Date()
    },
    {
      id: 3,
      name: "Fatma",
      surname: "Kaya",
      tcKimlik: "11223344556",
      phone: "0534 111 22 33",
      createdAt: new Date()
    }
  ];

  const displayPatients = patients.length > 0 ? patients : mockPatients;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Yeni Muayene</h2>
                <p className="text-sm text-gray-600">Hasta ve şablon seçimi yapın</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!visitCreated ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Hasta Seçimi */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Hasta Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Hasta</Label>
                    {selectedPatient ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              {selectedPatient.name} {selectedPatient.surname}
                            </p>
                            {selectedPatient.tcKimlik && (
                              <p className="text-sm text-blue-700 font-mono mt-1">
                                TC: {selectedPatient.tcKimlik}
                              </p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedPatient(null)}
                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                          >
                            Değiştir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Select onValueChange={handlePatientSelect}>
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Hasta seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {displayPatients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.name} {patient.surname}
                              {patient.tcKimlik && ` - TC: ${patient.tcKimlik}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Muayene Türü</Label>
                    <Select value={visitType} onValueChange={handleVisitTypeChange}>
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Muayene türü seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ilk">İlk Muayene</SelectItem>
                        <SelectItem value="kontrol">Kontrol Muayenesi</SelectItem>
                        <SelectItem value="konsultasyon">Konsültasyon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Şablon Seçimi */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-gray-900">
                    <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                    Şablon Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate ? (
                      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">{selectedTemplate.name}</h4>
                            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedTemplate.specialty}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTemplateModal(true)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            Değiştir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowTemplateModal(true)}
                        variant="outline"
                        className="w-full h-20 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      >
                        <div className="flex flex-col items-center">
                          <Stethoscope className="h-6 w-6 text-gray-400 mb-2" />
                          <span className="text-gray-600">Şablon Seç</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Muayene Başlat */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleStartVisit}
                  disabled={!selectedPatient || !selectedTemplate || createVisitMutation.isPending}
                  size="lg"
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  {createVisitMutation.isPending ? "Oluşturuluyor..." : "Muayeneyi Başlat"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Muayene Oluşturuldu */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-green-600">
                    ✓ Muayene Kaydı Oluşturuldu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">
                        {selectedPatient?.name} {selectedPatient?.surname}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getVisitTypeText(visitType)} - {selectedTemplate?.name}
                      </p>
                    </div>
                    <p className="text-gray-700">
                      Artık hasta konuşmasını kaydetmeye başlayabilirsiniz.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Kayıt Kontrolleri */}
              <RecordingControls 
                onTranscriptionReady={handleTranscriptionReady}
                visitId={createdVisitId ?? undefined}
                templateId={selectedTemplate?.id}
              />

              {/* Transkripsiyon Önizleme */}
              {transcription && (
                <Card>
                  <CardHeader>
                    <CardTitle>Kayıt Önizlemesi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Not Oluşturma Durumu */}
              {(isGeneratingNote || generateNoteMutation.isPending) && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Tıbbi Not Oluşturuluyor</h3>
                        <p className="text-sm text-gray-600">AI transkripsiyon metnini analiz ediyor...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tıbbi Not Görüntüleme */}
              {showMedicalNote && generatedNote && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center text-green-600">
                        ✓ Tıbbi Not Başarıyla Oluşturuldu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-2">
                        <h3 className="font-bold text-lg">
                          {selectedPatient?.name} {selectedPatient?.surname}
                        </h3>
                        <p className="text-gray-600">
                          {getVisitTypeText(visitType)} - {selectedTemplate?.specialty}
                        </p>
                        {selectedPatient?.tcKimlik && (
                          <p className="text-sm text-gray-500">TC: {selectedPatient.tcKimlik}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-center">
                    <Button onClick={handleCompleteAndNavigate} size="lg" className="bg-green-600 hover:bg-green-700">
                      Muayene Notunu Görüntüle
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Şablon Seçim Modal */}
      <TemplateModal
        templates={templates}
        onSelect={handleTemplateSelect}
        onClose={handleTemplateModalClose}
        open={showTemplateModal}
      />
    </div>
  );
}