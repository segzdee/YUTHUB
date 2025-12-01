import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  UserPlus,
} from 'lucide-react';
import { useRecentActivity } from '@/hooks/useDashboardData';

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: Date;
  severity?: string;
  resident?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'placement':
    case 'admission':
      return UserPlus;
    case 'support_plan':
      return ClipboardCheck;
    case 'safety':
    case 'behavioral':
    case 'medical':
    case 'maintenance':
      return AlertTriangle;
    case 'assessment':
      return GraduationCap;
    default:
      return ClipboardCheck;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'placement':
    case 'admission':
      return 'text-primary bg-primary bg-opacity-10';
    case 'support_plan':
      return 'text-secondary bg-secondary bg-opacity-10';
    case 'safety':
    case 'behavioral':
    case 'medical':
    case 'maintenance':
      return 'text-accent bg-accent bg-opacity-10';
    case 'assessment':
      return 'text-success bg-success bg-opacity-10';
    default:
      return 'text-neutral-500 bg-neutral-100';
  }
};

export default function ActivityFeed() {
  const { data: activities = [], isLoading, error } = useRecentActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='flex items-start space-x-3'>
                <Skeleton className='w-8 h-8 rounded-full' />
                <div className='flex-1'>
                  <Skeleton className='h-4 w-3/4 mb-2' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {error ? (
            <div className='text-center py-8'>
              <AlertTriangle className='h-10 w-10 text-amber-500 mx-auto mb-2' />
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Unable to load activities
              </p>
            </div>
          ) : activities?.length ? (
            activities.map(activity => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div key={activity.id} className='flex items-start space-x-3'>
                  <div
                    className={`rounded-full p-2 flex-shrink-0 ${colorClass}`}
                  >
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-slate font-medium'>
                      {activity.description}
                    </p>
                    {activity.resident && (
                      <p className='text-xs text-neutral-500 truncate'>
                        Resident: {activity.resident}
                      </p>
                    )}
                    {activity.severity && (
                      <span className='text-xs text-orange-600 font-medium'>
                        {activity.severity}
                      </span>
                    )}
                    <p className='text-xs text-neutral-400 mt-1'>
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='text-center py-8 text-gray-500'>
              <p>No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
