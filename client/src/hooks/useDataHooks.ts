import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Helper to get user's organization ID
async function getUserOrganizationId(): Promise<string> {
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
    throw new Error('No organization found');
  }

  return userOrg.organization_id;
}

// RESIDENTS HOOKS
export function useResidents() {
  return useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          properties (
            id,
            name,
            address
          ),
          rooms (
            id,
            room_number
          ),
          staff_members!residents_assigned_staff_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useResident(id: string | number) {
  return useQuery({
    queryKey: ['residents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('residents')
        .select(`
          *,
          properties (
            id,
            name,
            address
          ),
          rooms (
            id,
            room_number
          ),
          staff_members!residents_assigned_staff_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// PROPERTIES HOOKS
export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          staff_members!properties_property_manager_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProperty(id: string | number) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          staff_members!properties_property_manager_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          rooms (
            id,
            room_number,
            capacity,
            current_occupancy
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// INCIDENTS HOOKS
export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          residents (
            id,
            first_name,
            last_name
          ),
          properties (
            id,
            name
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// SAFEGUARDING CONCERNS HOOKS
export function useSafeguardingConcerns() {
  return useQuery({
    queryKey: ['safeguarding-concerns'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('safeguarding_concerns')
        .select(`
          *,
          residents (
            id,
            first_name,
            last_name
          ),
          properties (
            id,
            name
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// SUPPORT PLANS HOOKS
export function useSupportPlans() {
  return useQuery({
    queryKey: ['support-plans'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('support_plans')
        .select(`
          *,
          residents (
            id,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupportPlan(id: string | number) {
  return useQuery({
    queryKey: ['support-plans', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_plans')
        .select(`
          *,
          residents (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// PROGRESS TRACKING HOOKS
export function useProgressTracking(residentId?: string | number) {
  return useQuery({
    queryKey: residentId ? ['progress-tracking', residentId] : ['progress-tracking'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      let query = supabase
        .from('progress_tracking')
        .select(`
          *,
          residents (
            id,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', orgId);

      if (residentId) {
        query = query.eq('resident_id', residentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// BILLING / SUBSCRIPTION HOOKS
export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const orgId = await getUserOrganizationId();

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select(`
          *,
          subscription_plans (
            id,
            name,
            tier,
            price_monthly,
            price_annual,
            max_residents,
            max_properties,
            max_staff,
            features
          )
        `)
        .eq('id', orgId)
        .single();

      if (orgError) throw orgError;

      // Get usage metrics
      const { count: residentsCount } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'active');

      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);

      return {
        ...org,
        plan: org.subscription_plans,
        usage: {
          residents: residentsCount || 0,
          properties: propertiesCount || 0,
        },
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// MUTATION HOOKS

export function useCreateResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resident: any) => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('residents')
        .insert([{ ...resident, organization_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (property: any) => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('properties')
        .insert([{ ...property, organization_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: any) => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('incidents')
        .insert([{ ...incident, organization_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activity'] });
    },
  });
}

export function useCreateSupportPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: any) => {
      const orgId = await getUserOrganizationId();

      const { data, error } = await supabase
        .from('support_plans')
        .insert([{ ...plan, organization_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-plans'] });
    },
  });
}

export function useUpdateResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('residents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['residents', variables.id] });
    },
  });
}

export function useDeleteResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
