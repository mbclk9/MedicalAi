import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  Wand2, 
  Clock, 
  FileText, 
  Activity, 
  ClipboardCheck, 
  Calendar 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MedicalNote, Visit, Patient, MedicalTemplate, MedicalNoteGeneration } from "@/types/medical";

// Explicitly type the diagnosis and medication structures based on MedicalNoteGeneration
type Diagnosis = MedicalNoteGeneration['assessment']['diagnoses'][0];
type Medication = MedicalNoteGeneration['plan']['medications'][0];
type DiagnosticResult = MedicalNoteGeneration['objective']['diagnosticResults'][0];

interface MedicalNoteEditorProps {
  visit: Visit;
  patient: Patient;
  medicalNote?: MedicalNote;
  template?: MedicalTemplate;
  transcription?: string;
}

export function MedicalNoteEditor({ 
  visit, 
  patient, 
  medicalNote, 
  template, 
  transcription 
}: MedicalNoteEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateNoteMutation = useMutation({
    mutationFn: async (data: { transcription: string; templateId?: number; visitId: number }) => {
      const response = await apiRequest("POST", "/api/generate-note", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visits", visit.id.toString()] });
      toast({
        title: "Başarılı",
        description: "Tıbbi not AI tarafından oluşturuldu.",
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Not oluşturulurken hata oluştu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateNote = async () => {
    if (!transcription) {
      toast({
        title: "Uyarı",
        description: "Not oluşturmak için önce ses kaydı yapın.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateNoteMutation.mutateAsync({
        transcription,
        templateId: template?.id,
        visitId: visit.id,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopyalandı",
        description: "Metin panoya kopyalandı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız.",
        variant: "destructive",
      });
    }
  };

  const copyAllNote = () => {
    if (!medicalNote) return;
    
    const fullNote = `
HASTA BİLGİLERİ:
${patient.name} ${patient.surname}
${patient.tcKimlik ? `TC: ${patient.tcKimlik}` : ''}
${patient.sgkNumber ? `SGK: ${patient.sgkNumber}` : ''}

MUAYENE ÖZETİ:
${medicalNote.visitSummary || 'Özet bulunamadı'}

SUBJEKTİF (ANAMNEZ):
Şikayetler: ${medicalNote.subjective?.complaint || 'Belirtilmedi'}
Mevcut Yakınmalar: ${medicalNote.subjective?.currentComplaints || 'Belirtilmedi'}
Tıbbi Öykü: ${medicalNote.subjective?.medicalHistory?.join(', ') || 'Belirtilmedi'}
İlaçlar: ${medicalNote.subjective?.medications?.join(', ') || 'Belirtilmedi'}

OBJEKTİF (FİZİK MUAYENE):
Vital Bulgular: ${Object.entries(medicalNote.objective?.vitalSigns || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}
Fizik Muayene: ${medicalNote.objective?.physicalExam || 'Belirtilmedi'}

DEĞERLENDİRME VE PLAN:
Genel Değerlendirme: ${medicalNote.assessment?.general || 'Belirtilmedi'}
Tedavi Planı: ${medicalNote.plan?.treatment?.join(', ') || 'Belirtilmedi'}
Takip: ${medicalNote.plan?.followUp || 'Belirtilmedi'}
    `.trim();
    
    copyToClipboard(fullNote);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {patient.name[0]}{patient.surname[0]}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {patient.name} {patient.surname}
                </h3>
                <p className="text-gray-600">
                  {getVisitTypeText(visit.visitType)} • {formatDate(visit.visitDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGenerateNote}
                disabled={isGenerating || !transcription}
                className="medical-gradient text-white"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? "AI Not Oluşturuyor..." : "AI ile Not Oluştur"}
              </Button>
              {medicalNote && (
                <Button
                  variant="outline"
                  onClick={copyAllNote}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Tümünü Kopyala
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Summary */}
      {medicalNote?.visitSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Muayene Özeti
              </CardTitle>
              <div className="flex items-center space-x-2">
                {visit.duration && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.floor(visit.duration / 60)} dakika
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(medicalNote.visitSummary!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{medicalNote.visitSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Subjective Section */}
      {medicalNote?.subjective && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Subjektif (Anamnez)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(medicalNote.subjective, null, 2))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalNote.subjective.complaint && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Şikayetler</h5>
                <p className="text-gray-700">{medicalNote.subjective.complaint}</p>
              </div>
            )}
            
            {medicalNote.subjective.currentComplaints && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Mevcut Yakınmalar</h5>
                <p className="text-gray-700">{medicalNote.subjective.currentComplaints}</p>
              </div>
            )}

            {medicalNote.subjective.medicalHistory && medicalNote.subjective.medicalHistory.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Tıbbi Öykü</h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {medicalNote.subjective.medicalHistory.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {medicalNote.subjective.medications && medicalNote.subjective.medications.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Kullandığı İlaçlar</h5>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {medicalNote.subjective.medications.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Objective Section */}
      {medicalNote?.objective && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Objektif (Fizik Muayene)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(medicalNote.objective, null, 2))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalNote.objective.vitalSigns && Object.keys(medicalNote.objective.vitalSigns).length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Vital Bulgular</h5>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(medicalNote.objective.vitalSigns).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">{key}</div>
                      <div className="text-lg font-semibold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medicalNote.objective.physicalExam && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Fizik Muayene</h5>
                <p className="text-gray-700">{medicalNote.objective.physicalExam}</p>
              </div>
            )}

            {medicalNote.objective.diagnosticResults && medicalNote.objective.diagnosticResults.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Tetkik Sonuçları</h5>
                <div className="space-y-3">
                  {medicalNote.objective.diagnosticResults.map((result: DiagnosticResult, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <h6 className="font-medium text-gray-900 mb-2">{result.test}:</h6>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {result.results.map((item: string, itemIndex: number) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assessment & Plan */}
      {(medicalNote?.assessment || medicalNote?.plan) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5" />
                Değerlendirme ve Plan
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify({
                  assessment: medicalNote.assessment,
                  plan: medicalNote.plan
                }, null, 2))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {medicalNote.assessment?.general && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Genel Değerlendirme</h5>
                <p className="text-gray-700">{medicalNote.assessment.general}</p>
              </div>
            )}

            {medicalNote.assessment?.diagnoses && medicalNote.assessment.diagnoses.length > 0 && (
              <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-3">Tanılar</h5>
                <div className="space-y-2">
                  {medicalNote.assessment.diagnoses.map((diagnosis: Diagnosis, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{diagnosis.diagnosis}</span>
                      <div className="flex items-center space-x-2">
                        {diagnosis.icd10Code && (
                          <Badge variant="outline">{diagnosis.icd10Code}</Badge>
                        )}
                        <Badge variant={diagnosis.type === 'ana' ? 'default' : 'secondary'}>
                          {diagnosis.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medicalNote.plan && (
              <div className="space-y-4">
                {medicalNote.plan.treatment && medicalNote.plan.treatment.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-800 mb-2">Tedavi Planı:</h6>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {medicalNote.plan.treatment.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {medicalNote.plan.medications && medicalNote.plan.medications.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-800 mb-2">İlaçlar:</h6>
                    <div className="space-y-2">
                      {medicalNote.plan.medications.map((med: Medication, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{med.name}</div>
                          <div className="text-sm text-gray-600">
                            {med.dosage} • {med.frequency}
                            {med.duration && ` • ${med.duration}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {medicalNote.plan.followUp && (
                  <div>
                    <h6 className="font-medium text-gray-800 mb-2">Kontrol:</h6>
                    <p className="text-gray-700 text-sm">{medicalNote.plan.followUp}</p>
                  </div>
                )}

                {medicalNote.plan.lifestyle && medicalNote.plan.lifestyle.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-800 mb-2">Yaşam Tarzı Önerileri:</h6>
                    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                      {medicalNote.plan.lifestyle.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Note State */}
      {!medicalNote && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz tıbbi not oluşturulmadı
            </h3>
            <p className="text-gray-600 mb-4">
              Ses kaydı yapın ve AI ile otomatik tıbbi not oluşturun
            </p>
            <Button
              onClick={handleGenerateNote}
              disabled={!transcription}
              className="medical-gradient text-white"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              AI ile Not Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
