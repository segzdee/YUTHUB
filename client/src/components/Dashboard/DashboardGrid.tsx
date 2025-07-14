import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboardStore } from '@/store/dashboardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, Settings, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Dashboard widgets
import MetricsCards from './MetricsCards';
import OccupancyChart from './OccupancyChart';
import ActivityFeed from './ActivityFeed';
import CrossModuleWidget from '../CrossModule/CrossModuleWidget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  className?: string;
}

export default function DashboardGrid({ className = '' }: DashboardGridProps) {
  const { 
    layouts, 
    isGridLocked, 
    visibleWidgets, 
    refreshInterval,
    setLayouts, 
    toggleGridLock 
  } = useDashboardStore();
  
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const queryClient = useQueryClient();

  // Auto-refresh data based on interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries();
        setLastRefresh(Date.now());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, queryClient]);

  const handleLayoutChange = (layout: any) => {
    if (!isGridLocked) {
      setLayouts(layout);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    setLastRefresh(Date.now());
  };

  const renderWidget = (widgetId: string) => {
    const isVisible = visibleWidgets.includes(widgetId);
    if (!isVisible) return null;

    switch (widgetId) {
      case 'metrics':
        return (
          <Card className="h-full">
            <CardContent className="p-4">
              <MetricsCards />
            </CardContent>
          </Card>
        );
      
      case 'overview':
        return (
          <CrossModuleWidget 
            title="System Overview" 
            type="overview"
            className="h-full"
          />
        );
      
      case 'risk-assessment':
        return (
          <CrossModuleWidget 
            title="Risk Assessment" 
            type="risk-assessment"
            className="h-full"
          />
        );
      
      case 'financial-summary':
        return (
          <CrossModuleWidget 
            title="Financial Summary" 
            type="financial-summary"
            className="h-full"
          />
        );
      
      case 'occupancy-chart':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Occupancy Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <OccupancyChart />
            </CardContent>
          </Card>
        );
      
      case 'activity-feed':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ActivityFeed />
            </CardContent>
          </Card>
        );
      
      case 'occupancy-status':
        return (
          <CrossModuleWidget 
            title="Occupancy Status" 
            type="occupancy-status"
            className="h-full"
          />
        );
      
      case 'support-progress':
        return (
          <CrossModuleWidget 
            title="Support Progress" 
            type="support-progress"
            className="h-full"
          />
        );
      
      default:
        return (
          <Card className="h-full">
            <CardContent className="p-4 flex items-center justify-center">
              <p className="text-gray-500">Unknown widget: {widgetId}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className={`${className}`}>
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
            onClick={handleRefresh}
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

      {/* Responsive Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={!isGridLocked}
        isResizable={!isGridLocked}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {visibleWidgets.map((widgetId) => (
          <div key={widgetId} className="widget-container">
            {renderWidget(widgetId)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}