import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { Analysis } from "@shared/schema";

export function PotentialScores() {
  const { data: completedAnalyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/analyses/completed"],
  });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, text: "Yüksek", color: "bg-green-100 text-green-800" };
    if (score >= 60) return { variant: "secondary" as const, text: "Orta", color: "bg-yellow-100 text-yellow-800" };
    return { variant: "destructive" as const, text: "Düşük", color: "bg-red-100 text-red-800" };
  };

  const getAIRecommendation = (score: number) => {
    if (score >= 80) return "AI Önerisi: Yüksek";
    if (score >= 60) return "AI Önerisi: Orta";
    return "AI Önerisi: Düşük";
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium text-gray-900">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            Potansiyel Skorları
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-500">
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {completedAnalyses && completedAnalyses.length > 0 ? (
            completedAnalyses.slice(0, 5).map((analysis) => {
              const scoreBadge = getScoreBadge(analysis.score || 0);
              
              return (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{analysis.productName}</p>
                    <p className="text-xs text-gray-500">{analysis.category || "Kategori Belirtilmemiş"}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={scoreBadge.color}>
                      {analysis.score}%
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {getAIRecommendation(analysis.score || 0)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Henüz tamamlanmış analiz bulunmuyor</p>
              <p className="text-xs mt-1">M001 modülü ile ürün analizlerinizi başlatın</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
