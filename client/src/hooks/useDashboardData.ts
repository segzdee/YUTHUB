import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalProperties: number;
  currentResidents: number;
  occupancyRate: number;
  activeIncidents: number;
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Get current user's session to extract organization_id
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // Get user's organization
      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .single();

      if (!userOrg) {
        throw new Error('No organization found');
      }

      const orgId = userOrg.organization_id;

      // Query 1: Total Properties
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      // Query 2: Current Residents
      const { count: residentsCount } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active');

      // Query 3: Properties with capacity data for occupancy calculation
      const { data: properties } = await supabase
        .from('properties')
        .select('total_capacity, current_occupancy')
        .eq('organization_id', orgId);

      // Calculate occupancy rate
      const totalCapacity = properties?.reduce((sum, p) => sum + (p.total_capacity || 0), 0) || 0;
      const totalOccupied = properties?.reduce((sum, p) => sum + (p.current_occupancy || 0), 0) || 0;
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

      // Query 4: Active Incidents
      const { count: incidentsCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['open', 'investigating']);

      return {
        totalProperties: propertiesCount || 0,
        currentResidents: residentsCount || 0,
        occupancyRate,
        activeIncidents: incidentsCount || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .single();

      if (!userOrg) {
        return [];
      }

      // Get recent incidents as activity
      const { data: incidents } = await supabase
        .from('incidents')
        .select(`
          id,
          title,
          incident_type,
          severity,
          status,
          created_at,
          residents (
            first_name,
            last_name
          )
        `)
        .eq('organization_id', userOrg.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      return incidents?.map(incident => ({
        id: incident.id,
        type: incident.incident_type,
        description: incident.title,
        timestamp: new Date(incident.created_at),
        severity: incident.severity,
        resident: incident.residents
          ? `${incident.residents.first_name} ${incident.residents.last_name}`
          : 'Unknown',
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOccupancyTrend() {
  return useQuery({
    queryKey: ['occupancy-trend'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data: userOrg } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .single();

      if (!userOrg) {
        return [];
      }

      // Get properties with current occupancy
      const { data: properties } = await supabase
        .from('properties')
        .select('name, total_capacity, current_occupancy, created_at')
        .eq('organization_id', userOrg.organization_id)
        .order('created_at', { ascending: true });

      // Generate mock trend data (in production, this would come from a time-series table)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      return months.map((month, index) => {
        const totalCapacity = properties?.reduce((sum, p) => sum + (p.total_capacity || 0), 0) || 0;
        const totalOccupied = properties?.reduce((sum, p) => sum + (p.current_occupancy || 0), 0) || 0;

        // Add some variation for demo purposes
        const variation = Math.floor(Math.random() * 10) - 5;
        const occupancy = Math.min(100, Math.max(0, totalCapacity > 0
          ? Math.round((totalOccupied / totalCapacity) * 100) + variation
          : 0));

        return {
          month,
          occupancy,
          capacity: totalCapacity,
        };
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
