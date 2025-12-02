import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ResidentData {
  personalInfo?: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender?: string;
    email?: string;
    phone?: string;
    national_insurance?: string;
  };
  housingDetails?: {
    property_id?: string;
    room_id?: string;
    admission_date?: string;
    expected_move_on_date?: string;
    key_worker_id?: string;
    referral_source?: string;
  };
  supportNeeds?: {
    support_level?: string;
    support_hours_per_week?: number;
    medical_info?: string;
    allergies?: string;
    dietary_requirements?: string;
    mental_health_needs?: string;
    substance_misuse?: string;
    risk_assessment?: string;
    create_support_plan?: boolean;
    support_plan_name?: string;
  };
  emergencyContacts?: {
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    emergency_contact_address?: string;
    next_of_kin_name?: string;
    next_of_kin_phone?: string;
    next_of_kin_relationship?: string;
  };
  [key: string]: any;
}

interface ListResidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  propertyId?: string;
  keyWorkerId?: string;
}

interface ResidentsResponse {
  success: boolean;
  data: any[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const createResident = async (residentData: ResidentData): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const apiUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5000'}/api/residents`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(residentData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create resident: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
};

const updateResident = async ({ id, data }: { id: string; data: Partial<ResidentData> }): Promise<any> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const apiUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5000'}/api/residents/${id}`;

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update resident: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
};

const fetchResidents = async (params: ListResidentsParams): Promise<ResidentsResponse> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.propertyId) queryParams.append('propertyId', params.propertyId);
  if (params.keyWorkerId) queryParams.append('keyWorkerId', params.keyWorkerId);

  const apiUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5000'}/api/residents?${queryParams}`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch residents: ${response.statusText}`);
  }

  return await response.json();
};

export function useCreateResident() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResident,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Resident ${data.first_name} ${data.last_name} has been created successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });

      navigate(`/dashboard/residents/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create resident. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateResident() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateResident,
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Resident ${data.first_name} ${data.last_name} has been updated successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ['residents'] });
      queryClient.invalidateQueries({ queryKey: ['resident', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update resident. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useResidents(params: ListResidentsParams = {}) {
  return useQuery<ResidentsResponse, Error>({
    queryKey: ['residents', params],
    queryFn: () => fetchResidents(params),
    staleTime: 30000,
    retry: 2,
  });
}
