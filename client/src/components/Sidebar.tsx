import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Stethoscope, 
  Plus, 
  Search, 
  FileText, 
  Settings,
  FilePlus2,
  Users,
  UserPlus,
  Activity
} from "lucide-react";
import type { Doctor, Visit, Patient } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface VisitWithPatient extends Visit {
  patient: Patient;
}

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: doctor } = useQuery<Doctor>({
    queryKey: ["/api/doctor"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/doctor");
      return response.json();
    },
  });

  const { data: recentVisits = [] } = useQuery<VisitWithPatient[]>({
    queryKey: ["/api/visits/recent"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/visits/recent");
      return response.json();
    },
  });

  // Son muayeneleri hasta bazında grupla ve her hastadan sadece en son olanı al
  const uniqueRecentVisits = recentVisits.reduce((acc, current) => {
    // Eğer bu hastanın daha yeni tarihli bir ziyareti zaten varsa, es geç
    const existingVisit = acc.find(item => item.patient.id === current.patient.id);
    if (existingVisit) {
      // Mevcut ziyaretin tarihi daha eskiyse, yenisiyle değiştir
      if (new Date(current.visitDate!) > new Date(existingVisit.visitDate!)) {
        return acc.map(item => item.patient.id === current.patient.id ? current : item);
      }
      return acc;
    }
    // Bu hasta ilk defa ekleniyorsa, listeye ekle
    return [...acc, current];
  }, [] as VisitWithPatient[]);

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
    <aside className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Stethoscope className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">MedAI Sekreter</h1>
            <p className="text-sm text-gray-500">Türkiye Sağlık Platformu</p>
          </div>
        </div>
      </div>

      {/* Muayene Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900 mb-3">Muayene</div>
        <div className="space-y-2">
          <Link href="/visit/new">
            <Button className="w-full medical-gradient text-white py-3 px-4 font-medium hover:opacity-90 transition-opacity">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Muayene Başlat
            </Button>
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Muayene ara..." 
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Hasta Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900 mb-3">Hasta Yönetimi</div>
        <div className="space-y-2">
          {/* Hasta Ekle Button - Prominent */}
          <Link href="/patients/add">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 font-medium transition-colors">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Hasta Ekle
            </Button>
          </Link>
          
          {/* Hasta Listesi */}
          <Link href="/patients" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
            location === "/patients" 
              ? "bg-blue-50 text-primary" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <Users className="h-4 w-4" />
            <span>Hasta Listesi</span>
          </Link>
          
          {/* Hasta Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Hasta ara..." 
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
        <div className="text-sm font-medium text-gray-900 mb-4">Dashboard</div>
        
        <Link href="/" className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
          location === "/" 
            ? "bg-blue-50 text-primary" 
            : "text-gray-700 hover:bg-gray-100"
        }`}>
          <FileText className="h-4 w-4" />
          <span>Tüm Muayeneler</span>
          <Badge variant="secondary" className="ml-auto">
            {recentVisits.length}
          </Badge>
        </Link>

        {/* Recent Visits Preview */}
        {uniqueRecentVisits.length > 0 && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <div className="text-sm font-medium text-gray-900 mb-3">Son Muayeneler</div>
            <div className="space-y-2">
              {uniqueRecentVisits.slice(0, 5).map((visit) => (
                <Link 
                  key={visit.id} 
                  href={`/visit/${visit.id}`}
                  className="block p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {visit.patient?.name} {visit.patient?.surname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {visit.visitType === 'ilk' ? 'İlk' : visit.visitType === 'kontrol' ? 'Kontrol' : 'Konsültasyon'}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(visit.status || 'in_progress')}`}
                    >
                      {(visit.status || 'in_progress') === 'in_progress' ? 'Devam' : 'Tamam'}
                    </Badge>
                  </div>
                </Link>
              ))}
              
              {uniqueRecentVisits.length > 5 && (
                <Link href="/" className="block text-xs text-primary hover:underline text-center pt-2">
                  Tümünü görüntüle ({uniqueRecentVisits.length - 5} daha)
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 mt-6">
          <div className="text-sm font-medium text-gray-900 mb-4">Ayarlar</div>
          
          <Link href="/templates" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
            <span>Şablon Yönetimi</span>
          </Link>
        </div>
      </nav>

      {/* Doctor Profile */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-gray-300 text-gray-600">
              {doctor?.name.split(' ').map(n => n[0]).join('') || 'MY'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {doctor?.name || 'Dr. Mehmet Yılmaz'}
            </div>
            <div className="text-xs text-gray-500">
              {doctor?.specialty || 'Kardiyoloji Uzmanı'}
            </div>
          </div>
          <Link href="/doctor-settings">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}