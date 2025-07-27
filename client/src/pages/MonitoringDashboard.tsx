import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle, Cpu, Database, MemoryStick, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
    warnings: string[];
  };
  performance: {
    avgResponseTime: number;
    requestCount: number;
    errorRate: number;
    slowQueries: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
    cacheHitRate: number;
  };
  system: {
    uptime: number;
    cpuUsage: number;
    nodeVersion: string;
    platform: string;
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail';
      message?: string;
    }>;
  };
}

export default function MonitoringDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch all monitoring data
  const { data: metrics, isLoading, error } = useQuery<SystemMetrics>({
    queryKey: ['monitoring-dashboard'],
    queryFn: async () => {
      const [memory, performance, database, system, health] = await Promise.all([
        fetch('/api/monitoring/memory').then(r => r.json()),
        fetch('/api/monitoring/performance').then(r => r.json()),
        fetch('/api/monitoring/database').then(r => r.json()),
        fetch('/api/monitoring/system').then(r => r.json()),
        fetch('/api/monitoring/health').then(r => r.json())
      ]);
      
      return { memory, performance, database, system, health };
    },
    refetchInterval: refreshInterval,
    staleTime: 10000
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'pass': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': case 'fail': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'pass': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': case 'fail': return <XCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Failed to load monitoring data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={10000}>10s refresh</option>
            <option value={30000}>30s refresh</option>
            <option value={60000}>1m refresh</option>
            <option value={300000}>5m refresh</option>
          </select>
          <Badge 
            variant={metrics?.health?.status === 'healthy' ? 'default' : 'destructive'}
            className={getStatusColor(metrics?.health?.status || 'unknown')}
          >
            {getStatusIcon(metrics?.health?.status || 'unknown')}
            {metrics?.health?.status?.toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Memory Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.memory?.percentage?.toFixed(1)}%
            </div>
            <Progress value={metrics?.memory?.percentage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {(metrics?.memory?.used / 1024 / 1024).toFixed(0)}MB / 
              {(metrics?.memory?.total / 1024 / 1024).toFixed(0)}MB
            </p>
            {metrics?.memory?.warnings?.length > 0 && (
              <div className="mt-2">
                {metrics.memory.warnings.map((warning, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">
                    {warning}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CPU Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.system?.cpuUsage?.toFixed(1)}%
            </div>
            <Progress value={metrics?.system?.cpuUsage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Node.js {metrics?.system?.nodeVersion}
            </p>
          </CardContent>
        </Card>

        {/* Database Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.database?.queryTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Avg Query Time
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Connections:</span>
                <span>{metrics?.database?.connections}/{metrics?.database?.maxConnections}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Cache Hit:</span>
                <span>{metrics?.database?.cacheHitRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.performance?.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Avg Response Time
            </p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Requests:</span>
                <span>{metrics?.performance?.requestCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Error Rate:</span>
                <span className={metrics?.performance?.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
                  {metrics?.performance?.errorRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics?.health?.checks?.map((check, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                <div className={getStatusColor(check.status)}>
                  {getStatusIcon(check.status)}
                </div>
                <div>
                  <p className="font-medium">{check.name}</p>
                  {check.message && (
                    <p className="text-sm text-gray-600">{check.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{Math.floor((metrics?.system?.uptime || 0) / 3600)}h {Math.floor(((metrics?.system?.uptime || 0) % 3600) / 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span>Platform:</span>
                <span>{metrics?.system?.platform}</span>
              </div>
              <div className="flex justify-between">
                <span>Node Version:</span>
                <span>{metrics?.system?.nodeVersion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Requests:</span>
                <span>{metrics?.performance?.requestCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Slow Queries:</span>
                <span className={metrics?.performance?.slowQueries > 10 ? 'text-red-600' : 'text-green-600'}>
                  {metrics?.performance?.slowQueries}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className={metrics?.performance?.errorRate > 5 ? 'text-red-600' : 'text-green-600'}>
                  {metrics?.performance?.errorRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}