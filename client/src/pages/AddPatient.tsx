import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Save } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/medical";

export default function AddPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    tcKimlik: "",
    birthDate: "",
    sgkNumber: "",
    phone: "",
  });

  const addPatientMutation = useMutation({
    mutationFn: async (patientData: typeof formData): Promise<Patient> => {
      const requestData = {
        ...patientData,
        birthDate: patientData.birthDate ? new Date(patientData.birthDate) : undefined,
        // Boş alanları temizle
        tcKimlik: patientData.tcKimlik || undefined,
        sgkNumber: patientData.sgkNumber || undefined,
        phone: patientData.phone || undefined,
      };
      const response = await apiRequest("POST", "/api/patients", requestData);
      return await response.json();
    },
    onSuccess: (newPatient: Patient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Başarılı",
        description: `${newPatient.name} ${newPatient.surname} başarıyla eklendi.`,
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Hasta eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.surname.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Ad ve soyad alanları zorunludur.",
        variant: "destructive",
      });
      return;
    }

    if (formData.tcKimlik && formData.tcKimlik.length !== 11) {
      toast({
        title: "Geçersiz TC Kimlik",
        description: "TC Kimlik numarası 11 haneli olmalıdır.",
        variant: "destructive",
      });
      return;
    }

    addPatientMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Yeni Hasta Ekle
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hasta bilgilerini girin
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Hasta Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Hastanın adı"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Soyad *</Label>
                      <Input
                        id="surname"
                        value={formData.surname}
                        onChange={(e) => handleInputChange("surname", e.target.value)}
                        placeholder="Hastanın soyadı"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tcKimlik">TC Kimlik No</Label>
                      <Input
                        id="tcKimlik"
                        value={formData.tcKimlik}
                        onChange={(e) => handleInputChange("tcKimlik", e.target.value.replace(/\D/g, "").slice(0, 11))}
                        placeholder="12345678901"
                        maxLength={11}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Doğum Tarihi</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sgkNumber">SGK No</Label>
                      <Input
                        id="sgkNumber"
                        value={formData.sgkNumber}
                        onChange={(e) => handleInputChange("sgkNumber", e.target.value)}
                        placeholder="SGK numarası"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button 
                      type="submit" 
                      disabled={addPatientMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {addPatientMutation.isPending ? "Kaydediliyor..." : "Hasta Ekle"}
                    </Button>
                    <Link to="/">
                      <Button variant="outline" type="button">
                        İptal
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}