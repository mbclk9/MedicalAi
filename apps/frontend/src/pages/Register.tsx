import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mic } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }
    
    setIsLoading(true);
    
    // Simulated registration - in real app, this would call API
    setTimeout(() => {
      setLocation("/dashboard");
    }, 1000);
  };

  const handleGoogleRegister = () => {
    // Google OAuth implementation would go here
    console.log("Google register clicked");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyChange = (value: string) => {
    handleInputChange("specialty", value);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center overflow-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Mic className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Medikal Sekreter'e Katılın</CardTitle>
          <p className="text-gray-600">AI destekli tıbbi sekreter platformu</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full py-6 text-base"
            onClick={handleGoogleRegister}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google ile Devam Et
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">VEYA</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Mehmet Yılmaz"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Uzmanlık Alanı</Label>
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
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-11"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="h-11"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-base bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Hesap Oluşturuluyor..." : "Hesap Oluştur"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{" "}
              <Link href="/login">
                <Button variant="link" className="p-0 h-auto text-sm">
                  Giriş Yapın
                </Button>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 