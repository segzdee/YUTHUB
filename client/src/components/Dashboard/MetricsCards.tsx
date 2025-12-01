import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Building, Percent, Users, RefreshCw } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardData';

export default function MetricsCards() {
  const {
    data: metrics,
    isLoading,
    error,
    refetch,
  } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <Skeleton className='h-16 w-full' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='md:col-span-2 lg:col-span-4'>
          <CardContent className='p-6 text-center space-y-4'>
            <div className='flex flex-col items-center gap-3'>
              <AlertTriangle className='h-12 w-12 text-amber-500' />
              <div>
                <p className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                  Unable to Load Metrics
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                  {error instanceof Error ? error.message : 'An error occurred while fetching dashboard metrics. Please try again.'}
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                variant='outline'
                className='mt-2'
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Properties',
      value: metrics?.totalProperties || 0,
      icon: Building,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
      change: '+8.2%',
      changeColor: 'text-success',
      ariaLabel: `Total properties: ${metrics?.totalProperties || 0}, increased by 8.2%`,
    },
    {
      title: 'Current Residents',
      value: metrics?.currentResidents || 0,
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary bg-opacity-10',
      change: '+12.1%',
      changeColor: 'text-success',
      ariaLabel: `Current residents: ${metrics?.currentResidents || 0}, increased by 12.1%`,
    },
    {
      title: 'Occupancy Rate',
      value: `${metrics?.occupancyRate || 0}%`,
      icon: Percent,
      color: 'text-success',
      bgColor: 'status-success bg-opacity-10',
      change: '+2.3%',
      changeColor: 'text-success',
      ariaLabel: `Occupancy rate: ${metrics?.occupancyRate || 0}%, increased by 2.3%`,
    },
    {
      title: 'Active Incidents',
      value: metrics?.activeIncidents || 0,
      icon: AlertTriangle,
      color: 'text-accent',
      bgColor: 'status-error bg-opacity-10',
      change: '-15.2%',
      changeColor: 'text-success',
      ariaLabel: `Active incidents: ${metrics?.activeIncidents || 0}, decreased by 15.2%`,
    },
  ];

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
      {metricCards.map(card => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className='border border-gray-200'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs sm:text-sm text-gray-600 truncate'>
                    {card.title}
                  </p>
                  <p className='text-2xl sm:text-3xl font-semibold text-slate mt-1'>
                    {card.value}
                  </p>
                </div>
                <div
                  className={`${card.bgColor} rounded-full p-2 sm:p-3 flex-shrink-0`}
                >
                  <Icon className={`${card.color} h-5 w-5 sm:h-6 sm:w-6`} />
                </div>
              </div>
              <div className='mt-3 sm:mt-4 flex items-center'>
                <span
                  className={`text-xs sm:text-sm font-medium ${card.changeColor}`}
                >
                  {card.change}
                </span>
                <span className='text-gray-500 text-xs sm:text-sm ml-2'>
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
