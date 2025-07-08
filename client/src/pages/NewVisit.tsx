import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Stethoscope, Clock, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { TemplateModal } from "@/components/TemplateModal";
import { RecordingControls } from "@/components/RecordingControls";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Patient, MedicalTemplate } from "@/types";

export default function NewVisit() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/visit/new");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);
  const [visitType, setVisitType] = useState<"ilk" | "kontrol" | "konsultasyon">("kontrol");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [visitCreated, setVisitCreated] = useState(false);
  const [createdVisitId, setCreatedVisitId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: patients = [], 
    isLoading: isLoadingPatients,
    error: patientsError,
    refetch: refetchPatients 
  } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patients");
      return response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { 
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
    refetch: refetchTemplates 
  } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/templates");
      return response.json();
    },
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Get template ID and patient ID from URL if provided
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
      console.log("Creating visit with data:", visitData);
      const response = await apiRequest("POST", "/api/visits", visitData);
      return response.json();
    },
    onSuccess: (visit) => {
      console.log("Visit created successfully:", visit);
      setCreatedVisitId(visit.id);
      setVisitCreated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      toast({
        title: "✅ Başarılı",
        description: "Yeni muayene kaydı oluşturuldu.",
      });
    },
    onError: (error) => {
      console.error("Create visit error:", error);
      toast({
        title: "❌ Hata",
        description: "Muayene kaydı oluşturulurken hata oluştu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartVisit = async () => {
    if (!selectedPatient) {
      toast({
        title: "⚠️ Uyarı",
        description: "Lütfen bir hasta seçin.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate) {
      toast({
        title: "⚠️ Uyarı", 
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

  const handlePatientSelect = (value: string) => {
    console.log("Patient select value:", value);
    
    // Boş değerleri kontrol et
    if (!value || value === "" || value === "undefined") {
      console.log("Invalid patient value, clearing selection");
      setSelectedPatient(null);
      return;
    }
    
    const patientId = parseInt(value);
    if (isNaN(patientId)) {
      console.log("Invalid patient ID:", value);
      return;
    }
    
    const patient = patients.find(p => p.id === patientId);
    console.log("Found patient:", patient);
    setSelectedPatient(patient || null);
  };

  const handleTranscriptionReady = async (newTranscription: string) => {
    setTranscription(newTranscription);
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

  // Loading state
  if (isLoadingPatients || isLoadingTemplates) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <h3 className="text-lg font-medium text-gray-900">Yükleniyor...</h3>
              <p className="text-gray-600">
                {isLoadingPatients ? "Hasta verileri" : "Şablon verileri"} yükleniyor...
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Error state
  if (patientsError || templatesError) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">Database Bağlantı Hatası</h3>
              <p className="text-gray-600">
                {patientsError ? "Hasta verileri yüklenemedi." : "Şablon verileri yüklenemedi."}
              </p>
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>Hata: {(patientsError || templatesError)?.message}</p>
              </div>
              <div className="flex space-x-2 justify-center">
                <Button 
                  onClick={() => {
                    refetchPatients();
                    refetchTemplates();
                  }} 
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tekrar Dene
                </Button>
                <Button onClick={() => setLocation("/")} variant="outline">
                  Ana Sayfa
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
                  {selectedPatient ? `${selectedPatient.name} ${selectedPatient.surname} - Yeni Muayene` : 'Yeni Muayene Başlat'}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedPatient ? 'Şablon seçimi yaparak muayeneye başlayın' : 'Hasta ve şablon seçimi yaparak muayeneye başlayın'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Database: {patients.length} hasta, {templates.length} şablon
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {!visitCreated ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Hasta Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient-select">Hasta</Label>
                      
                      {/* Hasta yoksa uyarı göster */}
                      {patients.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Henüz hasta kaydı bulunmuyor
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                            Muayene başlatmak için önce en az bir hasta eklemeniz gerekiyor.
                            Database'e gerçek hasta verisi eklenecek.
                          </p>
                          <div className="space-y-3">
                            <Link href="/patients/add">
                              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                                <UserPlus className="mr-2 h-5 w-5" />
                                İlk Hastayı Ekle
                              </Button>
                            </Link>
                            <p className="text-xs text-gray-500">
                              PostgreSQL database'e kalıcı olarak kaydedilecek
                            </p>
                          </div>
                        </div>
                      ) : selectedPatient ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900">
                                {selectedPatient.name} {selectedPatient.surname}
                              </p>
                              {selectedPatient.tcKimlik && (
                                <p className="text-sm text-blue-700 font-mono">
                                  TC: {selectedPatient.tcKimlik}
                                </p>
                              )}
                              {selectedPatient.phone && (
                                <p className="text-sm text-blue-700">
                                  Tel: {selectedPatient.phone}
                                </p>
                              )}
                              {selectedPatient.gender && (
                                <p className="text-sm text-blue-600">
                                  Cinsiyet: {selectedPatient.gender}
                                </p>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPatient(null)}
                              className="text-blue-700 hover:text-blue-900"
                            >
                              Değiştir
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Select 
                            value={selectedPatient?.id?.toString() || ""} 
                            onValueChange={handlePatientSelect}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Hasta seçin..." />
                            </SelectTrigger>
                            <SelectContent>
                              {patients
                                .filter(patient => 
                                  patient.id && 
                                  patient.name && 
                                  patient.surname &&
                                  patient.name.trim() !== "" &&
                                  patient.surname.trim() !== ""
                                )
                                .map((patient) => (
                                  <SelectItem 
                                    key={`patient-${patient.id}`} 
                                    value={patient.id.toString()}
                                  >
                                    <div className="flex flex-col">
                                      <span>{patient.name} {patient.surname}</span>
                                      <div className="flex space-x-4 text-xs text-gray-500">
                                        {patient.tcKimlik && (
                                          <span>TC: {patient.tcKimlik}</span>
                                        )}
                                        {patient.phone && (
                                          <span>Tel: {patient.phone}</span>
                                        )}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          
                          <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <span>📊 Database'de {patients.length} hasta kayıtlı</span>
                            <Link href="/patients/add">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-green-600 hover:text-green-800 font-medium"
                              >
                                <UserPlus className="mr-1 h-3 w-3" />
                                Yeni Hasta Ekle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="visit-type">Muayene Türü</Label>
                      <Select value={visitType} onValueChange={(value: any) => setVisitType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ilk">İlk Muayene</SelectItem>
                          <SelectItem value="kontrol">Kontrol Muayenesi</SelectItem>
                          <SelectItem value="konsultasyon">Konsültasyon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Şablon Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTemplate ? (
                      <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{selectedTemplate.name}</h4>
                            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedTemplate.specialty}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTemplateModal(true)}
                          >
                            Değiştir
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowTemplateModal(true)}
                        variant="outline"
                        className="w-full h-20 border-dashed"
                      >
                        <Stethoscope className="mr-2 h-5 w-5" />
                        Şablon Seç ({templates.length} şablon mevcut)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Start Visit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleStartVisit}
                  disabled={
                    !selectedPatient || 
                    !selectedTemplate || 
                    createVisitMutation.isPending || 
                    patients.length === 0
                  }
                  size="lg"
                  className="w-full max-w-md medical-gradient text-white"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  {createVisitMutation.isPending 
                    ? "Muayene Oluşturuluyor..." 
                    : !selectedPatient && patients.length > 0
                    ? "Önce Hasta Seçin"
                    : !selectedTemplate
                    ? "Önce Şablon Seçin"
                    : patients.length === 0
                    ? "Önce Hasta Ekleyin"
                    : "Muayeneyi Başlat"
                  }
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Visit Created - Recording Phase */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-green-600">
                    ✅ Muayene Kaydı Oluşturuldu
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
                      <p className="text-xs text-gray-500 mt-1">
                        Visit ID: {createdVisitId} | Database'e kaydedildi
                      </p>
                    </div>
                    <p className="text-gray-700">
                      Artık hasta konuşmasını kaydetmeye başlayabilirsiniz.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recording Controls */}
              <RecordingControls 
                onTranscriptionReady={handleTranscriptionReady}
                visitId={createdVisitId ?? undefined}
                templateId={selectedTemplate?.id}
              />

              <Separator />

              {/* Navigation */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  Ana Sayfaya Dön
                </Button>
                <Button
                  onClick={handleCompleteAndNavigate}
                  className="medical-gradient text-white"
                >
                  Not Düzenlemeye Geç
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <TemplateModal
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
}