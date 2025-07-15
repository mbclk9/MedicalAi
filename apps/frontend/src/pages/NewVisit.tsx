import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, User, Stethoscope, Clock, Sparkles, BrainCircuit, CheckCircle, BookOpen, Mic
} from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { TemplateModal } from "@/components/TemplateModal";
import { RecordingControls } from "@/components/RecordingControls";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, MedicalTemplate } from "@/types/medical";
import { PatientSelectModal } from "@/components/PatientSelectModal";
import { VisitTypeSelectModal } from "@/components/VisitTypeSelectModal";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export default function NewVisit() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/visit/:id");
  // Wouter'ın useLocation'ı yerine standart Web API'sini kullanacağız.
  // const [searchParams] = useLocation();

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
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showVisitTypeModal, setShowVisitTypeModal] = useState(false);
  const [medicalNote, setMedicalNote] = useState<any>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [transcriptionConfidence, setTranscriptionConfidence] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // URL parametrelerini okumak için daha güvenilir olan window.location.search'ü kullan
  const urlParams = new URLSearchParams(window.location.search);
  const visitIdFromUrl = urlParams.get('visitId');

  // Hata ayıklama için konsol günlükleri
  console.log("--- Muayene Sayfası Render ---");
  console.log("URL'den okunan visitId:", visitIdFromUrl);
  console.log("Mevcut 'visitCreated' state'i:", visitCreated);

  const {
    data: existingVisit,
    isLoading: isLoadingExistingVisit,
    isError: isErrorExistingVisit
  } = useQuery({
    queryKey: ['/api/visits', visitIdFromUrl],
    queryFn: async () => {
      console.log(`Mevcut muayene verisi çekiliyor, ID: ${visitIdFromUrl}`);
      // apiRequest'in tüm yanıtı döndürdüğünü varsayalım
      const response = await apiRequest("GET", `/api/visits/${visitIdFromUrl}`);
      // Hata durumunda response.json() patlayabilir, kontrol ekleyelim
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch visit: ${errorText}`);
      }
      return response.json();
    },
    enabled: !!visitIdFromUrl,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: templates = [] } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
  });

  // URL'den template ID ve patient ID'yi al
  useEffect(() => {
    // URL'den template ID ve patient ID'yi al (bu kısım doğru çalışıyor)
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
  }, [templates, patients, urlParams]);
  
  // Mevcut muayene verilerini yükle
  useEffect(() => {
    if (existingVisit) {
      setSelectedPatient(existingVisit.patient);
      setSelectedTemplate(existingVisit.template);
      setVisitType(existingVisit.visitType);
      setCreatedVisitId(existingVisit.id);
      setVisitCreated(true);
      if (existingVisit.recording?.transcription) {
        setTranscription(existingVisit.recording.transcription);
      }
    }
  }, [existingVisit]);

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

  const completeVisitMutation = useMutation({
    mutationFn: async (visitId: number) => {
      return apiRequest("PATCH", `/api/visits/${visitId}`, { status: "completed" });
    },
    onSuccess: (data, visitId) => {
      toast({
        title: "Başarılı",
        description: "Muayene başarıyla tamamlandı ve kaydedildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      setLocation(`/visit/${visitId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: `Muayene tamamlanırken bir hata oluştu: ${error.message}`,
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
      if (!response.ok) {
        // Hata mesajını daha anlaşılır hale getirelim
        const errorData = await response.json().catch(() => ({ message: 'Sunucudan geçersiz yanıt.' }));
        throw new Error(errorData.message || 'Tıbbi not oluşturulamadı.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: "Tıbbi not başarıyla oluşturuldu.",
      });
      setMedicalNote(data); // `setGeneratedNote` yerine `setMedicalNote` kullanalım
      setIsGeneratingNote(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
      setIsGeneratingNote(false); // Hata durumunda da loading state'i kapat
    },
  });

  const handleTranscriptionReady = async (newTranscription: string, confidence?: number) => {
    setTranscription(newTranscription);
    setTranscriptionConfidence(typeof confidence === 'number' ? confidence : null);
    
    // Otomatik olarak tıbbi not oluştur
    if (createdVisitId && selectedTemplate && newTranscription.trim()) {
      setIsGeneratingNote(true);
      setNoteError(null); // Hata state'ini temizle
      generateNoteMutation.mutate({
        transcription: newTranscription,
        visitId: createdVisitId,
        templateId: selectedTemplate.id,
      });
    }
  };

  const handleCompleteAndNavigate = () => {
    if (createdVisitId) {
      completeVisitMutation.mutate(createdVisitId);
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

  if (isLoadingExistingVisit) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Muayene verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (isErrorExistingVisit) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center text-red-600">
          <p>Muayene verileri yüklenirken bir hata oluştu.</p>
          <p>Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/visits">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {visitIdFromUrl ? "Muayeneye Devam Et" : "Yeni Muayene"}
                </h2>
                <p className="text-sm text-gray-600">
                  {visitIdFromUrl 
                    ? `${selectedPatient?.name ?? ''} ${selectedPatient?.surname ?? ''} için kayda devam edin`
                    : "Hasta ve şablon seçimi yapın"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {(!visitCreated && !visitIdFromUrl) ? (
            // ########## YENİ MUAYENE OLUŞTURMA FORMU ##########
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
                      <Button
                        variant="outline"
                        className="w-full h-11 justify-start"
                        onClick={() => setShowPatientModal(true)}
                      >
                        <User className="mr-2 h-5 w-5 text-blue-600" />
                        Hasta seçin...
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Muayene Türü</Label>
                    <Button
                      variant="outline"
                      className="w-full h-11 justify-start"
                      onClick={() => setShowVisitTypeModal(true)}
                    >
                      <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                      {getVisitTypeText(visitType)}
                    </Button>
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
            // ########## AKTİF MUAYENE EKRANI (YENİ TASARIM) ##########
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              
              {/* EĞER DEVAM EDEN MUAYENE İSE, ÖNCEKİ BİLGİLERİ GÖSTER */}
              {visitIdFromUrl && existingVisit && (
                <Card className="bg-gray-50 border-dashed">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-700">
                      <BookOpen className="h-5 w-5" />
                      <span>Önceki Oturum Bilgileri</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {existingVisit.recording?.transcription && (
                      <div>
                        <Label className="font-semibold">Önceki Transkripsiyon</Label>
                        <Textarea readOnly value={existingVisit.recording.transcription} className="mt-1 bg-white h-24 resize-none" />
                      </div>
                    )}
                    {existingVisit.medicalNote?.visitSummary && (
                       <div>
                        <Label className="font-semibold">Önceki Not Özeti</Label>
                        <p className="mt-1 p-2 bg-white rounded-md border">{existingVisit.medicalNote.visitSummary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* MUAYENE OLUŞTURULDU BİLGİ KUTUSU */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-green-700 font-semibold">✓ Muayene Kaydı Oluşturuldu</div>
                <div className="font-bold text-gray-800 mt-1">{selectedPatient?.name} {selectedPatient?.surname}</div>
                <div className="text-gray-600 text-sm">{getVisitTypeText(visitType)} - {selectedTemplate?.specialty}</div>
              </div>

              {/* SES KAYDI KARTI */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-blue-600" />
                    <span>Ses Kaydı</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2 pt-4">
                  <p className="text-gray-600 text-sm">Hasta-doktor görüşmesini kaydetmeye başlayın.</p>
                  <RecordingControls 
                    onTranscriptionReady={(text, confidence) => handleTranscriptionReady(text, confidence)}
                    visitId={createdVisitId ?? undefined}
                    templateId={selectedTemplate?.id}
                  />
                  <p className="text-xs text-gray-400 pt-2">Hasta muayenesini kaydetmek için mikrofona tıklayın.</p>
                </CardContent>
              </Card>

              {/* METİN DÖNÜŞTÜRME (TRANSKRİPSİYON) KARTI */}
              {transcription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                        <span>Metin Dönüştürme</span>
                        {transcriptionConfidence && <Badge variant="outline">Güven: {Math.round(transcriptionConfidence * 100)}%</Badge>}
                      </div>
                      <Button variant="ghost" size="sm"><i className="fas fa-pen h-4 w-4"></i></Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} className="resize-none h-28" />
                  </CardContent>
                </Card>
              )}

              {/* TIBBİ NOT OLUŞTURMA KARTI */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-600" />
                    <span>Tıbbi Not Oluşturma</span>
                    {isGeneratingNote && <Badge variant="secondary">Oluşturuluyor...</Badge>}
                    {medicalNote && <Badge className="bg-green-100 text-green-800">✓ Tıbbi Not Otomatik Oluşturuldu</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isGeneratingNote && !medicalNote && (
                     <div className="text-center text-gray-500 py-8">
                      <p>Ses kaydı ve metin dönüştürme tamamlandığında AI notu burada görünecektir.</p>
                    </div>
                  )}
                  {isGeneratingNote && (
                     <div className="text-center text-gray-500 py-8">
                       <p>AI Tıbbi Notu oluşturuyor, lütfen bekleyin...</p>
                    </div>
                  )}
                  {medicalNote && (
                    <div className="space-y-4 pt-2">
                      {/* Muayene Özeti - Mavi */}
                        {medicalNote.visitSummary && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <h4 className="font-semibold text-blue-800 mb-2">Muayene Özeti</h4>
                            <div className="text-blue-900 text-sm">{medicalNote.visitSummary}</div>
                          </div>
                        )}

                        {/* Subjektif - Turuncu */}
                        {medicalNote.subjective && (
                          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
                             <h4 className="font-semibold text-orange-800 mb-2">Subjektif (Hasta Anlatımı)</h4>
                            <div className="text-orange-900 text-sm space-y-1">
                              <div><strong>Ana Şikayet:</strong> {medicalNote.subjective.mainComplaint || medicalNote.subjective.complaint}</div>
                              <div><strong>Mevcut Şikayetler:</strong> {medicalNote.subjective.storyOfComplaint || medicalNote.subjective.currentComplaints}</div>
                            </div>
                          </div>
                        )}

                        {/* Objektif - Mor */}
                        {medicalNote.objective && (
                          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                            <h4 className="font-semibold text-purple-800 mb-2">Objektif (Muayene Bulguları)</h4>
                            <div className="text-purple-900 text-sm space-y-1">
                              <div><strong>Fizik Muayene:</strong> {medicalNote.objective.physicalExam}</div>
                              <div><strong>Vital Bulgular:</strong> {medicalNote.objective.vitalSigns}</div>
                            </div>
                          </div>
                        )}

                        {/* Değerlendirme - Kırmızı */}
                        {medicalNote.assessment && (
                          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                             <h4 className="font-semibold text-red-800 mb-2">Değerlendirme</h4>
                            <div className="text-red-900 text-sm space-y-1">
                              <div><strong>Genel Değerlendirme:</strong> {medicalNote.assessment.summary || medicalNote.assessment.general}</div>
                              {medicalNote.assessment.diagnoses && (
                                <div><strong>Tanılar:</strong> Kardiyoloji konsültasyonu</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Plan - Yeşil */}
                        {medicalNote.plan && (
                          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                            <h4 className="font-semibold text-green-800 mb-2">Plan</h4>
                            <div className="text-green-900 text-sm space-y-1">
                              <div><strong>Tedavi:</strong> {medicalNote.plan.treatment}</div>
                              <div><strong>Takip:</strong> {medicalNote.plan.followUp}</div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* MUAYENE TAMAMLANDI KUTUSU VE BUTON */}
              {medicalNote && (
                 <div className="text-center space-y-4">
                   <Button size="lg" onClick={handleCompleteAndNavigate} className="bg-blue-600 hover:bg-blue-700">
                     Detaylı Notu Görüntüle
                   </Button>
                   <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                     <div className="text-green-700 font-semibold">✓ Tıbbi Not Başarıyla Oluşturuldu</div>
                     <div className="font-bold text-gray-800 mt-1">{selectedPatient?.name} {selectedPatient?.surname}</div>
                     <p className="text-sm text-gray-500">TC: {selectedPatient?.tcKimlik}</p>
                   </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {/* Şablon Seçim Modal */}
      <TemplateModal
        templates={templates}
        onTemplateSelect={handleTemplateSelect}
        onClose={handleTemplateModalClose}
        open={showTemplateModal}
      />
      {/* Hasta Seçim Modalı */}
      <PatientSelectModal
        open={showPatientModal}
        patients={displayPatients}
        onPatientSelect={(patient) => {
          setSelectedPatient(patient);
          setShowPatientModal(false);
        }}
        onClose={() => setShowPatientModal(false)}
        onAddPatient={() => {
          setShowPatientModal(false);
          setLocation("/patients/add");
        }}
      />
      {/* Muayene Türü Seçim Modalı */}
      <VisitTypeSelectModal
        open={showVisitTypeModal}
        value={visitType}
        onSelect={(type) => {
          setVisitType(type as "ilk" | "kontrol" | "konsultasyon");
          setShowVisitTypeModal(false);
        }}
        onClose={() => setShowVisitTypeModal(false)}
      />
    </div>
  );
}