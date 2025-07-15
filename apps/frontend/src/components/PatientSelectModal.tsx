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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { User, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Patient } from "@/types/medical";

interface PatientSelectModalProps {
  open: boolean;
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  onClose: () => void;
  onAddPatient?: () => void;
}

export function PatientSelectModal({
  open,
  patients,
  onPatientSelect,
  onClose,
  onAddPatient,
}: PatientSelectModalProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const s = search.trim().toLowerCase();
    return patients.filter(
      p =>
        p.name.toLowerCase().includes(s) ||
        p.surname.toLowerCase().includes(s) ||
        (p.tcKimlik && p.tcKimlik.includes(s))
    );
  }, [patients, search]);

  const handleSelect = () => {
    if (selectedPatient) {
      onPatientSelect(selectedPatient);
    }
  };

  const handleClose = () => {
    setSelectedPatient(null);
    setSearch("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 bg-white shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <DialogTitle className="flex items-center text-xl font-bold text-gray-900">
            <User className="mr-3 h-6 w-6 text-blue-600" />
            Hasta Seç
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Ad veya TC ile arama yapabilir, listeden hasta seçebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          {/* Arama Kutusu */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              autoFocus
              placeholder="Ad veya TC ile ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Hasta Listesi */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            <AnimatePresence>
              {filteredPatients.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aradığınız kriterde hasta bulunamadı.</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => setSelectedPatient(patient)}
                      className={cn(
                        "cursor-pointer transition-all duration-200 border-2",
                        selectedPatient?.id === patient.id
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-base">
                              {patient.name} {patient.surname}
                            </div>
                            <div className="text-sm text-gray-500 font-mono mt-1">
                              TC: {patient.tcKimlik || "-"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Badge 
                              variant="outline" 
                              className="bg-gray-50 text-gray-700 border-gray-300 font-mono text-sm px-3 py-1"
                            >
                              {patient.phone || "-"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Butonları */}
        <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onAddPatient}
              className="flex-1 h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Hasta Ekle
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              İptal
            </Button>
            <Button
              onClick={handleSelect}
              disabled={!selectedPatient}
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