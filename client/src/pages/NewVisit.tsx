import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

  // Get template ID from URL if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId && templates.length > 0) {
      const template = templates.find(t => t.id === parseInt(templateId));
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, []);

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: templates = [] } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
  });

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

  const handleTranscriptionReady = (newTranscription: string) => {
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
                  Yeni Muayene Başlat
                </h2>
                <p className="text-sm text-gray-600">
                  Hasta ve şablon seçimi yaparak muayeneye başlayın
                </p>
              </div>
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
                      <Select onValueChange={(value) => {
                        const patient = patients.find(p => p.id === parseInt(value));
                        setSelectedPatient(patient || null);
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hasta seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.name} {patient.surname}
                              {patient.tcKimlik && ` - TC: ${patient.tcKimlik}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        Şablon Seç
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Start Visit Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleStartVisit}
                  disabled={!selectedPatient || !selectedTemplate || createVisitMutation.isPending}
                  size="lg"
                  className="w-full max-w-md medical-gradient text-white"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  {createVisitMutation.isPending ? "Oluşturuluyor..." : "Muayeneyi Başlat"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Visit Created - Recording Phase */}
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

              {/* Recording Controls */}
              <RecordingControls onTranscriptionReady={handleTranscriptionReady} />

              {/* Transcription Preview */}
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