import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2,
  Eye,
  UserPlus,
  FilterX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryKeys } from "@/lib/queryClient";
import { formatDate, calculateAge, formatPhoneNumber } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";
import type { Patient } from "@/types";

export default function PatientList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Fetch patients
  const { 
    data: patients = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery<Patient[]>({
    queryKey: queryKeys.patients,
    queryFn: async () => {
      console.log("🔄 Fetching patients...");
      const response = await apiRequest("GET", "/api/patients");
      const result = await response.json();
      console.log("✅ Patients fetched:", result.length);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId: number) => {
      console.log("🗑️ Deleting patient:", patientId);
      const response = await apiRequest("DELETE", `/api/patients/${patientId}`);
      return response.json();
    },
    onSuccess: (data, patientId) => {
      console.log("✅ Patient deleted successfully:", data);
      
      // Invalidate patients query to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      
      toast({
        title: "Başarılı",
        description: `Hasta kaydı silindi.`,
      });
    },
    onError: (error: any) => {
      console.error("❌ Delete patient failed:", error);
      
      toast({
        title: "Hata",
        description: error.message || "Hasta silinirken hata oluştu.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(null);
    }
  });

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.surname.toLowerCase().includes(query) ||
      (patient.tcKimlik && patient.tcKimlik.includes(query)) ||
      (patient.phone && patient.phone.includes(query)) ||
      (patient.email && patient.email.toLowerCase().includes(query))
    );
  });

  const handleDeletePatient = async (patient: Patient) => {
    if (!confirm(`${patient.name} ${patient.surname} adlı hastayı silmek istediğinizden emin misiniz?`)) {
      return;
    }
    
    setIsDeleting(patient.id);
    await deletePatientMutation.mutateAsync(patient.id);
  };

  const handleViewPatient = (patientId: number) => {
    navigate(`/patients/${patientId}`);
  };

  const handleEditPatient = (patientId: number) => {
    navigate(`/patients/${patientId}/edit`);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (error) {
    console.error("❌ Patients query error:", error);
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hasta Listesi</h1>
              <p className="text-gray-600 mt-1">
                Toplam {patients.length} hasta {filteredPatients.length !== patients.length && `(${filteredPatients.length} gösteriliyor)`}
              </p>
            </div>
            <Button
              onClick={() => navigate("/patients/add")}
              className="medical-gradient text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Hasta
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Hasta adı, soyadı, TC kimlik veya telefon ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <FilterX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  Yenile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Hastalar yükleniyor...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <div className="text-red-600 mb-4">
                  <User className="mx-auto h-12 w-12 mb-2" />
                  <h3 className="text-lg font-medium">Hasta listesi yüklenemedi</h3>
                  <p className="text-sm mt-1">
                    {error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu"}
                  </p>
                </div>
                <Button onClick={() => refetch()} variant="outline">
                  Tekrar Dene
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredPatients.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                {searchQuery ? (
                  <div className="text-gray-500">
                    <Search className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Arama sonucu bulunamadı</h3>
                    <p className="text-sm mb-4">
                      "{searchQuery}" araması için sonuç bulunamadı.
                    </p>
                    <Button onClick={clearSearch} variant="outline">
                      Aramayı Temizle
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <UserPlus className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Henüz hasta kaydı yok</h3>
                    <p className="text-sm mb-4">
                      İlk hasta kaydınızı oluşturarak başlayın.
                    </p>
                    <Button
                      onClick={() => navigate("/patients/add")}
                      className="medical-gradient text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      İlk Hastayı Ekle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Patient List */}
          {!isLoading && !error && filteredPatients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {patient.name} {patient.surname}
                      </CardTitle>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPatient(patient.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPatient(patient.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePatient(patient)}
                          disabled={isDeleting === patient.id}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {isDeleting === patient.id ? (
                            <div className="animate-spin w-4 h-4 border border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Basic Info */}
                    <div className="space-y-2">
                      {patient.birthDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(patient.birthDate)}
                          {calculateAge(patient.birthDate) && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {calculateAge(patient.birthDate)} yaş
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {patient.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          {formatPhoneNumber(patient.phone)}
                        </div>
                      )}

                      {patient.gender && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          {patient.gender === "erkek" ? "Erkek" : "Kadın"}
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {patient.tcKimlik && (
                          <Badge variant="outline" className="text-xs">
                            TC: {patient.tcKimlik}
                          </Badge>
                        )}
                        {patient.sgkNumber && (
                          <Badge variant="outline" className="text-xs">
                            SGK: {patient.sgkNumber}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/visit/new?patientId=${patient.id}`)}
                        className="w-full"
                      >
                        Yeni Muayene
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}