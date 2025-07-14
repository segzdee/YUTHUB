import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import MetricsCards from "@/components/Dashboard/MetricsCards";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import OccupancyChart from "@/components/Dashboard/OccupancyChart";
import PropertiesTable from "@/components/Dashboard/PropertiesTable";
import RiskInsights from "@/components/Dashboard/RiskInsights";
import QuickActions from "@/components/Dashboard/QuickActions";
import SubscriptionCard from "@/components/Dashboard/SubscriptionCard";
import CrossModuleWidget from "@/components/CrossModule/CrossModuleWidget";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize real-time updates for cross-module data integration
  useRealTimeUpdates();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 sm:h-32 w-24 sm:w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Metrics Cards */}
          <div className="mb-6 sm:mb-8">
            <MetricsCards />
          </div>

          {/* Subscription Card */}
          <div className="mb-6 sm:mb-8">
            <SubscriptionCard />
          </div>

          {/* Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="lg:col-span-2">
              <OccupancyChart />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>

          {/* Cross-Module Integration Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <CrossModuleWidget 
              title="System Overview" 
              type="overview" 
            />
            <CrossModuleWidget 
              title="Risk Assessment" 
              type="risk-assessment" 
            />
            <CrossModuleWidget 
              title="Financial Summary" 
              type="financial-summary" 
            />
            <CrossModuleWidget 
              title="Occupancy Status" 
              type="occupancy-status" 
            />
            <CrossModuleWidget 
              title="Incident Alerts" 
              type="incident-alerts" 
            />
            <CrossModuleWidget 
              title="Support Progress" 
              type="support-progress" 
            />
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <PropertiesTable />
            <RiskInsights />
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </main>
      </div>
    </div>
  );
}
