import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Save, Heart, Phone, Shield } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/types/medical";

export default function AddPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    // Kimlik Bilgileri
    name: "",
    surname: "",
    tcKimlik: "",
    passportNo: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    maritalStatus: "",
    
    // İletişim Bilgileri
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    
    // Sağlık Sigortası
    sgkNumber: "",
    insuranceType: "",
    insuranceCompany: "",
    
    // Acil Durum
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Tıbbi Bilgiler
    bloodType: "",
    chronicDiseases: "",
    allergies: "",
    medications: "",
    notes: "",
  });

  const addPatientMutation = useMutation({
    mutationFn: async (patientData: typeof formData): Promise<Patient> => {
      // Boş alanları temizle
      const cleanData = Object.fromEntries(
        Object.entries(patientData).map(([key, value]) => [key, value || undefined])
      );
      
      console.log("Sending patient data:", cleanData);
      
      const response = await apiRequest("POST", "/api/patients", cleanData);
      const result = await response.json();
      
      console.log("Patient creation response:", result);
      
      return result;
    },
    onSuccess: (newPatient: Patient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Başarılı",
        description: `${newPatient.name} ${newPatient.surname} başarıyla eklendi.`,
      });
      setLocation("/patients");
    },
    onError: (error: any) => {
      console.error("Patient creation error:", error);
      
      let errorMessage = "Hasta eklenirken bir hata oluştu.";
      
      if (error.message) {
        try {
          const errorData = JSON.parse(error.message.split(': ')[1] || '{}');
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.map((e: any) => e.message).join(', ');
          }
        } catch {
          if (error.message.includes(':')) {
            errorMessage = error.message.split(': ')[1] || errorMessage;
          }
        }
      }
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zorunlu alanları kontrol et
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

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: "Geçersiz Telefon",
        description: "Geçerli bir telefon numarası giriniz.",
        variant: "destructive",
      });
      return;
    }

    addPatientMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (value: string) => {
    handleInputChange("gender", value);
  };

  const handleMaritalStatusChange = (value: string) => {
    handleInputChange("maritalStatus", value);
  };

  const handleInsuranceTypeChange = (value: string) => {
    handleInputChange("insuranceType", value);
  };

  const handleEmergencyContactRelationChange = (value: string) => {
    handleInputChange("emergencyContactRelation", value);
  };

  const handleBloodTypeChange = (value: string) => {
    handleInputChange("bloodType", value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Hasta Listesi
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Hasta Ekle</h1>
              <p className="text-sm text-gray-600">
                Hasta bilgilerini eksiksiz doldurun
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            
            {/* Kimlik Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <User className="h-5 w-5 text-blue-600" />
                  Kimlik Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Ad *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ayşe"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname" className="text-sm font-medium text-gray-700">Soyad *</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                      placeholder="Çelik"
                      className="h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tcKimlik" className="text-sm font-medium text-gray-700">TC Kimlik No</Label>
                    <Input
                      id="tcKimlik"
                      value={formData.tcKimlik}
                      onChange={(e) => handleInputChange("tcKimlik", e.target.value.replace(/\D/g, "").slice(0, 11))}
                      placeholder="12345678912"
                      className="h-11"
                      maxLength={11}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passportNo" className="text-sm font-medium text-gray-700">Pasaport No (Yabancılar için)</Label>
                    <Input
                      id="passportNo"
                      value={formData.passportNo}
                      onChange={(e) => handleInputChange("passportNo", e.target.value)}
                      placeholder="A12345678"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">Doğum Tarihi</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange("birthDate", e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace" className="text-sm font-medium text-gray-700">Doğum Yeri</Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                      placeholder="İstanbul"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium text-gray-700">Cinsiyet</Label>
                    <Select value={formData.gender} onValueChange={handleGenderChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Cinsiyet seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Erkek">Erkek</SelectItem>
                        <SelectItem value="Kadın">Kadın</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus" className="text-sm font-medium text-gray-700">Medeni Hal</Label>
                    <Select value={formData.maritalStatus} onValueChange={handleMaritalStatusChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Medeni hal seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bekar">Bekar</SelectItem>
                        <SelectItem value="Evli">Evli</SelectItem>
                        <SelectItem value="Dul">Dul</SelectItem>
                        <SelectItem value="Boşanmış">Boşanmış</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* İletişim Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Phone className="h-5 w-5 text-blue-600" />
                  İletişim Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="0533 987 65 43"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="ayse@example.com"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Adres</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Tam adres..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">İl</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="İstanbul"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-medium text-gray-700">İlçe</Label>
                    <Input
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange("district", e.target.value)}
                      placeholder="Kadıköy"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">Posta Kodu</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="34000"
                      className="h-11"
                      maxLength={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sağlık Sigortası */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Sağlık Sigortası
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sgkNumber" className="text-sm font-medium text-gray-700">SGK No</Label>
                    <Input
                      id="sgkNumber"
                      value={formData.sgkNumber}
                      onChange={(e) => handleInputChange("sgkNumber", e.target.value)}
                      placeholder="123456789"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceType" className="text-sm font-medium text-gray-700">Sigorta Türü</Label>
                    <Select value={formData.insuranceType} onValueChange={handleInsuranceTypeChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Sigorta türü seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SGK">SGK</SelectItem>
                        <SelectItem value="Özel Sigorta">Özel Sigorta</SelectItem>
                        <SelectItem value="Yok">Yok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceCompany" className="text-sm font-medium text-gray-700">Sigorta Şirketi</Label>
                  <Input
                    id="insuranceCompany"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange("insuranceCompany", e.target.value)}
                    placeholder="Sigorta şirketi adı"
                    className="h-11"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Acil Durum İletişim */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Acil Durum İletişim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">Yakın Kişi Adı</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      placeholder="Mehmet Çelik"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-gray-700">Yakın Kişi Telefon</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      placeholder="0533 123 45 67"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelation" className="text-sm font-medium text-gray-700">Yakınlık</Label>
                    <Select value={formData.emergencyContactRelation} onValueChange={handleEmergencyContactRelationChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Yakınlık derecesi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eş">Eş</SelectItem>
                        <SelectItem value="Anne">Anne</SelectItem>
                        <SelectItem value="Baba">Baba</SelectItem>
                        <SelectItem value="Kardeş">Kardeş</SelectItem>
                        <SelectItem value="Çocuk">Çocuk</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tıbbi Bilgiler */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Heart className="h-5 w-5 text-blue-600" />
                  Tıbbi Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">Kan Grubu</Label>
                    <Select value={formData.bloodType} onValueChange={handleBloodTypeChange}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Kan grubu seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A Rh+">A Rh+</SelectItem>
                        <SelectItem value="A Rh-">A Rh-</SelectItem>
                        <SelectItem value="B Rh+">B Rh+</SelectItem>
                        <SelectItem value="B Rh-">B Rh-</SelectItem>
                        <SelectItem value="AB Rh+">AB Rh+</SelectItem>
                        <SelectItem value="AB Rh-">AB Rh-</SelectItem>
                        <SelectItem value="0 Rh+">0 Rh+</SelectItem>
                        <SelectItem value="0 Rh-">0 Rh-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronicDiseases" className="text-sm font-medium text-gray-700">Kronik Hastalıklar</Label>
                  <Textarea
                    id="chronicDiseases"
                    value={formData.chronicDiseases}
                    onChange={(e) => handleInputChange("chronicDiseases", e.target.value)}
                    placeholder="Diyabet, hipertansiyon, vs..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies" className="text-sm font-medium text-gray-700">Alerjiler</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="İlaç alerjileri, besin alerjileri, vs..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications" className="text-sm font-medium text-gray-700">Düzenli Kullanılan İlaçlar</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    placeholder="İlaç adları ve dozları..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notlar</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Ek bilgiler..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kaydet Butonları */}
            <div className="flex gap-4 pt-6 pb-8">
              <Button 
                type="submit" 
                disabled={addPatientMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                {addPatientMutation.isPending ? "Kaydediliyor..." : "Hasta Kaydet"}
              </Button>
              <Link to="/patients">
                <Button variant="outline" type="button" className="w-32 h-12">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}