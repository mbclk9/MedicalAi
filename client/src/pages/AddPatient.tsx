import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, UserPlus, Save, X } from "lucide-react";
import { Link } from "wouter";

interface PatientFormData {
  name: string;
  surname: string;
  tcKimlik: string;
  phone: string;
  sgkNumber: string;
  birthDate: string;
  gender: string;
  email: string;
  address: string;
}

export default function AddPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    surname: "",
    tcKimlik: "",
    phone: "",
    sgkNumber: "",
    birthDate: "",
    gender: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<PatientFormData>>({});

  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      // Prepare data for API
      const patientData = {
        name: data.name.trim(),
        surname: data.surname.trim(),
        tcKimlik: data.tcKimlik.trim() || undefined,
        phone: data.phone.trim() || undefined,
        sgkNumber: data.sgkNumber.trim() || undefined,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        gender: data.gender || undefined,
        email: data.email.trim() || undefined,
        address: data.address.trim() || undefined,
      };

      console.log("Sending patient data:", patientData);
      
      const response = await apiRequest("POST", "/api/patients", patientData);
      return response.json();
    },
    onSuccess: (newPatient) => {
      toast({
        title: "✅ Başarılı",
        description: `${newPatient.name} ${newPatient.surname} başarıyla eklendi.`,
      });
      
      console.log("Patient created successfully:", newPatient);
      
      // Invalidate patient list to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/visits/recent"] });
      
      // Navigate back to patients list
      setLocation("/patients");
    },
    onError: (error) => {
      console.error("Patient creation failed:", error);
      toast({
        title: "❌ Hata",
        description: "Hasta eklenirken hata oluştu: " + error.message,
        variant: "destructive",
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Ad gereklidir";
    }
    if (!formData.surname.trim()) {
      newErrors.surname = "Soyad gereklidir";
    }

    // TC Kimlik validation (optional but if provided should be valid)
    if (formData.tcKimlik.trim()) {
      const tcRegex = /^[1-9][0-9]{10}$/;
      if (!tcRegex.test(formData.tcKimlik.trim())) {
        newErrors.tcKimlik = "TC Kimlik numarası 11 haneli olmalı ve 0 ile başlamamalı";
      }
    }

    // Phone validation (optional but if provided should be valid)
    if (formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
        newErrors.phone = "Geçerli bir telefon numarası girin (10-11 rakam)";
      }
    }

    // Email validation (optional but if provided should be valid)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Geçerli bir email adresi girin";
      }
    }

    // Birth date validation (should not be in future)
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = "Doğum tarihi gelecekte olamaz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "⚠️ Form Hatası",
        description: "Lütfen formdaki hataları düzeltin.",
        variant: "destructive",
      });
      return;
    }

    createPatientMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      surname: "",
      tcKimlik: "",
      phone: "",
      sgkNumber: "",
      birthDate: "",
      gender: "",
      email: "",
      address: "",
    });
    setErrors({});
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/patients">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Hasta Listesi
                </Button>
              </Link>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <UserPlus className="mr-3 h-6 w-6" />
                  Yeni Hasta Ekle
                </h2>
                <p className="text-sm text-gray-600">
                  Yeni hasta kaydı oluşturun
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Hasta Bilgileri</CardTitle>
                <p className="text-sm text-gray-600">
                  * ile işaretlenen alanlar zorunludur
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Temel Bilgiler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Ad *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Hasta adı"
                        className={errors.name ? "border-red-500" : ""}
                        required
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="surname" className="text-sm font-medium">
                        Soyad *
                      </Label>
                      <Input
                        id="surname"
                        value={formData.surname}
                        onChange={(e) => handleInputChange("surname", e.target.value)}
                        placeholder="Hasta soyadı"
                        className={errors.surname ? "border-red-500" : ""}
                        required
                      />
                      {errors.surname && (
                        <p className="text-sm text-red-600">{errors.surname}</p>
                      )}
                    </div>
                  </div>

                  {/* Kimlik Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tcKimlik" className="text-sm font-medium">
                        TC Kimlik No
                      </Label>
                      <Input
                        id="tcKimlik"
                        value={formData.tcKimlik}
                        onChange={(e) => {
                          // Sadece rakam girişine izin ver
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            handleInputChange("tcKimlik", value);
                          }
                        }}
                        placeholder="12345678901"
                        maxLength={11}
                        className={errors.tcKimlik ? "border-red-500" : ""}
                      />
                      {errors.tcKimlik && (
                        <p className="text-sm text-red-600">{errors.tcKimlik}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-sm font-medium">
                        Cinsiyet
                      </Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Cinsiyet seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="erkek">Erkek</SelectItem>
                          <SelectItem value="kadın">Kadın</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Telefon
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          // Telefon numarası formatlaması
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 11) {
                            handleInputChange("phone", value);
                          }
                        }}
                        placeholder="05551234567"
                        maxLength={11}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="hasta@email.com"
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Sağlık Bilgileri */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sgkNumber" className="text-sm font-medium">
                        SGK Numarası
                      </Label>
                      <Input
                        id="sgkNumber"
                        value={formData.sgkNumber}
                        onChange={(e) => handleInputChange("sgkNumber", e.target.value)}
                        placeholder="SGK numarası"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-sm font-medium">
                        Doğum Tarihi
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        max={new Date().toISOString().split('T')[0]} // Gelecek tarih seçimini engelle
                        className={errors.birthDate ? "border-red-500" : ""}
                      />
                      {errors.birthDate && (
                        <p className="text-sm text-red-600">{errors.birthDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Adres */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Adres
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Ev/iş adresi (opsiyonel)"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={createPatientMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Temizle
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/patients")}
                      >
                        İptal
                      </Button>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={createPatientMutation.isPending}
                      className="medical-gradient text-white"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createPatientMutation.isPending ? "Kaydediliyor..." : "Hasta Ekle"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔧 Geliştirici Bilgisi</h4>
                  <p className="text-sm text-blue-800">
                    Hasta database'e kaydedilecek. PostgreSQL bağlantınızın aktif olduğundan emin olun.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}