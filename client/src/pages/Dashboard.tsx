import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import MetricsCards from "@/components/Dashboard/MetricsCards";
import OccupancyChart from "@/components/Dashboard/OccupancyChart";
import ActivityFeed from "@/components/Dashboard/ActivityFeed";
import CrossModuleWidget from "@/components/CrossModule/CrossModuleWidget";
import { useDashboardStore } from "@/store/dashboardStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, RefreshCw, Maximize2, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import SubscriptionCard from "@/components/Dashboard/SubscriptionCard";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { visibleWidgets, toggleWidget, isGridLocked, toggleGridLock } = useDashboardStore();
  
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
              <div className="w-2 h-2 bg-green-500 rounded-full ws-connected"></div>
              Real-time data connected
            </div>
          )}
          
          {/* Dashboard Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <Badge variant="outline">
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries();
                  setLastRefresh(Date.now());
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleGridLock}
                className="flex items-center gap-2"
              >
                {isGridLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                {isGridLocked ? 'Locked' : 'Unlocked'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Customize
              </Button>
            </div>
          </div>

          {/* Expanded Widget Modal */}
          {expandedWidget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">
                    {expandedWidget === 'metrics' ? 'Key Metrics' :
                     expandedWidget === 'overview' ? 'System Overview' :
                     expandedWidget === 'risk-assessment' ? 'Risk Assessment' :
                     expandedWidget === 'financial-summary' ? 'Financial Summary' :
                     expandedWidget === 'occupancy-chart' ? 'Occupancy Trends' :
                     expandedWidget === 'activity-feed' ? 'Recent Activity' :
                     expandedWidget === 'occupancy-status' ? 'Occupancy Status' :
                     expandedWidget === 'support-progress' ? 'Support Progress' : 'Widget'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedWidget(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className="p-4">
                  {expandedWidget === 'metrics' && <MetricsCards />}
                  {expandedWidget === 'overview' && <CrossModuleWidget title="System Overview" type="overview" />}
                  {expandedWidget === 'risk-assessment' && <CrossModuleWidget title="Risk Assessment" type="risk-assessment" />}
                  {expandedWidget === 'financial-summary' && <CrossModuleWidget title="Financial Summary" type="financial-summary" />}
                  {expandedWidget === 'occupancy-chart' && <OccupancyChart />}
                  {expandedWidget === 'activity-feed' && <ActivityFeed />}
                  {expandedWidget === 'occupancy-status' && <CrossModuleWidget title="Occupancy Status" type="occupancy-status" />}
                  {expandedWidget === 'support-progress' && <CrossModuleWidget title="Support Progress" type="support-progress" />}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Card */}
          <div className="mb-6 sm:mb-8">
            <SubscriptionCard />
          </div>

          {/* Enhanced Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Key Metrics - Full Width */}
            {visibleWidgets.includes('metrics') && (
              <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Key Metrics</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('metrics')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('metrics')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <MetricsCards />
                </CardContent>
              </Card>
            )}

            {/* System Overview */}
            {visibleWidgets.includes('overview') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">System Overview</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('overview')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('overview')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <CrossModuleWidget title="System Overview" type="overview" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {visibleWidgets.includes('risk-assessment') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('risk-assessment')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('risk-assessment')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <CrossModuleWidget title="Risk Assessment" type="risk-assessment" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            {visibleWidgets.includes('financial-summary') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('financial-summary')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('financial-summary')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <CrossModuleWidget title="Financial Summary" type="financial-summary" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Occupancy Chart - Double Width */}
            {visibleWidgets.includes('occupancy-chart') && (
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Occupancy Trends</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('occupancy-chart')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('occupancy-chart')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <OccupancyChart />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Feed */}
            {visibleWidgets.includes('activity-feed') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('activity-feed')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('activity-feed')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <ActivityFeed />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Occupancy Status */}
            {visibleWidgets.includes('occupancy-status') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Occupancy Status</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('occupancy-status')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('occupancy-status')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <CrossModuleWidget title="Occupancy Status" type="occupancy-status" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Progress */}
            {visibleWidgets.includes('support-progress') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium">Support Progress</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWidget('support-progress')}
                      className="p-1 h-6 w-6"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidget('support-progress')}
                      className="p-1 h-6 w-6"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 overflow-y-auto">
                    <CrossModuleWidget title="Support Progress" type="support-progress" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Widget Customization Panel */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Widget Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'metrics', title: 'Key Metrics' },
                  { id: 'overview', title: 'System Overview' },
                  { id: 'risk-assessment', title: 'Risk Assessment' },
                  { id: 'financial-summary', title: 'Financial Summary' },
                  { id: 'occupancy-chart', title: 'Occupancy Trends' },
                  { id: 'activity-feed', title: 'Recent Activity' },
                  { id: 'occupancy-status', title: 'Occupancy Status' },
                  { id: 'support-progress', title: 'Support Progress' },
                ].map((widget) => (
                  <Button
                    key={widget.id}
                    variant={visibleWidgets.includes(widget.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    className="text-xs"
                  >
                    {widget.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
