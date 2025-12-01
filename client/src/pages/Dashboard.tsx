import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useWebSocketConnection } from '@/hooks/useOptimizedWebSocket';
import MetricsCards from '@/components/Dashboard/MetricsCards';
import OccupancyChart from '@/components/Dashboard/OccupancyChart';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import CrossModuleWidget from '@/components/CrossModule/CrossModuleWidget';
import { PersonalizedGreeting } from '@/components/Dashboard/PersonalizedGreeting';
import { OnboardingChecklist } from '@/components/Dashboard/OnboardingChecklist';
import { WhatsNewNotification } from '@/components/Dashboard/WhatsNewNotification';
import { CustomizeModal } from '@/components/Dashboard/CustomizeModal';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { useDashboardStore } from '@/store/dashboardStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, RefreshCw, Maximize2, Lock, Unlock, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';

function DashboardContent() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const queryClient = useQueryClient();
  const { visibleWidgets, toggleWidget, isGridLocked, toggleGridLock, resetWidgets } =
    useDashboardStore();

  // Initialize real-time updates for cross-module data integration
  useRealTimeUpdates();

  // Initialize WebSocket connection for real-time KPI updates
  const { connectionStatus, isConnected } = useWebSocketConnection();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: 'Unauthorized',
        description: 'You are logged out. Logging in again...',
        variant: 'destructive',
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-24 sm:h-32 w-24 sm:w-32 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-slate text-sm sm:text-base'>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className='space-y-6'>
          {/* Personalized Greeting */}
          <PersonalizedGreeting />

          {/* Onboarding Checklist */}
          <OnboardingChecklist onModalChange={setIsOnboardingOpen} />

          {/* What's New Notification */}
          <WhatsNewNotification isOnboardingOpen={isOnboardingOpen} />

          {/* Connection Status Indicator */}
          {isConnected && (
            <div className='mb-4 text-sm text-green-600 flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full ws-connected'></div>
              Real-time data connected
            </div>
          )}

          {/* Dashboard Controls */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold'>Dashboard</h2>
              <Badge variant='outline'>
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </Badge>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  queryClient.invalidateQueries();
                  setLastRefresh(Date.now());
                }}
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Refresh
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={toggleGridLock}
                className='flex items-center gap-2'
              >
                {isGridLocked ? (
                  <Lock className='h-4 w-4' />
                ) : (
                  <Unlock className='h-4 w-4' />
                )}
                {isGridLocked ? 'Locked' : 'Unlocked'}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowCustomizeModal(true)}
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                Customize
              </Button>
            </div>
          </div>

          {/* Customize Modal */}
          <CustomizeModal
            open={showCustomizeModal}
            onOpenChange={setShowCustomizeModal}
          />

          {/* Expanded Widget Modal */}
          {expandedWidget && (
            <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
              <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto'>
                <div className='flex items-center justify-between p-4 border-b'>
                  <h3 className='text-lg font-semibold'>
                    {expandedWidget === 'metrics'
                      ? 'Key Metrics'
                      : expandedWidget === 'overview'
                        ? 'System Overview'
                        : expandedWidget === 'risk-assessment'
                          ? 'Risk Assessment'
                          : expandedWidget === 'financial-summary'
                            ? 'Financial Summary'
                            : expandedWidget === 'occupancy-chart'
                              ? 'Occupancy Trends'
                              : expandedWidget === 'activity-feed'
                                ? 'Recent Activity'
                                : expandedWidget === 'occupancy-status'
                                  ? 'Occupancy Status'
                                  : expandedWidget === 'support-progress'
                                    ? 'Support Progress'
                                    : 'Widget'}
                  </h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setExpandedWidget(null)}
                  >
                    ×
                  </Button>
                </div>
                <div className='p-4'>
                  {expandedWidget === 'metrics' && <MetricsCards />}
                  {expandedWidget === 'overview' && <CrossModuleWidget type='overview' />}
                  {expandedWidget === 'risk-assessment' && <CrossModuleWidget type='risk-assessment' />}
                  {expandedWidget === 'financial-summary' && <CrossModuleWidget type='financial-summary' />}
                  {expandedWidget === 'occupancy-chart' && <OccupancyChart />}
                  {expandedWidget === 'activity-feed' && <ActivityFeed />}
                  {expandedWidget === 'occupancy-status' && <CrossModuleWidget type='occupancy-status' />}
                  {expandedWidget === 'support-progress' && <CrossModuleWidget type='support-progress' />}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Dashboard Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {/* Key Metrics - Full Width */}
            {visibleWidgets.includes('metrics') && (
              <div className='md:col-span-2 lg:col-span-3 xl:col-span-4'>
                <MetricsCards />
              </div>
            )}

            {/* System Overview */}
            {visibleWidgets.includes('overview') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    System Overview
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('overview')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('overview')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-48 overflow-hidden'>
                    <CrossModuleWidget type='overview' />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {visibleWidgets.includes('risk-assessment') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Risk Assessment
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('risk-assessment')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('risk-assessment')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-48 overflow-hidden'>
                    <CrossModuleWidget type='risk-assessment' />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            {visibleWidgets.includes('financial-summary') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Financial Summary
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('financial-summary')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('financial-summary')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-48 overflow-hidden'>
                    <CrossModuleWidget type='financial-summary' />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Occupancy Chart - Double Width */}
            {visibleWidgets.includes('occupancy-chart') && (
              <Card className='md:col-span-2'>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Occupancy Trends
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('occupancy-chart')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('occupancy-chart')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-64 overflow-hidden'>
                    <OccupancyChart />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Feed */}
            {visibleWidgets.includes('activity-feed') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Recent Activity
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('activity-feed')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('activity-feed')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-64 overflow-hidden'>
                    <ActivityFeed />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Occupancy Status */}
            {visibleWidgets.includes('occupancy-status') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Occupancy Status
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('occupancy-status')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('occupancy-status')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-48 overflow-hidden'>
                    <CrossModuleWidget type='occupancy-status' />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Progress */}
            {visibleWidgets.includes('support-progress') && (
              <Card>
                <CardHeader className='flex flex-row items-center justify-between pb-3'>
                  <CardTitle className='text-sm font-medium'>
                    Support Progress
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setExpandedWidget('support-progress')}
                      className='p-1.5 h-8 w-8'
                    >
                      <Maximize2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => toggleWidget('support-progress')}
                      className='p-1.5 h-8 w-8'
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='h-48 overflow-hidden'>
                    <CrossModuleWidget type='support-progress' />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Widget Customization Panel */}
          <Card className='mt-6'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Widget Customization</CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Show or hide widgets to personalize your dashboard
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline'>
                    {visibleWidgets.length} / 8 visible
                  </Badge>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={resetWidgets}
                    className='text-xs'
                  >
                    <RotateCcw className='mr-2 h-3 w-3' />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                {[
                  { id: 'metrics', title: 'Key Metrics', icon: '📊' },
                  { id: 'overview', title: 'System Overview', icon: '📈' },
                  { id: 'risk-assessment', title: 'Risk Assessment', icon: '⚠️' },
                  { id: 'financial-summary', title: 'Financial Summary', icon: '💰' },
                  { id: 'occupancy-chart', title: 'Occupancy Trends', icon: '📉' },
                  { id: 'activity-feed', title: 'Recent Activity', icon: '🔔' },
                  { id: 'occupancy-status', title: 'Occupancy Status', icon: '🏠' },
                  { id: 'support-progress', title: 'Support Progress', icon: '🎯' },
                ].map(widget => {
                  const isVisible = visibleWidgets.includes(widget.id);
                  return (
                    <Button
                      key={widget.id}
                      variant={isVisible ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => toggleWidget(widget.id)}
                      className='justify-start text-left h-auto py-2 px-3'
                    >
                      <span className='mr-2 text-base'>{widget.icon}</span>
                      <span className='flex-1 text-xs'>
                        {widget.title}
                      </span>
                      {isVisible ? (
                        <Eye className='h-3 w-3 ml-2 flex-shrink-0' />
                      ) : (
                        <EyeOff className='h-3 w-3 ml-2 flex-shrink-0 opacity-50' />
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageErrorBoundary pageName="Dashboard">
      <DashboardContent />
    </PageErrorBoundary>
  );
}
