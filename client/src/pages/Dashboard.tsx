import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Mic, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Visit, Patient } from "@/types";

interface VisitWithPatient extends Visit {
  patient: Patient;
}

export default function Dashboard() {
  const { toast } = useToast();

  const { data: recentVisits = [], isLoading } = useQuery<VisitWithPatient[]>({
    queryKey: ["/api/visits/recent"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/visits/recent");
      return response.json();
    },
  });

  const deleteVisitMutation = useMutation({
    mutationFn: async (visitId: number) => {
      const response = await fetch(`/api/visits/${visitId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete visit");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      toast({
        title: "Başarılı",
        description: "Muayene kaydı silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Muayene silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleDeleteVisit = (visitId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Bu muayene kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      deleteVisitMutation.mutate(visitId);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "in_progress":
        return "Devam Ediyor";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in_progress":
        return Clock;
      case "cancelled":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (date: Date | string | undefined | null) => {
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

  const formatDuration = (duration?: number | null) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes} dakika`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Hasta Notları</h2>
              <p className="text-sm text-gray-600">
                Son güncelleme: Bugün, {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>
              <Link href="/visit/new">
                <Button className="medical-gradient text-white">
                  <Mic className="mr-2 h-4 w-4" />
                  Kayıt Başlat
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Recent Visits List */}
            <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Muayeneler</h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">Henüz muayene kaydı yok</p>
                    <Link href="/visit/new">
                      <Button className="mt-4 medical-gradient text-white">
                        İlk Muayeneni Başlat
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentVisits.map((visit, index) => {
                      const StatusIcon = getStatusIcon(visit.status);
                      return (
                        <Link key={visit.id} href={`/visit/${visit.id}`}>
                          <Card className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            index === 0 ? "border-l-4 border-l-primary bg-blue-50" : ""
                          }`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {visit.patient?.name} {visit.patient?.surname}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {formatDate(visit.visitDate)} ({formatDuration(visit.duration)})
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {visit.visitType === 'ilk' ? 'İlk muayene' : 
                                     visit.visitType === 'kontrol' ? 'Kontrol muayenesi' : 
                                     'Konsültasyon'}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteVisit(visit.id, e)}
                                    disabled={deleteVisitMutation.isPending}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Badge className={getStatusColor(visit.status)}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {getStatusText(visit.status)}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mic className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      AI Tıbbi Sekreter'e Hoş Geldiniz
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Hasta muayenelerinizi kayıt altına alın ve AI ile otomatik olarak 
                      profesyonel tıbbi notlar oluşturun.
                    </p>
                    <div className="space-y-3">
                      <Link href="/visit/new">
                        <Button
                          size="lg"
                          className="w-full medical-gradient text-white"
                        >
                          <Mic className="mr-2 h-5 w-5" />
                          Yeni Muayene Başlat
                        </Button>
                      </Link>
                      <p className="text-sm text-gray-500">
                        Muayene şablonunu seçin ve ses kaydına başlayın
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Mic className="mr-2 h-5 w-5 text-primary" />
                        Türkçe Ses Tanıma
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Deepgram AI ile yüksek kaliteli Türkçe ses tanıma ve 
                        gerçek zamanlı transkripsiyon.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                        AI Destekli Notlar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        GPT-4 ile Türk sağlık sistemine uygun SOAP formatında 
                        profesyonel tıbbi notlar.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Download className="mr-2 h-5 w-5 text-blue-600" />
                        Şablon Sistemi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Kardiyoloji, İç Hastalıkları, Pediatri gibi branşlara 
                        özel muayene şablonları.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
