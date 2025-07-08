import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Edit3
} from "lucide-react";
import type { MedicalNote, Visit, Patient } from "@/types/medical";

interface MedicalNoteEditorProps {
  visit?: Visit & { patient: Patient };
  medicalNote?: MedicalNote;
  onSave?: (note: Partial<MedicalNote>) => void;
  isEditing?: boolean;
}

export function MedicalNoteEditor({ 
  visit, 
  medicalNote, 
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

  const subjective = medicalNote?.subjective as any;
  const objective = medicalNote?.objective as any;
  const assessment = medicalNote?.assessment as any;
  const plan = medicalNote?.plan as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Tıbbi Not</h2>
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
                İndir
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
                className="medical-gradient text-white gap-2"
              >
                <Save className="h-4 w-4" />
                Kaydet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info */}
      {visit?.patient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Hasta Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                <p className="font-medium">{visit.patient.name} {visit.patient.surname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">TC Kimlik</label>
                <p className="font-medium">{visit.patient.tcKimlik || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Telefon</label>
                <p className="font-medium">{visit.patient.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Muayene Türü</label>
                <Badge variant="outline">
                  {visit.visitType === 'ilk' ? 'İlk Muayene' : 
                   visit.visitType === 'kontrol' ? 'Kontrol' : 'Konsültasyon'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjective (Anamnez) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Subjektif (Anamnez)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ana Şikayet</label>
              {editMode ? (
                <Textarea
                  value={subjective?.complaint || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    subjective: { ...subjective, complaint: e.target.value }
                  })}
                  className="mt-1"
                  rows={2}
                />
              ) : (
                <p className="mt-1 text-sm">{subjective?.complaint || 'Belirtilmemiş'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mevcut Şikayetler</label>
              {editMode ? (
                <Textarea
                  value={subjective?.currentComplaints || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    subjective: { ...subjective, currentComplaints: e.target.value }
                  })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm">{subjective?.currentComplaints || 'Belirtilmemiş'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tıbbi Geçmiş</label>
              <div className="mt-1">
                {subjective?.medicalHistory?.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {subjective.medicalHistory.map((item: string, index: number) => (
                      <li key={index} className="text-sm">{item}</li>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Objektif (Fizik Muayene)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Vital Bulgular</label>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Tansiyon:</span>
                  <span className="font-medium">{objective?.vitalSigns?.bloodPressure || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nabız:</span>
                  <span className="font-medium">{objective?.vitalSigns?.heartRate || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ateş:</span>
                  <span className="font-medium">{objective?.vitalSigns?.temperature || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Solunum:</span>
                  <span className="font-medium">{objective?.vitalSigns?.respiratoryRate || '-'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-700">Fizik Muayene</label>
              {editMode ? (
                <Textarea
                  value={objective?.physicalExam || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    objective: { ...objective, physicalExam: e.target.value }
                  })}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                <p className="mt-1 text-sm">{objective?.physicalExam || 'Normal'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment (Değerlendirme) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Değerlendirme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Genel Değerlendirme</label>
              {editMode ? (
                <Textarea
                  value={assessment?.general || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    assessment: { ...assessment, general: e.target.value }
                  })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <p className="mt-1 text-sm">{assessment?.general || 'Belirtilmemiş'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tanılar</label>
              <div className="mt-2 space-y-2">
                {assessment?.diagnoses?.length > 0 ? (
                  assessment.diagnoses.map((diagnosis: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{diagnosis.diagnosis}</span>
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
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Tanı belirtilmemiş</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan (Tedavi Planı) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-purple-600" />
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tedavi</label>
              {editMode ? (
                <Textarea
                  value={plan?.treatment?.join('\n') || ''}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    plan: { ...plan, treatment: e.target.value.split('\n') }
                  })}
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <div className="mt-1">
                  {plan?.treatment?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {plan.treatment.map((item: string, index: number) => (
                        <li key={index} className="text-sm">{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Tedavi planı belirtilmemiş</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">İlaçlar</label>
              <div className="mt-2 space-y-2">
                {plan?.medications?.length > 0 ? (
                  plan.medications.map((med: any, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-gray-600">
                        {med.dosage} - {med.frequency}
                        {med.duration && ` - ${med.duration}`}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">İlaç reçete edilmemiş</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Takip</label>
              <p className="mt-1 text-sm">{plan?.followUp || 'Belirtilmemiş'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Summary */}
      {medicalNote?.visitSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Muayene Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{medicalNote.visitSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Transcription */}
      {medicalNote?.transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Transkripsiyon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <p className="text-sm text-gray-600">{medicalNote.transcription}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
