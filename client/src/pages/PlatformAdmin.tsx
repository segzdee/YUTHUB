import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  Shield,
  Database,
  Users,
  BarChart3,
  Settings,
  AlertTriangle,
  CreditCard,
  Bell,
  Lock,
  Eye,
  Search,
  TrendingUp,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import PlatformAdminGuard from '@/components/PlatformAdmin/PlatformAdminGuard';
import ConfirmationDialog from '@/components/PlatformAdmin/ConfirmationDialog';
import MonitoringDashboard from './MonitoringDashboard';

// Platform Admin Dashboard Component
export default function PlatformAdmin() {
  return (
    <PlatformAdminGuard>
      <PlatformAdminContent />
    </PlatformAdminGuard>
  );
}

// Main Platform Admin Content
function PlatformAdminContent() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: string;
    targetId: string;
    onConfirm: (reason: string) => void;
  }>({
    open: false,
    title: '',
    description: '',
    action: '',
    targetId: '',
    onConfirm: () => {},
  });
  const { toast } = useToast();

  return (
    <div className='min-h-screen bg-background'>
      {/* Platform Admin Header */}
      <header className='bg-error text-white border-b border-error/20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-3'>
              <Shield className='h-6 w-6' />
              <h1 className='text-xl font-semibold'>YUTHUB Platform Admin</h1>
            </div>
            <div className='flex items-center gap-4'>
              <Badge
                variant='secondary'
                className='bg-error-light text-error-foreground'
              >
                Super Admin
              </Badge>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setLocation('/dashboard')}
                className='border-white/20 hover:bg-white/10'
              >
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MFA & IP Verification Warning */}
      {(!mfaVerified || !ipWhitelisted) && (
        <Alert className='mx-4 mt-4 border-warning bg-warning/10'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            {!mfaVerified && 'Multi-Factor Authentication required. '}
            {!ipWhitelisted &&
              'IP address not whitelisted for platform admin access.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-8'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='subscriptions'>Subscriptions</TabsTrigger>
            <TabsTrigger value='organizations'>Organizations</TabsTrigger>
            <TabsTrigger value='monitoring'>Monitoring</TabsTrigger>
            <TabsTrigger value='analytics'>Analytics</TabsTrigger>
            <TabsTrigger value='billing'>Billing</TabsTrigger>
            <TabsTrigger value='features'>Features</TabsTrigger>
            <TabsTrigger value='emergency'>Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <PlatformOverview />
          </TabsContent>

          <TabsContent value='subscriptions'>
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value='organizations'>
            <OrganizationManagement />
          </TabsContent>

          <TabsContent value='monitoring'>
            <SystemMonitoring />
          </TabsContent>

          <TabsContent value='analytics'>
            <PlatformAnalytics />
          </TabsContent>

          <TabsContent value='billing'>
            <BillingOversight />
          </TabsContent>

          <TabsContent value='features'>
            <FeatureFlagManagement />
          </TabsContent>

          <TabsContent value='emergency'>
            <EmergencyTools />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Platform Overview Component
function PlatformOverview() {
  const { data: overview } = useQuery({
    queryKey: ['/api/platform-admin/overview'],
    staleTime: 60 * 1000,
  });

  const metrics = [
    {
      title: 'Total Organizations',
      value: overview?.totalOrganizations || 0,
      change: '+12%',
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Active Subscriptions',
      value: overview?.activeSubscriptions || 0,
      change: '+8%',
      icon: CreditCard,
      trend: 'up',
    },
    {
      title: 'Monthly Revenue',
      value: `£${overview?.monthlyRevenue?.toLocaleString() || 0}`,
      change: '+15%',
      icon: BarChart3,
      trend: 'up',
    },
    {
      title: 'System Health',
      value: `${overview?.systemHealth || 99}%`,
      change: '99.9%',
      icon: Database,
      trend: 'stable',
    },
  ];

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Platform Overview</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {metrics.map(metric => (
          <Card key={metric.title}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-medium-contrast'>{metric.title}</p>
                  <p className='text-2xl font-semibold'>{metric.value}</p>
                  <p className='text-sm text-success'>
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className='h-8 w-8 text-primary' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {overview?.recentActivity?.map((activity: any, index: number) => (
                <div key={index} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{activity.action}</p>
                    <p className='text-sm text-medium-contrast'>
                      {activity.organization}
                    </p>
                  </div>
                  <Badge variant='outline'>{activity.timestamp}</Badge>
                </div>
              )) || [
                <div key='placeholder' className='text-center py-8'>
                  <p className='text-medium-contrast'>No recent activity</p>
                </div>,
              ]}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {overview?.systemAlerts?.map((alert: any, index: number) => (
                <Alert
                  key={index}
                  className={`border-${alert.severity === 'high' ? 'error' : 'warning'}`}
                >
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )) || [
                <div key='placeholder' className='text-center py-8'>
                  <p className='text-medium-contrast'>No active alerts</p>
                </div>,
              ]}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Subscription Management Component
function SubscriptionManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: subscriptions } = useQuery({
    queryKey: ['/api/platform-admin/subscriptions'],
    staleTime: 60 * 1000,
  });

  const filteredSubscriptions =
    subscriptions?.filter(
      (sub: any) =>
        sub.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>Subscription Management</h2>
        <div className='flex items-center gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-medium-contrast' />
            <Input
              placeholder='Search subscriptions...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 w-64'
            />
          </div>
        </div>
      </div>

      <div className='rounded-md border'>
        <table className='w-full'>
          <thead>
            <tr className='border-b'>
              <th className='text-left p-4'>Organization</th>
              <th className='text-left p-4'>Plan</th>
              <th className='text-left p-4'>Status</th>
              <th className='text-left p-4'>Revenue</th>
              <th className='text-left p-4'>Usage</th>
              <th className='text-left p-4'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((subscription: any) => (
              <tr key={subscription.id} className='border-b'>
                <td className='p-4'>
                  <div>
                    <p className='font-medium'>
                      {subscription.organizationName}
                    </p>
                    <p className='text-sm text-medium-contrast'>
                      {subscription.contact}
                    </p>
                  </div>
                </td>
                <td className='p-4'>
                  <Badge variant='outline'>{subscription.planName}</Badge>
                </td>
                <td className='p-4'>
                  <Badge
                    className={
                      subscription.status === 'active'
                        ? 'bg-success'
                        : 'bg-warning'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </td>
                <td className='p-4'>£{subscription.monthlyRevenue}</td>
                <td className='p-4'>
                  <div className='text-sm'>
                    <p>
                      {subscription.residents}/{subscription.maxResidents}{' '}
                      residents
                    </p>
                    <p className='text-medium-contrast'>
                      {subscription.usagePercent}% of limit
                    </p>
                  </div>
                </td>
                <td className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Button size='sm' variant='outline'>
                      Manage
                    </Button>
                    <Button size='sm' variant='outline'>
                      Billing
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Organization Management Component
function OrganizationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: organizations } = useQuery({
    queryKey: ['/api/platform-admin/organizations'],
    staleTime: 60 * 1000,
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>Organization Management</h2>
        <Button>Create Organization</Button>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-medium-contrast' />
          <Input
            placeholder='Search organizations...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {organizations?.map((org: any) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>{org.name}</span>
                <Badge
                  variant={org.status === 'active' ? 'default' : 'secondary'}
                >
                  {org.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 text-sm'>
                <p>
                  <strong>Plan:</strong> {org.subscriptionPlan}
                </p>
                <p>
                  <strong>Residents:</strong> {org.residents}
                </p>
                <p>
                  <strong>Created:</strong> {org.createdAt}
                </p>
                <p>
                  <strong>Contact:</strong> {org.primaryContact}
                </p>
              </div>
              <div className='flex items-center gap-2 mt-4'>
                <Button size='sm' variant='outline'>
                  Configure
                </Button>
                <Button size='sm' variant='outline'>
                  Analytics
                </Button>
                <Button size='sm' variant='outline'>
                  Disable
                </Button>
              </div>
            </CardContent>
          </Card>
        )) || [
          <div key='placeholder' className='col-span-full text-center py-8'>
            <p className='text-medium-contrast'>No organizations found</p>
          </div>,
        ]}
      </div>
    </div>
  );
}

// System Monitoring Component
function SystemMonitoring() {
  const { data: metrics } = useQuery({
    queryKey: ['/api/platform-admin/monitoring'],
    staleTime: 30 * 1000,
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>System Monitoring</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Database Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Query Time</span>
                <span>{metrics?.database?.avgQueryTime || 0}ms</span>
              </div>
              <div className='flex justify-between'>
                <span>Connections</span>
                <span>{metrics?.database?.connections || 0}/100</span>
              </div>
              <div className='flex justify-between'>
                <span>Cache Hit Rate</span>
                <span>{metrics?.database?.cacheHitRate || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Response Time</span>
                <span>{metrics?.api?.avgResponseTime || 0}ms</span>
              </div>
              <div className='flex justify-between'>
                <span>Error Rate</span>
                <span>{metrics?.api?.errorRate || 0}%</span>
              </div>
              <div className='flex justify-between'>
                <span>Requests/min</span>
                <span>{metrics?.api?.requestsPerMinute || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Uptime</span>
                <span>{metrics?.system?.uptime || 0}%</span>
              </div>
              <div className='flex justify-between'>
                <span>Memory Usage</span>
                <span>{metrics?.system?.memoryUsage || 0}%</span>
              </div>
              <div className='flex justify-between'>
                <span>CPU Usage</span>
                <span>{metrics?.system?.cpuUsage || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Platform Analytics Component
function PlatformAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: analytics } = useQuery({
    queryKey: ['/api/platform-admin/analytics', timeRange],
    staleTime: 60 * 1000,
  });

  const { data: organizationBreakdowns } = useQuery({
    queryKey: ['/api/platform-admin/organization-breakdowns', timeRange],
    staleTime: 60 * 1000,
  });

  const { data: realTimeMetrics } = useQuery({
    queryKey: ['/api/platform-admin/real-time-metrics'],
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });

  const handleDataExport = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(
        `/api/platform-admin/export-data?format=${format}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: `£${analytics?.revenue?.total?.toLocaleString() || 0}`,
      change: `From ${organizationBreakdowns?.organizations?.length || 0} organizations`,
      icon: BarChart3,
      trend: 'up',
    },
    {
      title: 'Average Occupancy',
      value: `${analytics?.occupancy?.average || 0}%`,
      change: `Across ${organizationBreakdowns?.summary?.totalProperties || 0} properties`,
      icon: Users,
      trend: 'up',
    },
    {
      title: 'Total Incidents',
      value: `${analytics?.incidents?.total || 0}`,
      change: `Avg response: ${analytics?.incidents?.averageResponseTime || 0}min`,
      icon: AlertTriangle,
      trend: 'down',
    },
    {
      title: 'Total Residents',
      value: `${analytics?.residents?.total || 0}`,
      change: `${realTimeMetrics?.metrics?.activeResidents || 0} active`,
      icon: Users,
      trend: 'up',
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>Platform Analytics</h2>
        <div className='flex items-center gap-4'>
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className='px-3 py-2 border rounded-md'
          >
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
            <option value='365d'>Last year</option>
          </select>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleDataExport('csv')}
          >
            <Download className='h-4 w-4 mr-2' />
            Export CSV
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleDataExport('json')}
          >
            <Download className='h-4 w-4 mr-2' />
            Export JSON
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {metrics.map(metric => (
          <Card key={metric.title}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-medium-contrast'>{metric.title}</p>
                  <p className='text-2xl font-semibold'>{metric.value}</p>
                  <p className='text-sm text-success'>{metric.change}</p>
                </div>
                <metric.icon className='h-8 w-8 text-primary' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Organization Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {organizationBreakdowns?.organizations
                ?.slice(0, 10)
                .map((org: any, index: number) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <div>
                      <p className='font-medium'>{org.organizationName}</p>
                      <p className='text-sm text-medium-contrast'>
                        {org.residents} residents • {org.properties} properties
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium'>
                        £{org.revenue?.toLocaleString()}
                      </p>
                      <p className='text-sm text-medium-contrast'>
                        {org.occupancyRate}% occupied
                      </p>
                    </div>
                  </div>
                )) || []}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Real-Time Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-medium-contrast'>
                  Active Residents
                </span>
                <span className='font-medium'>
                  {realTimeMetrics?.metrics?.activeResidents || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-medium-contrast'>Properties</span>
                <span className='font-medium'>
                  {realTimeMetrics?.metrics?.totalProperties || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-medium-contrast'>
                  Incidents (24h)
                </span>
                <span className='font-medium'>
                  {realTimeMetrics?.metrics?.recentIncidents || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-medium-contrast'>
                  Maintenance Requests
                </span>
                <span className='font-medium'>
                  {realTimeMetrics?.metrics?.pendingMaintenance || 0}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-medium-contrast'>
                  Last Updated
                </span>
                <span className='text-sm text-medium-contrast'>
                  {realTimeMetrics?.lastUpdated
                    ? new Date(realTimeMetrics.lastUpdated).toLocaleTimeString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Billing Oversight Component
function BillingOversight() {
  const { data: billing } = useQuery({
    queryKey: ['/api/platform-admin/billing'],
    staleTime: 60 * 1000,
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Billing Oversight</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Payment Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Success Rate</span>
                <span>{billing?.payments?.successRate || 0}%</span>
              </div>
              <div className='flex justify-between'>
                <span>Failed Payments</span>
                <span>{billing?.payments?.failed || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span>Processing Volume</span>
                <span>£{billing?.payments?.volume?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Generated</span>
                <span>{billing?.invoices?.generated || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span>Paid</span>
                <span>{billing?.invoices?.paid || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span>Overdue</span>
                <span>{billing?.invoices?.overdue || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Monthly</span>
                <span>£{billing?.revenue?.monthly?.toLocaleString() || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span>Annual</span>
                <span>£{billing?.revenue?.annual?.toLocaleString() || 0}</span>
              </div>
              <div className='flex justify-between'>
                <span>Growth</span>
                <span>+{billing?.revenue?.growth || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Feature Flag Management Component
function FeatureFlagManagement() {
  const { data: features } = useQuery({
    queryKey: ['/api/platform-admin/features'],
    staleTime: 60 * 1000,
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Feature Flag Management</h2>

      <div className='space-y-4'>
        {features?.map((feature: any) => (
          <Card key={feature.id}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-semibold'>{feature.name}</h3>
                  <p className='text-sm text-medium-contrast'>
                    {feature.description}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Button size='sm' variant='outline'>
                    {feature.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || [
          <div key='placeholder' className='text-center py-8'>
            <p className='text-medium-contrast'>No feature flags configured</p>
          </div>,
        ]}
      </div>
    </div>
  );
}

// Emergency Tools Component
function EmergencyTools() {
  const { toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: string;
    targetId: string;
    onConfirm: (reason: string) => void;
  }>({
    open: false,
    title: '',
    description: '',
    action: '',
    targetId: '',
    onConfirm: () => {},
  });

  const handleEmergencyAction = (action: string, targetId?: string) => {
    const actionConfig = {
      'Organization Disable': {
        title: 'Disable Organization',
        description:
          'This will immediately disable the organization and prevent all access. This action cannot be undone without manual intervention.',
        action: 'disable_organization',
      },
      'Password Reset': {
        title: 'Emergency Password Reset',
        description:
          'This will reset the user password and send a secure reset link. The user will be logged out immediately.',
        action: 'reset_password',
      },
      'Maintenance Mode': {
        title: 'Enable Maintenance Mode',
        description:
          'This will put the entire system into maintenance mode, preventing all user access except platform admins.',
        action: 'maintenance_mode',
      },
      'System Notification': {
        title: 'Send System Notification',
        description:
          'This will send a system-wide notification to all users and administrators.',
        action: 'system_notification',
      },
    };

    const config = actionConfig[action as keyof typeof actionConfig];
    if (!config) return;

    setConfirmDialog({
      open: true,
      title: config.title,
      description: config.description,
      action: config.action,
      targetId: targetId || '',
      onConfirm: async (reason: string) => {
        try {
          const response = await fetch('/api/platform-admin/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: config.action,
              targetId: targetId || '',
              reason,
            }),
          });

          if (!response.ok) {
            throw new Error('Emergency action failed');
          }

          toast({
            title: 'Emergency Action Executed',
            description: `${action} has been successfully executed.`,
            variant: 'destructive',
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to execute emergency action.',
            variant: 'destructive',
          });
        }
      },
    });
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-semibold'>Emergency Tools</h2>

      <Alert className='border-error bg-error/10'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          These tools should only be used in emergency situations. All actions
          are logged and audited.
        </AlertDescription>
      </Alert>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Organization Controls</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => handleEmergencyAction('Organization Disable')}
            >
              Disable Organization
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => handleEmergencyAction('Password Reset')}
            >
              Emergency Password Reset
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Controls</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => handleEmergencyAction('Maintenance Mode')}
            >
              Enable Maintenance Mode
            </Button>
            <Button
              variant='outline'
              className='w-full'
              onClick={() => handleEmergencyAction('System Notification')}
            >
              Send System Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        actionType='danger'
        requireReason={true}
        requireConfirmation={true}
        confirmationWord='EXECUTE'
      />
    </div>
  );
}
