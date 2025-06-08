import { useAuth } from "@/hooks/use-auth";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { AIAlerts } from "@/components/dashboard/ai-alerts";
import { AIAssistant } from "@/components/dashboard/ai-assistant";
import { PotentialScores } from "@/components/dashboard/potential-scores";
import { PendingAnalyses } from "@/components/dashboard/pending-analyses";
import { ActiveModules } from "@/components/dashboard/active-modules";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { Brain, Bell, Settings, BarChart, HelpCircle, Menu, X, Gauge } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden -ml-2 mr-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Logo */}
              <div className="flex items-center">
                <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Trendwyse</h1>
                  <p className="text-xs text-gray-500 leading-none">AI-Powered Intelligence</p>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* AI Status */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">AI Aktif</span>
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="text-gray-900 font-medium">{user?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Çıkış
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
              <div className="flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {/* Dashboard */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100"
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
                      >
                        <Brain className="mr-3 h-4 w-4 text-purple-500" />
                        M001 - Ürün Potansiyel Skoru
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        <BarChart className="mr-3 h-4 w-4" />
                        M002 - Pazar Analizi
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Yakında
                        </span>
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
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Ayarlar
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <BarChart className="mr-3 h-4 w-4" />
                        Raporlar
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
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
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Hoş Geldin, <span className="text-purple-600">{user?.name}</span>
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Bugün {currentDate} • AI sistemi aktif durumda
              </p>
            </div>

            {/* Stats Grid */}
            <StatsGrid />

            {/* AI Alerts and Summary Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <AIAlerts />
              </div>
              <div>
                <AIAssistant />
              </div>
            </div>

            {/* AI Powered Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PotentialScores />
              <PendingAnalyses />
            </div>

            {/* Active Modules Section */}
            <ActiveModules />
          </div>
        </div>
      </div>
    </div>
  );
}
