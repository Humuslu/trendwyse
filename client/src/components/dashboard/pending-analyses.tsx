import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Play, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Analysis } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const newAnalysisSchema = z.object({
  productName: z.string().min(1, "Ürün adı gerekli"),
  category: z.string().optional(),
  moduleCode: z.string().default("M001"),
});

type NewAnalysisData = z.infer<typeof newAnalysisSchema>;

export function PendingAnalyses() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingAnalyses, isLoading } = useQuery<Analysis[]>({
    queryKey: ["/api/analyses/pending"],
  });

  const form = useForm<NewAnalysisData>({
    resolver: zodResolver(newAnalysisSchema),
    defaultValues: {
      productName: "",
      category: "",
      moduleCode: "M001",
    },
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (data: NewAnalysisData) => {
      const response = await apiRequest("POST", "/api/analyses", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Yeni analiz oluşturuldu",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Analiz oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  const startAnalysisMutation = useMutation({
    mutationFn: async (analysisId: number) => {
      const response = await apiRequest("POST", `/api/analyses/${analysisId}/start`);
      return await response.json();
    },
    onSuccess: (data, analysisId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analyses/completed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "AI Analizi Tamamlandı",
        description: `Analiz başarıyla tamamlandı. Skor: %${data.score}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analiz Hatası",
        description: error.message || "AI analizi başarısız oldu",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Az önce eklendi";
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    return `${Math.floor(diffInHours / 24)} gün önce`;
  };

  const onSubmit = (data: NewAnalysisData) => {
    createAnalysisMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = pendingAnalyses?.length || 0;

  return (
    <Card className="shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-medium text-gray-900">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            Analiz Bekleyen Ürünler
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {pendingCount} Beklemede
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {pendingAnalyses && pendingAnalyses.length > 0 ? (
            pendingAnalyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{analysis.productName}</p>
                  <p className="text-xs text-gray-500">{formatDate(analysis.createdAt)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => startAnalysisMutation.mutate(analysis.id)}
                  disabled={startAnalysisMutation.isPending}
                >
                  <Play className="h-3 w-3 mr-1" />
                  {startAnalysisMutation.isPending ? "Analiz Ediliyor..." : "Başlat"}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Bekleyen analiz bulunmuyor</p>
              <p className="text-xs mt-1">Yeni ürün ekleyerek analize başlayın</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ürün Ekle
              </Button>
            </DialogTrigger>
            
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Ürün Analizi</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Ürün Adı</Label>
                  <Input
                    id="productName"
                    placeholder="Örn: Bluetooth Kulaklık"
                    {...form.register("productName")}
                  />
                  {form.formState.errors.productName && (
                    <p className="text-sm text-red-600">{form.formState.errors.productName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategori (Opsiyonel)</Label>
                  <Input
                    id="category"
                    placeholder="Örn: Elektronik > Ses Sistemleri"
                    {...form.register("category")}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={createAnalysisMutation.isPending}
                  >
                    {createAnalysisMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
