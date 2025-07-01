import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  UserPlus, 
  Calendar,
  Phone,
  IdCard,
  ArrowLeft,
  Eye,
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Patient } from "@/types/medical";

export default function PatientList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Başarılı",
        description: "Hasta kaydı silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Hasta silinirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleDeletePatient = (patientId: number, patientName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`${patientName} adlı hastayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      deletePatientMutation.mutate(patientId);
    }
  };

  // Arama filtreleme
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.tcKimlik && patient.tcKimlik.includes(searchTerm)) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("tr-TR");
  };

  const calculateAge = (birthDate: Date | string | undefined) => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Hasta Listesi
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toplam {filteredPatients.length} hasta kayıtlı
                </p>
              </div>
            </div>
            <Link to="/patients/add">
              <Button className="medical-gradient text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Yeni Hasta Ekle
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 border-b px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Hasta ara (ad, soyad, TC, telefon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <UserPlus className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? "Hasta bulunamadı" : "Henüz hasta kaydı yok"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? "Arama kriterlerinize uygun hasta bulunamadı." 
                  : "İlk hasta kaydınızı oluşturmak için aşağıdaki butona tıklayın."
                }
              </p>
              {!searchTerm && (
                <Link to="/patients/add">
                  <Button className="medical-gradient text-white">
                    <UserPlus className="mr-2 h-4 w-4" />
                    İlk Hastayı Ekle
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {patient.name} {patient.surname}
                        </h3>
                        {patient.birthDate && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {calculateAge(patient.birthDate)} yaş
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Hasta detay sayfasına git
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeletePatient(patient.id, `${patient.name} ${patient.surname}`, e)}
                          disabled={deletePatientMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {patient.tcKimlik && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <IdCard className="h-3 w-3 mr-2" />
                          <span className="font-mono">{patient.tcKimlik}</span>
                        </div>
                      )}
                      
                      {patient.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3 w-3 mr-2" />
                          {patient.phone}
                        </div>
                      )}
                      
                      {patient.sgkNumber && (
                        <div className="flex items-center text-sm">
                          <Badge variant="outline" className="text-xs">
                            SGK: {patient.sgkNumber}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Kayıt: {formatDate(patient.createdAt)}
                        </span>
                        <Link to={`/visit/new?patientId=${patient.id}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            Muayene Başlat
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}