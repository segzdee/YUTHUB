import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Home, Users, TrendingUp, TrendingDown, Download } from 'lucide-react';

interface OccupancyReportProps {
  dateRange?: { start: string; end: string };
  properties?: string[];
}

export default function OccupancyReport({
  dateRange,
  properties,
}: OccupancyReportProps) {
  const { data: occupancyData, isLoading } = useQuery({
    queryKey: ['/api/reports/occupancy', dateRange, properties],
  });

  const { data: propertiesData = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>
              Generating occupancy report...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryData = {
    totalUnits: 50,
    occupiedUnits: 42,
    vacantUnits: 8,
    occupancyRate: 84,
    averageStayDuration: 14, // months
    turnoverRate: 12, // percentage
    trends: {
      occupancy: 2.5, // percentage change
      revenue: 8.2, // percentage change
    },
  };

  const propertyOccupancy = propertiesData.map((property: any) => ({
    ...property,
    occupancyRate: Math.floor(Math.random() * 30) + 70, // Demo data
    totalUnits: property.totalUnits || 10,
    occupiedUnits: property.occupiedUnits || 8,
    revenue: Math.floor(Math.random() * 5000) + 3000,
    trend: Math.random() > 0.5 ? 'up' : 'down',
  }));

  const exportReport = () => {
    const reportData = {
      title: 'Occupancy Report',
      generatedAt: new Date().toISOString(),
      dateRange,
      summary: summaryData,
      propertyData: propertyOccupancy,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `occupancy_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Occupancy Report</h2>
        <Button onClick={exportReport}>
          <Download className='mr-2 h-4 w-4' />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Units</CardTitle>
            <Home className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{summaryData.totalUnits}</div>
            <p className='text-xs text-muted-foreground'>
              Across all properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Occupied Units
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.occupiedUnits}
            </div>
            <p className='text-xs text-muted-foreground'>Currently occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Occupancy Rate
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.occupancyRate}%
            </div>
            <div className='flex items-center text-xs text-green-600'>
              <TrendingUp className='mr-1 h-3 w-3' />+
              {summaryData.trends.occupancy}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg. Stay Duration
            </CardTitle>
            <TrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {summaryData.averageStayDuration} mo
            </div>
            <p className='text-xs text-muted-foreground'>
              Average length of stay
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Property Occupancy Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {propertyOccupancy.map(property => (
              <div key={property.id} className='border rounded-lg p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='font-semibold'>{property.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {property.address}
                    </p>
                  </div>
                  <div className='text-right'>
                    <Badge
                      variant={
                        property.occupancyRate >= 80 ? 'default' : 'secondary'
                      }
                    >
                      {property.occupancyRate}% occupied
                    </Badge>
                  </div>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-3'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total Units</p>
                    <p className='font-medium'>{property.totalUnits}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Occupied</p>
                    <p className='font-medium'>{property.occupiedUnits}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Vacant</p>
                    <p className='font-medium'>
                      {property.totalUnits - property.occupiedUnits}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Monthly Revenue
                    </p>
                    <p className='font-medium'>
                      £{property.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Occupancy Rate</span>
                    <span>{property.occupancyRate}%</span>
                  </div>
                  <Progress value={property.occupancyRate} className='h-2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends and Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trends and Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='font-semibold mb-3'>Key Metrics</h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Average Occupancy Rate</span>
                  <span className='text-sm font-medium'>
                    {summaryData.occupancyRate}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Turnover Rate</span>
                  <span className='text-sm font-medium'>
                    {summaryData.turnoverRate}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Vacancy Rate</span>
                  <span className='text-sm font-medium'>
                    {100 - summaryData.occupancyRate}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className='font-semibold mb-3'>Performance Indicators</h3>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Occupancy Trend</span>
                  <div className='flex items-center text-green-600'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    <span className='text-sm'>
                      +{summaryData.trends.occupancy}%
                    </span>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Revenue Trend</span>
                  <div className='flex items-center text-green-600'>
                    <TrendingUp className='mr-1 h-3 w-3' />
                    <span className='text-sm'>
                      +{summaryData.trends.revenue}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
