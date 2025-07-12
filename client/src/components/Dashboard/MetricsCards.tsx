import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Percent, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetrics {
  totalProperties: number;
  currentResidents: number;
  occupancyRate: number;
  activeIncidents: number;
}

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Properties",
      value: metrics?.totalProperties || 0,
      icon: Building,
      color: "text-primary",
      bgColor: "bg-primary bg-opacity-10",
      change: "+8.2%",
      changeColor: "text-success",
      ariaLabel: `Total properties: ${metrics?.totalProperties || 0}, increased by 8.2%`
    },
    {
      title: "Current Residents",
      value: metrics?.currentResidents || 0,
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary bg-opacity-10",
      change: "+12.1%",
      changeColor: "text-success",
      ariaLabel: `Current residents: ${metrics?.currentResidents || 0}, increased by 12.1%`
    },
    {
      title: "Occupancy Rate",
      value: `${metrics?.occupancyRate || 0}%`,
      icon: Percent,
      color: "text-success",
      bgColor: "status-success bg-opacity-10",
      change: "+2.3%",
      changeColor: "text-success",
      ariaLabel: `Occupancy rate: ${metrics?.occupancyRate || 0}%, increased by 2.3%`
    },
    {
      title: "Active Incidents",
      value: metrics?.activeIncidents || 0,
      icon: AlertTriangle,
      color: "text-accent",
      bgColor: "status-error bg-opacity-10",
      change: "-15.2%",
      changeColor: "text-success",
      ariaLabel: `Active incidents: ${metrics?.activeIncidents || 0}, decreased by 15.2%`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-3xl font-semibold text-slate">{card.value}</p>
                </div>
                <div className={`${card.bgColor} rounded-full p-3`}>
                  <Icon className={`${card.color} h-6 w-6`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${card.changeColor}`}>
                  {card.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
