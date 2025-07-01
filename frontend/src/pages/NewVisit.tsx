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
      // Show the medical note in the same page instead of navigating
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
    
    // Automatically generate medical note after transcription
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
                      {selectedPatient ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
              <RecordingControls 
                onTranscriptionReady={handleTranscriptionReady}
                visitId={createdVisitId ?? undefined}
                templateId={selectedTemplate?.id}
              />

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

              {/* Note Generation Status */}
              {(isGeneratingNote || generateNoteMutation.isPending) && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">Tıbbi Not Oluşturuluyor</h3>
                        <p className="text-sm text-gray-600">AI transkripsiyon metnini analiz ediyor ve yapılandırılmış not hazırlıyor...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Medical Note */}
              {showMedicalNote && generatedNote && (
                <div className="space-y-6">
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

                  {/* Visit Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Muayene Özeti</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
                        {generatedNote.visitSummary}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Subjective */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-purple-600">Subjektif</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ana Şikayet</h4>
                        <p className="text-gray-700">{generatedNote.subjective?.complaint}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Mevcut Şikayetler</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{generatedNote.subjective?.currentComplaints}</p>
                      </div>
                      
                      {generatedNote.subjective?.medicalHistory && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tıbbi Geçmiş</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {Array.isArray(generatedNote.subjective.medicalHistory) 
                              ? generatedNote.subjective.medicalHistory.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))
                              : <li>{generatedNote.subjective.medicalHistory}</li>
                            }
                          </ul>
                        </div>
                      )}
                      
                      {generatedNote.subjective?.medications && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">İlaçlar</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {Array.isArray(generatedNote.subjective.medications) 
                              ? generatedNote.subjective.medications.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))
                              : <li>{generatedNote.subjective.medications}</li>
                            }
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Objective */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-orange-600">Objektif</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatedNote.objective?.vitalSigns && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Vital Bulgular</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(generatedNote.objective.vitalSigns).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-2 rounded">
                                <span className="text-sm font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {generatedNote.objective?.physicalExam && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Fizik Muayene</h4>
                          <p className="text-gray-700">{generatedNote.objective.physicalExam}</p>
                        </div>
                      )}
                      
                      {generatedNote.objective?.diagnosticResults && generatedNote.objective.diagnosticResults.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tetkik Sonuçları</h4>
                          {generatedNote.objective.diagnosticResults.map((result: any, index: number) => (
                            <div key={index} className="mb-3">
                              <h5 className="font-medium text-gray-800">{result.test}</h5>
                              <ul className="list-disc list-inside text-gray-700 ml-4">
                                {result.results.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Assessment & Plan */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">Değerlendirme ve Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Genel Değerlendirme</h4>
                        <p className="text-gray-700">{generatedNote.assessment?.general}</p>
                      </div>
                      
                      {generatedNote.assessment?.diagnoses && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tanılar</h4>
                          {generatedNote.assessment.diagnoses.map((diagnosis: any, index: number) => (
                            <div key={index} className="bg-red-50 p-3 rounded-lg">
                              <p className="font-medium">{diagnosis.diagnosis}</p>
                              {diagnosis.icd10Code && (
                                <p className="text-sm text-gray-600">ICD-10: {diagnosis.icd10Code}</p>
                              )}
                              <span className={`inline-block px-2 py-1 text-xs rounded ${
                                diagnosis.type === 'ana' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {diagnosis.type === 'ana' ? 'Ana Tanı' : diagnosis.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {generatedNote.plan?.treatment && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Tedavi Planı</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {generatedNote.plan.treatment.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {generatedNote.plan?.medications && generatedNote.plan.medications.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">İlaç Tedavisi</h4>
                          <div className="space-y-2">
                            {generatedNote.plan.medications.map((med: any, index: number) => (
                              <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-medium">{med.name}</p>
                                <p className="text-sm text-gray-600">
                                  {med.dosage} - {med.frequency}
                                  {med.duration && ` - ${med.duration}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {generatedNote.plan?.followUp && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Takip</h4>
                          <p className="text-gray-700">{generatedNote.plan.followUp}</p>
                        </div>
                      )}
                      
                      {generatedNote.plan?.lifestyle && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Yaşam Tarzı Önerileri</h4>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {generatedNote.plan.lifestyle.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
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