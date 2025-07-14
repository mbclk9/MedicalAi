import { useState } from "react";
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
import type { MedicalTemplate } from "@/types/medical";

interface TemplateModalProps {
  templates: MedicalTemplate[];
  onSelect: (template: MedicalTemplate) => void;
  onClose: () => void;
  open: boolean;
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

export function TemplateModal({ templates, onSelect, onClose, open }: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);

  const handleTemplateClick = (template: MedicalTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      setSelectedTemplate(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
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

  // Mock templates for demonstration
  const mockTemplates = [
    {
      id: 1,
      name: "Genel Muayene",
      specialty: "Genel",
      description: "Rutin muayene şablonu",
      structure: {
        subjective: [],
        objective: [],
        assessment: [],
        plan: []
      }
    },
    {
      id: 2,
      name: "Kardiyoloji Konsültasyonu",
      specialty: "Kardiyoloji",
      description: "Kalp ve damar sistemi muayenesi",
      structure: {
        subjective: [],
        objective: [],
        assessment: [],
        plan: []
      }
    },
    {
      id: 3,
      name: "İç Hastalıkları",
      specialty: "İç Hastalıkları",
      description: "Genel dahiliye muayenesi",
      structure: {
        subjective: [],
        objective: [],
        assessment: [],
        plan: []
      }
    },
    {
      id: 4,
      name: "Pediatrik Değerlendirme",
      specialty: "Pediatri",
      description: "Çocuk hastalıkları muayenesi",
      structure: {
        subjective: [],
        objective: [],
        assessment: [],
        plan: []
      }
    }
  ];

  const displayTemplates = templates.length > 0 ? templates : mockTemplates;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Şablon Seçimi</DialogTitle>
          <p className="text-gray-600 mt-2">Muayene türünüze uygun şablonu seçin</p>
        </DialogHeader>

        <div className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTemplates.map((template) => {
              const IconComponent = getIconForTemplate(template.name, template.specialty);
              const colorClass = getColorForTemplate(template.name, template.specialty);
              const isSelected = selectedTemplate?.id === template.id;

              return (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
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
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Şablonu Seç ve Devam Et
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
