import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Activity,
  CheckCircle2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MedicalTemplate } from "@/types/medical";

interface TemplateModalProps {
  open: boolean;
  templates: MedicalTemplate[];
  onTemplateSelect: (template: MedicalTemplate) => void;
  onClose: () => void;
}

const getSpecialtyIcon = (specialty: string) => {
  switch (specialty.toLowerCase()) {
    case 'kardiyoloji':
      return <Heart className="h-6 w-6" />;
    case 'nöroloji':
      return <Brain className="h-6 w-6" />;
    case 'pediatri':
      return <Baby className="h-6 w-6" />;
    case 'iç hastalıkları':
      return <Activity className="h-6 w-6" />;
    default:
      return <FileText className="h-6 w-6" />;
  }
};

const mockTemplates: MedicalTemplate[] = [
  { id: 1, name: 'Genel Muayene', description: 'Genel tıp muayenesi için standart şablon', specialty: 'Genel', structure: { subjective: [], objective: [], assessment: [], plan: [] }, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Kardiyoloji Konsültasyonu', description: 'Kalp hastalıkları için özel muayene şablonu', specialty: 'Kardiyoloji', structure: { subjective: [], objective: [], assessment: [], plan: [] }, isDefault: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'İç Hastalıkları Muayenesi', description: 'Genel iç hastalıkları değerlendirmesi', specialty: 'İç Hastalıkları', structure: { subjective: [], objective: [], assessment: [], plan: [] }, isDefault: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Pediatri Muayenesi', description: 'Çocuk hastalıkları değerlendirmesi', specialty: 'Pediatri', structure: { subjective: [], objective: [], assessment: [], plan: [] }, isDefault: false, createdAt: new Date(), updatedAt: new Date() }
];

export function TemplateModal({
  open,
  templates,
  onTemplateSelect,
  onClose,
}: TemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MedicalTemplate | null>(null);
  
  const displayTemplates = useMemo(() => 
    templates && templates.length > 0 ? templates : mockTemplates, 
    [templates]
  );

  const handleSelect = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  };
  
  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center text-2xl font-bold">
            <Stethoscope className="mr-3 h-7 w-7 text-blue-600" />
            Şablon Seçimi
          </DialogTitle>
          <DialogDescription className="text-base">
            Muayene türünüze en uygun şablonu seçerek başlayın. Bu, AI'ın daha doğru bir tıbbi not oluşturmasına yardımcı olur.
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <AnimatePresence>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {displayTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "cursor-pointer transition-all duration-200 h-full flex flex-col",
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 border-2 shadow-xl ring-2 ring-blue-500 ring-offset-2"
                        : "hover:shadow-md"
                    )}
                  >
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                          {getSpecialtyIcon(template.specialty)}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <motion.div initial={{scale:0}} animate={{scale:1}}>
                            <CheckCircle2 className="h-6 w-6 text-blue-500" />
                          </motion.div>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 flex-1">{template.description}</p>
                      <Badge variant="outline">{template.specialty}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="p-6 bg-gray-50 border-t">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose}>İptal</Button>
          </DialogClose>
          <Button 
            onClick={handleSelect}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Şablonu Seç ve Devam Et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
