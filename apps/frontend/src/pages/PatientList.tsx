import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  UserPlus, 
  ArrowLeft,
  Edit,
  Trash2
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Patient } from "@/types/medical";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export default function PatientList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<{id: number, name: string} | null>(null);

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

  const handleDeletePatient = (patient: {id: number, name: string}) => {
    setPatientToDelete(patient);
    setIsConfirmOpen(true);
  };

  const executeDelete = () => {
    if (patientToDelete) {
      deletePatientMutation.mutate(patientToDelete.id);
      setPatientToDelete(null);
      setIsConfirmOpen(false);
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hasta Listesi</h1>
                <p className="text-sm text-gray-600">
                  Toplam {filteredPatients.length} hasta kayıtlı
                </p>
              </div>
            </div>
            <Link to="/patients/add">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Yeni Hasta Ekle
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
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

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Ad Soyad</TableHead>
                  <TableHead className="font-semibold">TC Kimlik No</TableHead>
                  <TableHead className="font-semibold">Doğum Tarihi</TableHead>
                  <TableHead className="font-semibold">Telefon</TableHead>
                  <TableHead className="font-semibold text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        <UserPlus className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? "Hasta bulunamadı" : "Henüz hasta kaydı yok"}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchTerm 
                            ? "Arama kriterlerinize uygun hasta bulunamadı." 
                            : "İlk hasta kaydınızı oluşturmak için aşağıdaki butona tıklayın."
                          }
                        </p>
                        {!searchTerm && (
                          <Link to="/patients/add">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <UserPlus className="mr-2 h-4 w-4" />
                              İlk Hastayı Ekle
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {patient.name} {patient.surname}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {patient.tcKimlik || "-"}
                      </TableCell>
                      <TableCell>
                        {formatDate(patient.birthDate)}
                      </TableCell>
                      <TableCell>
                        {patient.phone || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/visit/new?patientId=${patient.id}`}>
                            <Button size="sm" variant="outline">
                              Muayene Başlat
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePatient({id: patient.id, name: `${patient.name} ${patient.surname}`})}
                            disabled={deletePatientMutation.isPending}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Hastayı Silmeyi Onayla"
        description={
          <span>
            <strong>{patientToDelete?.name}</strong> adlı hastayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </span>
        }
        onConfirm={executeDelete}
        confirmText="Evet, Kalıcı Olarak Sil"
        variant="destructive"
      />
    </div>
  );
}