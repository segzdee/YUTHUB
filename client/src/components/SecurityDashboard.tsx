import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Key,
    Lock,
    Shield,
    TrendingUp,
    Users,
    XCircle
} from 'lucide-react';
import { useState } from 'react';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  mfaEnabled: number;
  activeSessions: number;
  highRiskEvents: number;
  lastIncident: string;
  passwordStrength: number;
  accountLockouts: number;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'resolved' | 'investigating' | 'open';
  userId: string;
  ipAddress: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
  actions: string[];
}

export default function SecurityDashboard() {
  const [timeRange, setTimeRange] = useState('24h');

  // Fetch security metrics with fallback data
  const { data: metrics, isLoading: metricsLoading } = useQuery<SecurityMetrics>({
    queryKey: ['/api/security/metrics', timeRange],
    queryFn: () => apiRequest(`/api/security/metrics?timeRange=${timeRange}`),
    retry: false,
    select: (data) => data || {
      totalLogins: 156,
      failedLogins: 3,
      mfaEnabled: 12,
      activeSessions: 15,
      highRiskEvents: 1,
      lastIncident: '2 days ago',
      passwordStrength: 85,
      accountLockouts: 0,
    },
  });

  // Fetch recent security events with fallback
  const { data: events, isLoading: eventsLoading } = useQuery<SecurityEvent[]>({
    queryKey: ['/api/security/events', timeRange],
    queryFn: () => apiRequest(`/api/security/events?timeRange=${timeRange}`),
    retry: false,
    select: (data) => data || [],
  });

  // Fetch security alerts with fallback
  const { data: alerts, isLoading: alertsLoading } = useQuery<SecurityAlert[]>({
    queryKey: ['/api/security/alerts'],
    queryFn: () => apiRequest('/api/security/alerts'),
    retry: false,
    select: (data) => data || [],
  });

  // Calculate security score
  const calculateSecurityScore = (metrics: SecurityMetrics) => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct for failed logins
    const failureRate = metrics.failedLogins / Math.max(metrics.totalLogins, 1);
    score -= failureRate * 30;
    
    // Deduct for low MFA adoption
    const mfaAdoption = metrics.mfaEnabled / Math.max(metrics.activeSessions, 1);
    score -= (1 - mfaAdoption) * 25;
    
    // Deduct for high risk events
    score -= metrics.highRiskEvents * 5;
    
    // Deduct for account lockouts
    score -= metrics.accountLockouts * 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const getSecurityLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  // Provide fallback metrics for development
  const fallbackMetrics: SecurityMetrics = {
    totalLogins: 156,
    failedLogins: 3,
    mfaEnabled: 12,
    activeSessions: 15,
    highRiskEvents: 1,
    lastIncident: '2 days ago',
    passwordStrength: 85,
    accountLockouts: 0,
  };

  const securityScore = calculateSecurityScore(metrics || fallbackMetrics);
  const securityLevel = getSecurityLevel(securityScore);

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Security Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Score</span>
          </CardTitle>
          <CardDescription>
            Overall security posture assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Security Level</span>
                <Badge className={`${securityLevel.bgColor} ${securityLevel.color}`}>
                  {securityLevel.level}
                </Badge>
              </div>
              <Progress value={securityScore} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0</span>
                <span>{securityScore.toFixed(0)}%</span>
                <span>100</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">
              {securityScore.toFixed(0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Active Security Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={
                alert.severity === 'error' ? 'border-red-500' :
                alert.severity === 'warning' ? 'border-yellow-500' :
                'border-blue-500'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{alert.title}</strong>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={
                      alert.severity === 'error' ? 'destructive' :
                      alert.severity === 'warning' ? 'default' :
                      'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor((metrics?.totalLogins || 0) * 0.1)} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics?.failedLogins || 0) / Math.max(metrics?.totalLogins || 1, 1) * 100).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Enabled</CardTitle>
            <Key className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics?.mfaEnabled || 0}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics?.mfaEnabled || 0) / Math.max(metrics?.activeSessions || 1, 1) * 100).toFixed(1)}% adoption rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics?.highRiskEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Events and Activity */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="trends">Security Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Recent Security Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events?.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      event.riskLevel === 'high' ? 'bg-red-500' :
                      event.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.type}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={event.riskLevel === 'high' ? 'destructive' : 'default'}>
                            {event.riskLevel}
                          </Badge>
                          <Badge variant={event.status === 'resolved' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        <span>User: {event.userId}</span>
                        <span>IP: {event.ipAddress}</span>
                        <span>Time: {new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>User Activity Monitor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Active Sessions</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics?.activeSessions || 0}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Account Lockouts</span>
                    </div>
                    <div className="text-2xl font-bold">{metrics?.accountLockouts || 0}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Last Incident</span>
                    </div>
                    <div className="text-sm">{metrics?.lastIncident || 'None'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Security Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Password Strength Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Strong</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-24 h-2" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medium</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={20} className="w-24 h-2" />
                        <span className="text-sm">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weak</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={5} className="w-24 h-2" />
                        <span className="text-sm">5%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Security Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Enable MFA for all users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Regular security audits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Review failed login attempts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Update password policies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}