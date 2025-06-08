import { Button } from "@/components/ui/button";
import { Brain, BarChart, Gauge, Settings, HelpCircle, X } from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-40 lg:hidden">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {/* Dashboard */}
            <Button
              variant="ghost"
              className="w-full justify-start bg-purple-50 text-purple-700"
              onClick={onClose}
            >
              <Gauge className="mr-3 h-4 w-4" />
              Ana Panel
            </Button>

            {/* AI Modules */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                AI Modülleri
              </h3>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <Brain className="mr-3 h-4 w-4 text-purple-500" />
                  M001 - Ürün Potansiyel Skoru
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 cursor-not-allowed"
                  disabled
                >
                  <BarChart className="mr-3 h-4 w-4" />
                  M002 - Pazar Analizi
                </Button>
              </div>
            </div>

            {/* System */}
            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sistem
              </h3>
              <div className="mt-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Ayarlar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <BarChart className="mr-3 h-4 w-4" />
                  Raporlar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Destek
                </Button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
