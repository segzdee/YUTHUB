import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import DashboardGrid from "@/components/Dashboard/DashboardGrid";
import SubscriptionCard from "@/components/Dashboard/SubscriptionCard";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Initialize real-time updates for cross-module data integration
  useRealTimeUpdates();
  
  // Initialize WebSocket connection for real-time KPI updates
  const { connectionStatus, isConnected } = useWebSocketConnection();

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
          {/* Connection Status Indicator */}
          {isConnected && (
            <div className="mb-4 text-sm text-green-600 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Real-time data connected
            </div>
          )}
          
          {/* Subscription Card */}
          <div className="mb-6 sm:mb-8">
            <SubscriptionCard />
          </div>

          {/* Dashboard Grid with Draggable/Resizable Widgets */}
          <DashboardGrid />
        </main>
      </div>
    </div>
  );
}
