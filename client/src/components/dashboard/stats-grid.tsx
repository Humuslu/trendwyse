import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, Users, Brain, Server, TrendingUp, CheckCircle } from "lucide-react";

interface DashboardStats {
  totalModules: number;
  activeModules: number;
  activeUsers: number;
  aiRatio: string;
  systemStatus: string;
  uptime: string;
  totalAnalyses: number;
  pendingCount: number;
  completedCount: number;
}

export function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Modül",
      value: stats?.totalModules || 135,
      icon: Puzzle,
      iconColor: "text-purple-600",
      trend: `${stats?.activeModules || 1} aktif`,
      trendColor: "text-green-600",
      trendIcon: TrendingUp,
    },
    {
      title: "Aktif Kullanıcı",
      value: stats?.activeUsers || 847,
      icon: Users,
      iconColor: "text-blue-600",
      trend: "+12%",
      trendColor: "text-green-600",
      trendIcon: TrendingUp,
      trendText: "bu hafta",
    },
    {
      title: "AI Modül Oranı",
      value: stats?.aiRatio || "98.5%",
      icon: Brain,
      iconColor: "text-purple-600",
      trend: "Optimal seviye",
      trendColor: "text-green-600",
      trendIcon: CheckCircle,
    },
    {
      title: "Sistem Durumu",
      value: stats?.systemStatus || "Çevrimiçi",
      icon: Server,
      iconColor: "text-green-600",
      trend: stats?.uptime || "99.9% uptime",
      trendColor: "text-green-600",
      showDot: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.trendIcon;

        return (
          <Card key={index} className="overflow-hidden shadow hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <IconComponent className={`${stat.iconColor} text-2xl h-6 w-6`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <div className={`flex items-center text-sm ${stat.trendColor}`}>
                  {stat.showDot ? (
                    <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                  ) : TrendIcon ? (
                    <TrendIcon className="h-3 w-3 mr-1" />
                  ) : null}
                  <span>{stat.trend}</span>
                  {stat.trendText && (
                    <span className="text-gray-500 ml-1">{stat.trendText}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
