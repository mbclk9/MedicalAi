import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  UserPlus, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Activity,
  Shield,
  Lightbulb,
  Eye,
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Visit } from "@/types/medical";
import { motion } from "framer-motion";
import { AnimatedPage, staggerContainer, staggerItem, hoverScale, hoverTap } from "@/components/AnimatedPage";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: recentVisits = [], isLoading } = useQuery<Visit[]>({
    queryKey: ["/api/visits/recent"],
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
    if (confirm("Bu muayene kaydını silmek istediğinize emin misiniz?")) {
      deleteVisitMutation.mutate(visitId);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <AnimatedPage>
          {/* Header */}
          <motion.header 
            className="bg-white border-b border-gray-200 px-6 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Sık kullanılan işlemleri hızlıca gerçekleştirin</p>
              </div>
              <div className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.header>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Hızlı Eylemler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Eylemler</h2>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="in"
              >
                <motion.div variants={staggerItem}>
                  <Link href="/visit/new">
                    <motion.div
                      whileHover={hoverScale}
                      whileTap={hoverTap}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <Mic className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Yeni Kayıt Başlat</h3>
                              <p className="text-sm text-white/80">Hasta görüşmesi kaydet</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Link href="/patients/add">
                    <motion.div
                      whileHover={hoverScale}
                      whileTap={hoverTap}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-green-500 to-teal-600 text-white">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Hasta Ekle</h3>
                              <p className="text-sm text-white/80">Yeni hasta kayıt oluştur</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Link href="/templates">
                    <motion.div
                      whileHover={hoverScale}
                      whileTap={hoverTap}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-500 to-red-600 text-white">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Not Oluştur</h3>
                              <p className="text-sm text-white/80">Manuel tıbbi not yaz</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Son Ziyaretler */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Son Ziyaretler</span>
                      <span className="text-sm text-gray-500">Yenile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentVisits.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                        <p>Henüz muayene kaydı bulunmuyor</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentVisits.slice(0, 5).map((visit, index) => (
                          <Link key={visit.id} href={`/visit/${visit.id}`}>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium">
                                      {visit.patient?.name?.charAt(0)}{visit.patient?.surname?.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {visit.patient?.name} {visit.patient?.surname}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Kardiyoloji Konsültasyonu
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{formatDate(visit.visitDate)}</p>
                                <p className="text-sm text-gray-500">{formatTime(visit.visitDate)}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge className={getStatusColor(visit.status)}>
                                  {getStatusText(visit.status)}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteVisit(visit.id, e)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sistem Durumu */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sistem Durumu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">KVKK Uyumluluğu</span>
                      </div>
                      <Badge variant="outline" className="text-green-600">Aktif</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Transkripsiyon</span>
                      </div>
                      <Badge variant="outline" className="text-blue-600">% 98 Doğruluk</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Tıbbi Not Oluşturma</span>
                      </div>
                      <Badge variant="outline" className="text-purple-600">Hazır</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Kullanıcı İpuçları</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Kaliteli Kayıt</p>
                        <p className="text-sm text-blue-700">Sessiz ortamda, mikrofonumuzu yakın tutun</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Not Konsultasyonu</p>
                        <p className="text-sm text-green-700">Yanıt ile endilgili bilgiler daha açık konuşun</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">Otomatik İşlem</p>
                        <p className="text-sm text-purple-700">AI sistemi otomatik olarak SOAP nostu çıkaracak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        </AnimatedPage>
      </main>
    </div>
  );
}
