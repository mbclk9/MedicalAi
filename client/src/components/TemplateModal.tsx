import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  UserCheck, 
  Baby, 
  UserPlus, 
  RotateCcw, 
  Stethoscope 
} from "lucide-react";
import type { MedicalTemplate } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect: (template: MedicalTemplate) => void;
}

const TEMPLATE_ICONS = {
  "Kardiyoloji": Heart,
  "İç Hastalıkları": UserCheck,
  "Pediatri": Baby,
  "Yeni Hasta": UserPlus,
  "Kontrol": RotateCcw,
  "Genel": Stethoscope,
};

const TEMPLATE_COLORS = {
  "Kardiyoloji": "bg-red-100 text-red-600",
  "İç Hastalıkları": "bg-blue-100 text-blue-600",
  "Pediatri": "bg-green-100 text-green-600",
  "Yeni Hasta": "bg-purple-100 text-purple-600",
  "Kontrol": "bg-orange-100 text-orange-600",
  "Genel": "bg-indigo-100 text-indigo-600",
};

export function TemplateModal({ open, onOpenChange, onTemplateSelect }: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery<MedicalTemplate[]>({
    queryKey: ["/api/templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/templates");
      return response.json();
    },
    enabled: open,
  });

  const handleTemplateClick = (template: MedicalTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const getIconForTemplate = (name: string, specialty: string) => {
    const IconComponent = TEMPLATE_ICONS[specialty as keyof typeof TEMPLATE_ICONS] || 
                         TEMPLATE_ICONS[name as keyof typeof TEMPLATE_ICONS] || 
                         Stethoscope;
    return IconComponent;
  };

  const getColorForTemplate = (name: string, specialty: string) => {
    return TEMPLATE_COLORS[specialty as keyof typeof TEMPLATE_COLORS] || 
           TEMPLATE_COLORS[name as keyof typeof TEMPLATE_COLORS] || 
           TEMPLATE_COLORS.Genel;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Şablon Seçimi</DialogTitle>
          <p className="text-gray-600">Muayene türünüze uygun şablonu seçin</p>
        </DialogHeader>

        <div className="py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Şablonlar yükleniyor...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => {
                const IconComponent = getIconForTemplate(template.name, template.specialty);
                const colorClass = getColorForTemplate(template.name, template.specialty);
                const isSelected = selectedTemplate?.id === template.id;

                return (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {template.specialty}
                        </Badge>
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            Freed tarafından
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedTemplate}
            className="medical-gradient text-white"
          >
            Şablonu Seç ve Devam Et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
