import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Stethoscope, HeartPulse, RefreshCcw, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VISIT_TYPES = [
  {
    value: "ilk",
    label: "İlk Muayene",
    description: "Hastanın ilk başvurusu için kullanılır.",
    icon: <Stethoscope className="h-6 w-6 text-blue-600" />
  },
  {
    value: "kontrol",
    label: "Kontrol Muayenesi",
    description: "Daha önce muayene olmuş hastalar için.",
    icon: <RefreshCcw className="h-6 w-6 text-green-600" />
  },
  {
    value: "konsultasyon",
    label: "Konsültasyon",
    description: "Başka bir branştan görüş istenen durumlar.",
    icon: <Users className="h-6 w-6 text-purple-600" />
  }
];

interface VisitTypeSelectModalProps {
  open: boolean;
  value: string;
  onSelect: (type: string) => void;
  onClose: () => void;
}

export function VisitTypeSelectModal({ open, value, onSelect, onClose }: VisitTypeSelectModalProps) {
  const [selected, setSelected] = useState<string>(value);

  const handleSelect = () => {
    if (selected) {
      onSelect(selected);
    }
  };

  const handleClose = () => {
    setSelected(value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 bg-white shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center text-xl font-bold text-gray-900">
            <HeartPulse className="mr-3 h-6 w-6 text-blue-600" />
            Muayene Türü Seç
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Lütfen muayene türünü seçin.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <div className="space-y-3">
            <AnimatePresence>
              {VISIT_TYPES.map((type) => (
                <motion.div
                  key={type.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => setSelected(type.value)}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-2",
                      selected === type.value
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {type.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-base">
                            {type.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Butonları */}
        <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              İptal
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selected}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Seç
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 