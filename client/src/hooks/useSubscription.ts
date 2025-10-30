import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface SubscriptionPlan {
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  max_residents: number;
  max_properties: number;
  features: Record<string, boolean>;
  sort_order: number;
}

export interface SubscriptionInfo {
  subscription_tier: string;
  subscription_status: string;
  billing_cycle: string;
  max_residents: number;
  max_properties: number;
  current_resident_count: number;
  current_property_count: number;
  features_enabled: Record<string, boolean>;
  subscription_start_date: string;
  subscription_end_date: string;
  trial_end_date: string;
  plan_name: string;
  price_monthly: number;
  price_annual: number;
}

export interface UsageInfo {
  residents: {
    current: number;
    max: number;
    percentage: number;
  };
  properties: {
    current: number;
    max: number;
    percentage: number;
  };
  tier: string;
  features: Record<string, boolean>;
}

export interface Invoice {
  invoice_number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  paid_at: string;
  invoice_pdf_url: string;
  created_at: string;
}

export function useSubscriptionPlans() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/billing/plans', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      return response.json();
    },
  });
}

export function useSubscription() {
  const { user } = useAuth();

  return useQuery<SubscriptionInfo>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/billing/subscription', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: !!user,
  });
}

export function useUsage() {
  const { user } = useAuth();

  return useQuery<UsageInfo>({
    queryKey: ['subscription-usage', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/billing/usage', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch usage');
      }
      return response.json();
    },
    enabled: !!user,
  });
}

export function useInvoices() {
  const { user } = useAuth();

  return useQuery<Invoice[]>({
    queryKey: ['invoices', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/billing/invoices', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return response.json();
    },
    enabled: !!user,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      planName: string;
      billingCycle: 'monthly' | 'annual';
      customerEmail: string;
      customerName: string;
    }) => {
      const response = await fetch('/api/billing/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      newPlanName: string;
      billingCycle?: 'monthly' | 'annual';
    }) => {
      const response = await fetch('/api/billing/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upgrade subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (immediately: boolean = false) => {
      const response = await fetch('/api/billing/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ immediately }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}

export function useFeatureAccess(featureName: string): boolean {
  const { data: subscription } = useSubscription();

  if (!subscription?.features_enabled) {
    return false;
  }

  return subscription.features_enabled[featureName] === true;
}

export function useTierAccess(minTier: 'starter' | 'professional' | 'enterprise'): boolean {
  const { data: subscription } = useSubscription();

  if (!subscription) {
    return false;
  }

  const tierLevels = {
    trial: 0,
    starter: 1,
    professional: 2,
    enterprise: 3,
  };

  const userTierLevel = tierLevels[subscription.subscription_tier as keyof typeof tierLevels] || 0;
  const requiredTierLevel = tierLevels[minTier];

  return userTierLevel >= requiredTierLevel;
}

export function useSubscriptionStatus(): {
  isActive: boolean;
  isTrial: boolean;
  isPastDue: boolean;
  isCancelled: boolean;
  daysUntilExpiry: number | null;
} {
  const { data: subscription } = useSubscription();

  if (!subscription) {
    return {
      isActive: false,
      isTrial: false,
      isPastDue: false,
      isCancelled: false,
      daysUntilExpiry: null,
    };
  }

  const isActive = subscription.subscription_status === 'active';
  const isTrial = subscription.subscription_tier === 'trial';
  const isPastDue = subscription.subscription_status === 'past_due';
  const isCancelled = subscription.subscription_status === 'cancelled';

  let daysUntilExpiry: number | null = null;
  if (isTrial && subscription.trial_end_date) {
    const trialEnd = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else if (subscription.subscription_end_date) {
    const subEnd = new Date(subscription.subscription_end_date);
    const now = new Date();
    const diffTime = subEnd.getTime() - now.getTime();
    daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    isActive,
    isTrial,
    isPastDue,
    isCancelled,
    daysUntilExpiry,
  };
}
