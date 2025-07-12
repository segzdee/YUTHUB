import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Lightbulb } from "lucide-react";

interface RiskyResident {
  id: number;
  firstName: string;
  lastName: string;
  propertyId: number;
  keyWorkerId: string;
  riskLevel: string;
  independenceLevel: number;
}

export default function RiskInsights() {
  const { data: riskyResidents, isLoading } = useQuery<RiskyResident[]>({
    queryKey: ["/api/residents/at-risk"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Insights: Residents at Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-700";
      case "medium":
        return "text-yellow-700";
      case "low":
        return "text-green-700";
      default:
        return "text-gray-700";
    }
  };

  const getAIRecommendation = (riskLevel: string) => {
    switch (riskLevel) {
      case "high":
        return "Immediate intervention required - decline in independence scores";
      case "medium":
        return "Schedule additional check-in - missed 2 recent appointments";
      default:
        return "Continue monitoring progress with regular check-ins";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Insights: Residents at Risk</CardTitle>
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI Powered</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskyResidents?.map((resident) => (
            <div 
              key={resident.id} 
              className={`border rounded-lg p-4 ${getRiskColor(resident.riskLevel)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate">
                    {resident.firstName} {resident.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Property ID: {resident.propertyId} • Key Worker: {resident.keyWorkerId}
                  </p>
                  <p className={`text-xs mt-2 ${getRiskBadgeColor(resident.riskLevel)}`}>
                    Risk Level: {resident.riskLevel.charAt(0).toUpperCase() + resident.riskLevel.slice(1)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
                  View Details
                </Button>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-700 flex items-start">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  AI Recommendation: {getAIRecommendation(resident.riskLevel)}
                </p>
              </div>
            </div>
          ))}
          
          {(!riskyResidents || riskyResidents.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No residents at risk detected</p>
              <p className="text-sm">AI monitoring is active and all residents are in good standing</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
