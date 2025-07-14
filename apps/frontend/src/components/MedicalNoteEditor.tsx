import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  User, 
  Heart, 
  Activity, 
  Clipboard, 
  Calendar,
  Clock,
  Save,
  Download,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Brain,
  FileCheck
} from "lucide-react";
import type { MedicalNote, Visit, Patient, MedicalTemplate } from "@/types/medical";

interface MedicalNoteEditorProps {
  visit?: Visit & { patient: Patient };
  medicalNote?: MedicalNote;
  template?: MedicalTemplate;
  transcription?: string;
  onSave?: (note: Partial<MedicalNote>) => void;
  isEditing?: boolean;
}

export function MedicalNoteEditor({ 
  visit, 
  medicalNote, 
  template,
  transcription,
  onSave, 
  isEditing = false 
}: MedicalNoteEditorProps) {
  const [editMode, setEditMode] = useState(isEditing);
  const [noteData, setNoteData] = useState<Partial<MedicalNote>>(medicalNote || {});

  useEffect(() => {
    if (medicalNote) {
      setNoteData(medicalNote);
    }
  }, [medicalNote]);

  const handleSave = () => {
    if (onSave) {
      onSave(noteData);
    }
    setEditMode(false);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCompletionPercentage = () => {
    if (!medicalNote) return 0;
    
    let completed = 0;
    let total = 4; // subjective, objective, assessment, plan
    
    if (medicalNote.subjective?.complaint) completed++;
    if (medicalNote.objective?.physicalExam) completed++;
    if (medicalNote.assessment?.general) completed++;
    if (medicalNote.plan?.treatment?.length) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const subjective = medicalNote?.subjective as any;
  const objective = medicalNote?.objective as any;
  const assessment = medicalNote?.assessment as any;
  const plan = medicalNote?.plan as any;

  // No medical note available yet
  if (!medicalNote) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-gray-300">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tıbbi Not Bekleniyor
                </h3>
                <p className="text-gray-600 mb-4">
                  Ses kaydı tamamlandığında AI otomatik olarak tıbbi not oluşturacak
                </p>
                {transcription && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Transkripsiyon Hazır
                    </p>
                    <p className="text-blue-700 text-sm">
                      {transcription.substring(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Tıbbi Not</h2>
              {visit && (
                <p className="text-sm text-gray-500">
                  {visit.patient?.name} {visit.patient?.surname} - {formatDate(visit.visitDate)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Düzenle
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  PDF İndir
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Not Tamamlanma Oranı
            </span>
            <span className="text-sm text-gray-500">
              {getCompletionPercentage()}%
            </span>
          </div>
          <Progress value={getCompletionPercentage()} className="h-2" />
        </div>
      </div>

      {/* Patient Info Summary */}
      {visit?.patient && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Hasta Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                <p className="font-medium text-gray-900">{visit.patient.name} {visit.patient.surname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">TC Kimlik</label>
                <p className="font-medium font-mono text-gray-900">{visit.patient.tcKimlik || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefon</label>
                <p className="font-medium text-gray-900">{visit.patient.phone || 'Belirtilmemiş'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Muayene Türü</label>
                <Badge variant="outline" className="border-blue-200 text-blue-800">
                  {visit.visitType === 'ilk' ? 'İlk Muayene' : 
                   visit.visitType === 'kontrol' ? 'Kontrol' : 'Konsültasyon'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Info */}
      {template && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">{template.name}</p>
                <p className="text-sm text-purple-700">{template.specialty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SOAP Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjective (Anamnez) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="h-5 w-5" />
              Subjektif (Anamnez)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Ana Şikayet</label>
              {editMode ? (
                <Textarea
                  value={subjective?.complaint || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    subjective: { ...subjective, complaint: e.target.value }
                  })}
                  className="min-h-[60px]"
                  placeholder="Hastanın ana şikayetini girin..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] flex items-center">
                  <p className="text-sm text-gray-700">
                    {subjective?.complaint || 'Belirtilmemiş'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mevcut Şikayetler</label>
              {editMode ? (
                <Textarea
                  value={subjective?.currentComplaints || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    subjective: { ...subjective, currentComplaints: e.target.value }
                  })}
                  className="min-h-[80px]"
                  placeholder="Mevcut şikayetlerin detayını girin..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                  <p className="text-sm text-gray-700">
                    {subjective?.currentComplaints || 'Belirtilmemiş'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tıbbi Geçmiş</label>
              <div className="bg-gray-50 rounded-lg p-3 min-h-[60px]">
                {subjective?.medicalHistory?.length > 0 ? (
                  <ul className="space-y-1">
                    {subjective.medicalHistory.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Özel bir tıbbi geçmiş yok</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objective (Fizik Muayene) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Activity className="h-5 w-5" />
              Objektif (Fizik Muayene)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Vital Bulgular</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {objective?.vitalSigns ? Object.entries(objective.vitalSigns).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  )) : (
                    <p className="text-gray-500 col-span-2">Vital bulgular kaydedilmemiş</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Fizik Muayene</label>
              {editMode ? (
                <Textarea
                  value={objective?.physicalExam || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    objective: { ...objective, physicalExam: e.target.value }
                  })}
                  className="min-h-[100px]"
                  placeholder="Fizik muayene bulgularını girin..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
                  <p className="text-sm text-gray-700">
                    {objective?.physicalExam || 'Normal'}
                  </p>
                </div>
              )}
            </div>

            {objective?.diagnosticResults?.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tetkik Sonuçları</label>
                <div className="bg-gray-50 rounded-lg p-3">
                  {objective.diagnosticResults.map((result: any, index: number) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <p className="text-sm font-medium text-gray-800">{result.test}</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {result.results.map((res: string, resIndex: number) => (
                          <li key={resIndex}>• {res}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment (Değerlendirme) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Heart className="h-5 w-5" />
              Değerlendirme
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Genel Değerlendirme</label>
              {editMode ? (
                <Textarea
                  value={assessment?.general || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    assessment: { ...assessment, general: e.target.value }
                  })}
                  className="min-h-[80px]"
                  placeholder="Genel değerlendirmeyi girin..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 min-h-[80px]">
                  <p className="text-sm text-gray-700">
                    {assessment?.general || 'Belirtilmemiş'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tanılar</label>
              <div className="space-y-2">
                {assessment?.diagnoses?.length > 0 ? (
                  assessment.diagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{diagnosis.diagnosis}</span>
                        <div className="flex items-center gap-2">
                          {diagnosis.icd10Code && (
                            <Badge variant="secondary" className="text-xs">
                              {diagnosis.icd10Code}
                            </Badge>
                          )}
                          <Badge 
                            variant={diagnosis.type === 'ana' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {diagnosis.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">Tanı belirtilmemiş</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan (Tedavi Planı) */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Clipboard className="h-5 w-5" />
              Tedavi Planı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tedavi Yaklaşımı</label>
              <div className="bg-gray-50 rounded-lg p-3">
                {plan?.treatment?.length > 0 ? (
                  <ul className="space-y-1">
                    {plan.treatment.map((item: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Tedavi planı belirtilmemiş</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Reçete Edilen İlaçlar</label>
              <div className="space-y-2">
                {plan?.medications?.length > 0 ? (
                  plan.medications.map((med: any, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-900">{med.name}</p>
                          <p className="text-sm text-blue-700">
                            {med.dosage} - {med.frequency}
                            {med.duration && ` - ${med.duration}`}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">İlaç reçete edilmemiş</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Takip Planı</label>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <p className="text-sm text-gray-700">
                    {plan?.followUp || 'Takip planı belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Summary */}
      {medicalNote?.visitSummary && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <FileText className="h-5 w-5" />
              Muayene Özeti
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-800 leading-relaxed">
                {medicalNote.visitSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      {(medicalNote?.transcription || transcription) && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Clock className="h-5 w-5" />
              Transkripsiyon Kaydı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-32">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {medicalNote?.transcription || transcription}
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
