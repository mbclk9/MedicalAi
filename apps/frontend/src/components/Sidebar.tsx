import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Stethoscope, 
  Home, 
  Users, 
  FileText, 
  Settings,
  User
} from "lucide-react";
import type { Doctor } from "@/types/medical";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, hoverScale } from "@/components/AnimatedPage";

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: doctor } = useQuery<Doctor>({
    queryKey: ["/api/doctor"],
  });

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
      isActive: location === "/"
    },
    {
      icon: Users,
      label: "Hasta Listesi", 
      href: "/patients",
      isActive: location === "/patients"
    },
    {
      icon: FileText,
      label: "Tüm Muayeneler",
      href: "/visits",
      isActive: location === "/visits"
    },
    {
      icon: Settings,
      label: "Şablon Yönetimi",
      href: "/templates",
      isActive: location === "/templates"
    },
    {
      icon: User,
      label: "Profil",
      href: "/profile",
      isActive: location === "/profile"
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Medikal Sekreter</h1>
            <p className="text-sm text-gray-500">Akıllı Sağlık Platformu</p>
          </div>
        </div>
      </div>

      {/* New Visit Button */}
      <motion.div 
        className="p-6 border-b border-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/visit/new">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4">
              <Stethoscope className="mr-2 h-4 w-4" />
              Yeni Muayene Başlat
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <motion.div 
          className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          DASHBOARD
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="in"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                variants={staggerItem}
                custom={index}
              >
                <Link href={item.href}>
                  <motion.div 
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      item.isActive 
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    whileHover={{ 
                      scale: 1.02, 
                      x: 4,
                      transition: { type: "spring", stiffness: 400, damping: 17 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* Doctor Profile */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold">
              {doctor?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'MY'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {doctor?.name || 'Muhammet Çelik'}
            </div>
            <div className="text-xs text-gray-500">
              {doctor?.specialty || 'Kardiyoloji'}
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-2">
              <Settings className="h-4 w-4 text-gray-400" />
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
