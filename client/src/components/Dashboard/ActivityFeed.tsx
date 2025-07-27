import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  UserPlus,
} from 'lucide-react';

interface Activity {
  id: number;
  activityType: string;
  title: string;
  description: string;
  createdAt: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'placement':
      return UserPlus;
    case 'support_plan':
      return ClipboardCheck;
    case 'incident':
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
      return 'text-primary bg-primary bg-opacity-10';
    case 'support_plan':
      return 'text-secondary bg-secondary bg-opacity-10';
    case 'incident':
      return 'text-accent bg-accent bg-opacity-10';
    case 'assessment':
      return 'text-success bg-success bg-opacity-10';
    default:
      return 'text-neutral-500 bg-neutral-100';
  }
};

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    queryFn: () => apiRequest('/api/activities'),
  });

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
          {activities?.length ? (
            activities.map(activity => {
              const Icon = getActivityIcon(activity.activityType);
              const colorClass = getActivityColor(activity.activityType);

              return (
                <div key={activity.id} className='flex items-start space-x-3'>
                  <div
                    className={`rounded-full p-2 flex-shrink-0 ${colorClass}`}
                  >
                    <Icon className='h-4 w-4' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-slate font-medium'>
                      {activity.title}
                    </p>
                    <p className='text-xs text-neutral-500 truncate'>
                      {activity.description}
                    </p>
                    <p className='text-xs text-neutral-400'>
                      {formatDistanceToNow(new Date(activity.createdAt), {
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
