import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Settings, Save } from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Doctor } from "@/types/medical";

export default function Profile() {
  const { toast } = useToast();

  const { data: doctor } = useQuery<Doctor>({
    queryKey: ["/api/doctor"],
  });

  const [formData, setFormData] = useState({
    name: doctor?.name || "Muhammet Çelik",
    email: doctor?.email || "mçelik34@gmail.com",
    title: doctor?.title || "Prof.",
    specialty: doctor?.specialty || "Kardiyoloji",
    notLength: "Standart",
    notStyle: "Paragraf",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/doctor"] });
      toast({
        title: "Başarılı",
        description: "Profil bilgileri güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleTitleChange = (value: string) => {
    handleInputChange("title", value);
  };

  const handleSpecialtyChange = (value: string) => {
    handleInputChange("specialty", value);
  };

  const handleNotLengthChange = (value: string) => {
    handleInputChange("notLength", value);
  };

  const handleNotStyleChange = (value: string) => {
    handleInputChange("notStyle", value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profil ve Ayarlar</h1>
              <p className="text-sm text-gray-600">
                Kişisel bilgilerinizi ve sistem tercihlerinizi yönetin
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Kişisel Bilgiler */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <User className="h-5 w-5 text-blue-600" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                        {formData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                      <p className="text-sm text-gray-600">{formData.specialty}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Ad Soyad</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Muhammet Çelik"
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
                        placeholder="mçelik34@gmail.com"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">Unvan</Label>
                      <Select value={formData.title} onValueChange={handleTitleChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Unvan seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Prof.">Prof.</SelectItem>
                          <SelectItem value="Doç.">Doç.</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Uzm.">Uzm.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty" className="text-sm font-medium text-gray-700">Uzmanlık Alanı</Label>
                      <Select value={formData.specialty} onValueChange={handleSpecialtyChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Uzmanlık alanı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Kardiyoloji">Kardiyoloji</SelectItem>
                          <SelectItem value="İç Hastalıkları">İç Hastalıkları</SelectItem>
                          <SelectItem value="Pediatri">Pediatri</SelectItem>
                          <SelectItem value="Ortopedi">Ortopedi</SelectItem>
                          <SelectItem value="Nöroloji">Nöroloji</SelectItem>
                          <SelectItem value="Genel Cerrah">Genel Cerrah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Not Tercihleri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Not Tercihleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 bg-white">
                      <Label htmlFor="notLength" className="text-sm font-medium text-gray-700">Not Uzunluğu</Label>
                      <Select value={formData.notLength} onValueChange={handleNotLengthChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Not uzunluğu seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standart">Standart</SelectItem>
                          <SelectItem value="Kısa">Kısa</SelectItem>
                          <SelectItem value="Detaylı">Detaylı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notStyle" className="text-sm font-medium text-gray-700">Not Stili</Label>
                      <Select value={formData.notStyle} onValueChange={handleNotStyleChange}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Not stili seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paragraf">Paragraf</SelectItem>
                          <SelectItem value="Madde">Madde</SelectItem>
                          <SelectItem value="Tablo">Tablo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kaydet Butonu */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={updateProfileMutation.isPending}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-12 font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 