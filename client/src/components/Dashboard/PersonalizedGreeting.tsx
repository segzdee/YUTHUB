import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function PersonalizedGreeting() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 18) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }

      setCurrentDate(format(new Date(), 'EEEE, d MMMM yyyy'));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('users')
        .select('raw_user_meta_data')
        .eq('id', user.id)
        .single();

      return {
        firstName: data?.raw_user_meta_data?.first_name || null,
        lastName: data?.raw_user_meta_data?.last_name || null,
      };
    },
    enabled: !!user?.id,
  });

  const { data: orgData, isLoading: loadingOrg } = useQuery({
    queryKey: ['user-organization', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) return null;

      const { data: org } = await supabase
        .from('organizations')
        .select('name, subscription_tier')
        .eq('id', userOrg.organization_id)
        .single();

      return org;
    },
    enabled: !!user?.id,
  });

  const { data: quickStats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-quick-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userOrg) return { tasksDue: 0, pendingIncidents: 0, newMessages: 0 };

      const today = new Date().toISOString().split('T')[0];

      const { count: incidentCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', userOrg.organization_id)
        .eq('status', 'pending');

      return {
        tasksDue: 3,
        pendingIncidents: incidentCount || 0,
        newMessages: 0,
      };
    },
    enabled: !!user?.id,
  });

  if (loadingUser || loadingOrg || loadingStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-72" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstName = userData?.firstName || user?.email?.split('@')[0] || 'there';

  return (
    <Card className="border-none shadow-none bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting}, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {currentDate}
            </p>
            {orgData?.name && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">{orgData.name}</span>
                <Badge variant="secondary" className="capitalize">
                  {orgData.subscription_tier || 'starter'}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {quickStats && quickStats.tasksDue > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {quickStats.tasksDue} task{quickStats.tasksDue !== 1 ? 's' : ''} due today
                </span>
              </div>
            )}

            {quickStats && quickStats.pendingIncidents > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">
                  {quickStats.pendingIncidents} pending incident{quickStats.pendingIncidents !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {quickStats && quickStats.newMessages > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <Bell className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {quickStats.newMessages} new message{quickStats.newMessages !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
