import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  Edit, 
  Trash2, 
  Plus,
  Heart,
  Brain,
  Baby,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { MedicalTemplate } from "@/types/medical";
import { motion } from "framer-motion";
import { AnimatedPage, staggerContainer, staggerItem, hoverScale } from "@/components/AnimatedPage";

export default function Templates() {
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Başarılı",
        description: "Şablon başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Şablon silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTemplate = (templateId: number, templateName: string) => {
    if (confirm(`"${templateName}" şablonunu silmek istediğinize emin misiniz?`)) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case "kardiyoloji":
        return Heart;
      case "nöroloji":
        return Brain;
      case "pediatri":
        return Baby;
      default:
        return Activity;
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty.toLowerCase()) {
      case "kardiyoloji":
        return "bg-red-50 text-red-700 border-red-200";
      case "nöroloji":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "pediatri":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ortopedi":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Mock templates if none exist
  const mockTemplates = [
    {
      id: 1,
      name: "Genel Muayene",
      specialty: "Genel",
      description: "Uzmania: Genel",
    },
    {
      id: 2,
      name: "Kardiyoloji Konsültasyonu",
      specialty: "Kardiyoloji",
      description: "Uzmania: Kardiyoloji",
    },
    {
      id: 3,
      name: "Pediatrik Değerlendirme",
      specialty: "Pediatri",
      description: "Uzmania: Pediatri",
    },
    {
      id: 4,
      name: "Ortopedi Muayenesi",
      specialty: "Ortopedi",
      description: "Uzmania: Ortopedi",
    },
  ];

  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatedPage>
          <motion.div 
            className="bg-white shadow-sm border-b px-6 py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Ana Sayfa
                    </Button>
                  </motion.div>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Şablon Kütüphanesi</h1>
                  <p className="text-sm text-gray-600">
                    AI tarafından oluşturulan notların yapısını ve içeriğini özelleştirin
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Şablon Oluştur
                </Button>
              </motion.div>
            </div>
          </motion.div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTemplates.map((template) => {
                const SpecialtyIcon = getSpecialtyIcon(template.specialty);
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getSpecialtyColor(template.specialty)}`}>
                            <SpecialtyIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {template.specialty}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            disabled={deleteTemplateMutation.isPending}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Sil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && displayTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz şablon bulunmuyor
              </h3>
              <p className="text-gray-600 mb-4">
                İlk şablonunuzu oluşturmak için aşağıdaki butona tıklayın.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                İlk Şablonu Oluştur
              </Button>
            </div>
          )}
                  </div>
        </AnimatedPage>
      </div>
    </div>
  );
} 