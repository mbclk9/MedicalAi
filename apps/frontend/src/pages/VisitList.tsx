import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft,
  Eye,
  Trash2,
  FileText,
  Calendar,
  User,
  Stethoscope
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Visit } from "@/types/medical";
import { motion } from "framer-motion";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function VisitList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteVisitId, setDeleteVisitId] = useState<number | null>(null);
  const [deleteVisitName, setDeleteVisitName] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: visits = [], isLoading } = useQuery<Visit[]>({
    queryKey: ["/api/visits"],
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
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      toast({
        title: "Başarılı",
        description: "Muayene kaydı silindi",
      });
      setIsDeleteDialogOpen(false);
      setDeleteVisitId(null);
      setDeleteVisitName("");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Muayene silinirken hata oluştu",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeleteVisitId(null);
      setDeleteVisitName("");
    },
  });

  const handleDeleteVisit = (visitId: number, patientName: string) => {
    setDeleteVisitId(visitId);
    setDeleteVisitName(patientName);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteVisitId) {
      deleteVisitMutation.mutate(deleteVisitId);
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
      minute: '2-digit',
    });
  };

  const getVisitTypeText = (type: string) => {
    switch (type) {
      case 'ilk':
        return 'İlk Muayene';
      case 'kontrol':
        return 'Kontrol';
      case 'konsultasyon':
        return 'Konsültasyon';
      default:
        return type;
    }
  };

  const getVisitTypeColor = (type: string) => {
    switch (type) {
      case 'ilk':
        return 'bg-green-100 text-green-800';
      case 'kontrol':
        return 'bg-blue-100 text-blue-800';
      case 'konsultasyon':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const filteredVisits = visits.filter(visit => {
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${visit.patient?.name || ''} ${visit.patient?.surname || ''}`.toLowerCase();
    return patientName.includes(searchLower) || 
           visit.patient?.tcKimlik?.includes(searchLower) ||
           getVisitTypeText(visit.visitType).toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <motion.main 
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
          {/* Header */}
          <motion.header 
            className="bg-white border-b border-gray-200 px-6 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Geri
                    </Button>
                  </motion.div>
                </Link>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tüm Muayeneler</h2>
                  <p className="text-sm text-gray-600">Hasta muayene kayıtlarını görüntüleyin ve yönetin</p>
                </div>
              </div>
              <Link href="/visit/new">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Yeni Muayene
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search and Stats */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Hasta adı, TC kimlik veya muayene türü ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{visits.length}</p>
                      <p className="text-sm text-gray-600">Toplam Muayene</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {visits.filter(v => v.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600">Tamamlanan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {visits.filter(v => v.status === 'in_progress').length}
                      </p>
                      <p className="text-sm text-gray-600">Devam Eden</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Set(visits.map(v => v.patientId)).size}
                      </p>
                      <p className="text-sm text-gray-600">Farklı Hasta</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Visits Table */}
          <Card>
            <CardHeader>
              <CardTitle>Muayene Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="ml-3 text-gray-600">Muayeneler yükleniyor...</p>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? "Arama sonucu bulunamadı" : "Henüz muayene kaydı yok"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? "Farklı arama terimleri deneyebilirsiniz" : "İlk muayene kaydınızı oluşturmak için başlayın"}
                  </p>
                  {!searchTerm && (
                    <Link href="/visit/new">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Yeni Muayene Başlat
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hasta</TableHead>
                      <TableHead>Muayene Türü</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Saat</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {visit.patient?.name?.charAt(0)}{visit.patient?.surname?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {visit.patient?.name} {visit.patient?.surname}
                              </p>
                              {visit.patient?.tcKimlik && (
                                <p className="text-sm text-gray-500 font-mono">
                                  TC: {visit.patient.tcKimlik}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getVisitTypeColor(visit.visitType)}>
                            {getVisitTypeText(visit.visitType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDate(visit.visitDate)}
                        </TableCell>
                        <TableCell>
                          {formatTime(visit.visitDate)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(visit.status)}>
                            {getStatusText(visit.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {visit.status === 'in_progress' ? (
                              <Link href={`/visit/new?visitId=${visit.id}`}>
                                <Button size="sm" variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                                  <Stethoscope className="h-4 w-4 mr-1" />
                                  Devam Et
                                </Button>
                              </Link>
                            ) : (
                              <Link href={`/visit/${visit.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Görüntüle
                                </Button>
                              </Link>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteVisit(visit.id, `${visit.patient?.name} ${visit.patient?.surname}`)}
                              disabled={deleteVisitMutation.isPending}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.main>
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Muayene Kaydı Silme"
        description={`${deleteVisitName} hastasının muayene kaydını silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        cancelText="İptal"
        variant="destructive"
      />
    </div>
  );
} 