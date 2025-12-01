import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardMetrics {
  totalProperties: number;
  currentResidents: number;
  occupancyRate: number;
  activeIncidents: number;
  openConcerns: number;
  complianceScore: number;
  monthlyRevenue: number;
  pendingTasks: number;
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      try {
        // Get current user's session to extract organization_id
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error('Authentication failed. Please log in again.');
        }

        if (!session?.user) {
          throw new Error('Not authenticated. Please log in.');
        }

        // Get user's organization
        const { data: userOrg, error: orgError } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (orgError) {
          console.error('Organization fetch error:', orgError);
          // Return zeros for new users without organization
          return {
            totalProperties: 0,
            currentResidents: 0,
            occupancyRate: 0,
            activeIncidents: 0,
            openConcerns: 0,
            complianceScore: 100,
            monthlyRevenue: 0,
            pendingTasks: 0,
          };
        }

        if (!userOrg || !userOrg.organization_id) {
          console.warn('No organization found for user:', session.user.id);
          // Return zeros for users without organization
          return {
            totalProperties: 0,
            currentResidents: 0,
            occupancyRate: 0,
            activeIncidents: 0,
            openConcerns: 0,
            complianceScore: 100,
            monthlyRevenue: 0,
            pendingTasks: 0,
          };
        }

        const orgId = userOrg.organization_id;

        // Query 1: Total Properties
        const { count: propertiesCount, error: propertiesError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId);

        if (propertiesError) {
          console.error('Properties query error:', propertiesError);
        }

        // Query 2: Current Residents
        const { count: residentsCount, error: residentsError } = await supabase
          .from('residents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('status', 'active');

        if (residentsError) {
          console.error('Residents query error:', residentsError);
        }

        // Query 3: Properties with capacity data for occupancy calculation
        const { data: properties, error: capacityError } = await supabase
          .from('properties')
          .select('total_capacity, current_occupancy')
          .eq('organization_id', orgId);

        if (capacityError) {
          console.error('Capacity query error:', capacityError);
        }

        // Calculate occupancy rate with null safety
        const totalCapacity = properties?.reduce((sum, p) => sum + (p.total_capacity || 0), 0) || 0;
        const totalOccupied = properties?.reduce((sum, p) => sum + (p.current_occupancy || 0), 0) || 0;
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

        // Query 4: Active Incidents
        const { count: incidentsCount, error: incidentsError } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .in('status', ['reported', 'under_investigation', 'action_taken']);

        if (incidentsError) {
          console.error('Incidents query error:', incidentsError);
        }

        // Query 5: Open Concerns (high severity incidents)
        const { count: concernsCount } = await supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .in('severity', ['high', 'critical'])
          .neq('status', 'closed');

        // Query 6: Calculate compliance score based on completed assessments
        const { data: assessments } = await supabase
          .from('assessments')
          .select('status')
          .eq('organization_id', orgId);

        const totalAssessments = assessments?.length || 0;
        const completedAssessments = assessments?.filter(a => a.status === 'completed').length || 0;
        const complianceScore = totalAssessments > 0
          ? Math.round((completedAssessments / totalAssessments) * 100)
          : 100;

        // Query 7: Calculate monthly revenue from financial records
        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

        const { data: financialRecords } = await supabase
          .from('financial_records')
          .select('amount, transaction_type')
          .eq('organization_id', orgId)
          .eq('transaction_type', 'rent_payment')
          .gte('transaction_date', firstDayOfMonth.toISOString().split('T')[0]);

        const monthlyRevenue = financialRecords?.reduce((sum, record) => sum + Number(record.amount || 0), 0) || 0;

        // Query 8: Count pending tasks (maintenance requests + incident actions)
        const { count: maintenanceCount } = await supabase
          .from('maintenance_requests')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .in('status', ['pending', 'approved']);

        const pendingTasks = (maintenanceCount || 0) + (incidentsCount || 0);

        return {
          totalProperties: propertiesCount || 0,
          currentResidents: residentsCount || 0,
          occupancyRate,
          activeIncidents: incidentsCount || 0,
          openConcerns: concernsCount || 0,
          complianceScore,
          monthlyRevenue: Math.round(monthlyRevenue),
          pendingTasks,
        };
      } catch (error) {
        console.error('Dashboard metrics error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
