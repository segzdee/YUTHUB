import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalResidents: number;
  totalProperties: number;
  occupancyRate: number;
  activeIncidents: number;
  monthlyRevenue: number;
  trends: {
    residents: string;
    incidents: string;
    revenue: string;
    occupancy: string;
  };
}

interface DashboardMetricsResponse {
  success: boolean;
  data: DashboardMetrics;
}

const fetchDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const apiUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5000'}/api/dashboard/metrics`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch metrics: ${response.statusText}`);
  }

  const result: DashboardMetricsResponse = await response.json();

  if (!result.success) {
    throw new Error('API returned unsuccessful response');
  }

  return result.data;
};

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics, Error>({
    queryKey: ['dashboard', 'metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
