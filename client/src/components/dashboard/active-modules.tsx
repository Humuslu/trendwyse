import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Puzzle, Brain, BarChart, Users } from "lucide-react";

export function ActiveModules() {
  const modules = [
    {
      code: "M001",
      title: "AI Ürün Potansiyel Skoru",
      description: "GPT destekli ürün analizi, skorlama ve karar destek sistemi",
      status: "active",
      lastUsed: "2 saat önce",
      usage: "847 analiz",
      icon: Brain,
    },
    {
      code: "M002",
      title: "Pazar Analizi Motoru",
      description: "Rekabet analizi ve pazar trend tahmini",
      status: "coming-soon",
      lastUsed: null,
      usage: "Geliştirme aşamasında",
      icon: BarChart,
    },
    {
      code: "M003",
      title: "Tedarikçi Güvenilirlik Skoru",
      description: "AI destekli tedarikçi değerlendirme sistemi",
      status: "coming-soon",
      lastUsed: null,
      usage: "Geliştirme aşamasında",
      icon: Users,
    },
  ];

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium text-gray-900">
            <Puzzle className="h-5 w-5 text-purple-600 mr-2" />
            Aktif AI Modülleri
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">135 modülden</span>
            <Badge className="bg-green-100 text-green-800">
              1 Aktif
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isActive = module.status === "active";
            
            return (
              <Button
                key={module.code}
                variant="ghost"
                className={`h-auto p-4 text-left justify-start ${
                  isActive 
                    ? "border border-gray-200 hover:shadow-md" 
                    : "border border-gray-200 opacity-50 cursor-not-allowed"
                }`}
                disabled={!isActive}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={isActive ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}
                    >
                      {module.code}
                    </Badge>
                    <div className="flex items-center">
                      <IconComponent className={`h-4 w-4 mr-1 ${isActive ? "text-purple-600" : "text-gray-400"}`} />
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {isActive ? "Aktif" : "Yakında"}
                      </Badge>
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{module.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {module.lastUsed ? `Son kullanım: ${module.lastUsed}` : "Henüz kullanılmadı"}
                    </span>
                    <span>{module.usage}</span>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
