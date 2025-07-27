import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  Shield,
} from 'lucide-react';

interface IncidentReportProps {
  dateRange?: { start: string; end: string };
  properties?: string[];
}

export default function IncidentReport({
  dateRange,
  properties,
}: IncidentReportProps) {
  const { data: incidents = [] } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const { data: propertiesData = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const summaryData = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter((i: any) => i.status === 'open').length,
    resolvedIncidents: incidents.filter((i: any) => i.status === 'resolved')
      .length,
    averageResolutionTime: 3.2, // days
    trends: {
      incidents: -8.5, // percentage change
      resolution: 12.3, // percentage change
    },
  };

  const incidentsByType = [
    { type: 'Behavioral', count: 15, percentage: 35, severity: 'medium' },
    { type: 'Safety', count: 12, percentage: 28, severity: 'high' },
    { type: 'Medical', count: 8, percentage: 19, severity: 'high' },
    { type: 'Maintenance', count: 8, percentage: 19, severity: 'low' },
  ];

  const incidentsBySeverity = [
    { severity: 'Critical', count: 3, percentage: 7, color: 'bg-red-500' },
    { severity: 'High', count: 12, percentage: 28, color: 'bg-orange-500' },
    { severity: 'Medium', count: 18, percentage: 42, color: 'bg-yellow-500' },
    { severity: 'Low', count: 10, percentage: 23, color: 'bg-green-500' },
  ];

  const exportReport = () => {
    const reportData = {
      title: 'Incident Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: summaryData,
      incidentsByType,
      incidentsBySeverity,
      incidents: incidents,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Incident Report</h2>
        <Button onClick={exportReport}>
          <Download className='mr-2 h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Incidents
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.totalIncidents}
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingDown className='mr-1 h-3 w-3' />
              {summaryData.trends.incidents}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Open Incidents
            </CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.openIncidents}
            </div>
            <p className='text-xs text-muted-foreground'>Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Resolved</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.resolvedIncidents}
            </div>
            <p className='text-xs text-muted-foreground'>
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Resolution
            </CardTitle>
            <TrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.averageResolutionTime} days
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />+
              {summaryData.trends.resolution}% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Types */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {incidentsByType.map(type => (
              <div key={type.type} className='border rounded-lg p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold'>{type.type}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {type.percentage}% of all incidents
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold'>{type.count}</div>
                    <Badge
                      variant={
                        type.severity === 'high'
                          ? 'destructive'
                          : type.severity === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {type.severity} severity
                    </Badge>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Frequency</span>
                    <span>{type.percentage}%</span>
                  </div>
                  <Progress value={type.percentage} className='h-2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Incidents by Severity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {incidentsBySeverity.map(severity => (
              <div key={severity.severity} className='border rounded-lg p-4'>
                <div className='flex justify-between items-center mb-2'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${severity.color}`}
                    ></div>
                    <span className='font-semibold'>{severity.severity}</span>
                  </div>
                  <span className='text-lg font-bold'>{severity.count}</span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Percentage</span>
                    <span>{severity.percentage}%</span>
                  </div>
                  <Progress value={severity.percentage} className='h-2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {incidents.slice(0, 5).map((incident: any) => (
              <div key={incident.id} className='border rounded-lg p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h3 className='font-semibold'>{incident.title}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {incident.description}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Badge
                      variant={
                        incident.severity === 'high'
                          ? 'destructive'
                          : incident.severity === 'medium'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {incident.severity}
                    </Badge>
                    <Badge
                      variant={
                        incident.status === 'open' ? 'destructive' : 'default'
                      }
                    >
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-red-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>Address High-Severity Incidents</p>
                <p className='text-sm text-muted-foreground'>
                  Focus on resolving the{' '}
                  {
                    incidentsBySeverity.find(s => s.severity === 'Critical')
                      ?.count
                  }{' '}
                  critical incidents immediately
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-orange-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>Improve Safety Protocols</p>
                <p className='text-sm text-muted-foreground'>
                  Safety incidents account for 28% of all incidents. Review and
                  update safety procedures
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 bg-green-500 rounded-full mt-2'></div>
              <div>
                <p className='font-medium'>Maintain Current Trend</p>
                <p className='text-sm text-muted-foreground'>
                  Incidents are down 8.5% from last month. Continue current
                  prevention strategies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
