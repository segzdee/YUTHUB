import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    Building,
    DollarSign,
    Shield,
    Target
} from 'lucide-react';

interface CrossModuleWidgetProps {
  title: string;
  type: 'overview' | 'risk-assessment' | 'financial-summary' | 'occupancy-status' | 'incident-alerts' | 'support-progress';
  className?: string;
}

export default function CrossModuleWidget({ title, type, className = '' }: CrossModuleWidgetProps) {
  // Fetch data from all relevant modules
  const { data: residents = [] } = useQuery({ 
    queryKey: ['/api/residents'],
    queryFn: () => apiRequest('/api/residents'),
  });
  const { data: properties = [] } = useQuery({ 
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('/api/properties'),
  });
  const { data: incidents = [] } = useQuery({ 
    queryKey: ['/api/incidents'],
    queryFn: () => apiRequest('/api/incidents'),
  });
  const { data: supportPlans = [] } = useQuery({ 
    queryKey: ['/api/support-plans'],
    queryFn: () => apiRequest('/api/support-plans'),
  });
  const { data: financialRecords = [] } = useQuery({ 
    queryKey: ['/api/financial-records'],
    queryFn: () => apiRequest('/api/financial-records'),
  });
  const { data: invoices = [] } = useQuery({ 
    queryKey: ['/api/invoices'],
    queryFn: () => apiRequest('/api/invoices'),
  });

  // Calculate cross-module metrics
  const calculateMetrics = () => {
    const totalCapacity = properties.reduce((sum: number, p: any) => sum + (p.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? (residents.length / totalCapacity) * 100 : 0;
    const activeSupportPlans = supportPlans.filter((sp: any) => sp.status === 'active').length;
    const monthlyRevenue = financialRecords
      .filter((r: any) => r.type === 'income' && 
        new Date(r.date).getMonth() === new Date().getMonth())
      .reduce((sum: number, r: any) => sum + r.amount, 0);
    const pendingInvoices = invoices.filter((i: any) => i.status === 'pending').length;
    const incidentRate = incidents.length / Math.max(residents.length, 1);
    const independenceProgressAverage = residents.reduce((sum: number, r: any) => 
      sum + (r.independenceLevel || 0), 0) / Math.max(residents.length, 1);

    return {
      occupancyRate,
      activeSupportPlans,
      monthlyRevenue,
      pendingInvoices,
      incidentRate,
      independenceProgressAverage,
    };
  };

  const metrics = calculateMetrics();

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const renderContent = () => {
    switch (type) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{residents.length}</div>
                <div className="text-sm text-gray-600">Total Residents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{properties.length}</div>
                <div className="text-sm text-gray-600">Properties</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Occupancy Rate</span>
                <span className="text-sm font-semibold">{metrics.occupancyRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.occupancyRate} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Support Plans</span>
              <Badge variant="outline">{metrics.activeSupportPlans}</Badge>
            </div>
          </div>
        );

      case 'risk-assessment':
        const riskResidents = residents.filter(r => r.riskLevel === 'high');
        const recentIncidents = incidents.filter(i => 
          new Date(i.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        );
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">Risk Assessment</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">High Risk Residents</span>
                <Badge variant="destructive">{riskResidents.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Recent Incidents (7 days)</span>
                <Badge variant="outline">{recentIncidents.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Incident Rate</span>
                <span className="text-sm font-semibold">{metrics.incidentRate.toFixed(2)}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/safeguarding')}>
              View Safeguarding
            </Button>
          </div>
        );

      case 'financial-summary':
        const monthlyExpenses = financialRecords
          .filter(r => r.type === 'expense' && 
            new Date(r.date).getMonth() === new Date().getMonth())
          .reduce((sum, r) => sum + r.amount, 0);
        
        const pendingAmount = invoices
          .filter(i => i.status === 'pending')
          .reduce((sum, i) => sum + i.totalAmount, 0);

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-medium">Financial Summary</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Revenue</span>
                <span className="text-sm font-semibold text-green-600">
                  £{metrics.monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Monthly Expenses</span>
                <span className="text-sm font-semibold text-red-600">
                  £{monthlyExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Invoices</span>
                <Badge variant="outline">{metrics.pendingInvoices}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Amount</span>
                <span className="text-sm font-semibold">
                  £{pendingAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/financials')}>
                Financials
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/billing')}>
                Billing
              </Button>
            </div>
          </div>
        );

      case 'occupancy-status':
        const totalCapacity = properties.reduce((sum, p) => sum + p.capacity, 0);
        const currentOccupancy = residents.length;
        const availableSpaces = totalCapacity - currentOccupancy;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Occupancy Status</span>
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{currentOccupancy}</div>
                <div className="text-sm text-gray-600">of {totalCapacity} occupied</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Occupancy Rate</span>
                  <span className="text-sm font-semibold">{metrics.occupancyRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.occupancyRate} className="h-2" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Spaces</span>
                <Badge variant={availableSpaces > 0 ? "default" : "destructive"}>
                  {availableSpaces}
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/housing')}>
              View Housing
            </Button>
          </div>
        );

      case 'incident-alerts':
        const openIncidents = incidents.filter(i => i.status === 'open');
        const criticalIncidents = incidents.filter(i => i.severity === 'critical');
        const recentIncidents24h = incidents.filter(i => 
          new Date(i.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
        );
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              <span className="font-medium">Incident Alerts</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Open Incidents</span>
                <Badge variant="destructive">{openIncidents.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Critical Incidents</span>
                <Badge variant="destructive">{criticalIncidents.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last 24 Hours</span>
                <Badge variant="outline">{recentIncidents24h.length}</Badge>
              </div>
              {openIncidents.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Immediate attention required</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/safeguarding')}>
              View Incidents
            </Button>
          </div>
        );

      case 'support-progress':
        const completedPlans = supportPlans.filter(sp => sp.status === 'completed');
        const activePlans = supportPlans.filter(sp => sp.status === 'active');
        const pausedPlans = supportPlans.filter(sp => sp.status === 'paused');
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <span className="font-medium">Support Progress</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Plans</span>
                <Badge variant="default">{activePlans.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Plans</span>
                <Badge variant="outline">{completedPlans.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Paused Plans</span>
                <Badge variant="secondary">{pausedPlans.length}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg Independence Level</span>
                  <span className="text-sm font-semibold">
                    {metrics.independenceProgressAverage.toFixed(1)}/5
                  </span>
                </div>
                <Progress value={metrics.independenceProgressAverage * 20} className="h-2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/support')}>
                Support
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleNavigation('/independence')}>
                Independence
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}