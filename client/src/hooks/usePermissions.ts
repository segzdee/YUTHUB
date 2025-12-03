import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { hasPermission, type Permission, type Role } from '@/config/permissions';
import { useAuth } from './useAuth';

interface UsePermissionsReturn {
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  role: Role | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isPlatformAdmin: boolean;
}

/**
 * Hook to check user permissions based on their role
 * Uses JWT claims and database user_organizations table
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isLoading: authLoading } = useAuth();

  // Fetch user's role from database
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's organization and role
      const { data, error } = await supabase
        .from('user_organizations')
        .select('role, organization_id, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const role = (roleData?.role as Role) || null;
  const isLoading = authLoading || roleLoading;

  // Memoize permission check functions
  const can = useMemo(
    () => (permission: Permission): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  const canAny = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!role) return false;
      return permissions.some(permission => hasPermission(role, permission));
    },
    [role]
  );

  const canAll = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!role) return false;
      return permissions.every(permission => hasPermission(role, permission));
    },
    [role]
  );

  const isAdmin = role === 'admin' || role === 'owner' || role === 'platform_admin';
  const isManager = role === 'manager' || isAdmin;
  const isPlatformAdmin = role === 'platform_admin';

  return {
    can,
    canAny,
    canAll,
    role,
    isLoading,
    isAdmin,
    isManager,
    isPlatformAdmin,
  };
}

/**
 * Hook variant that throws if permissions are not met
 * Useful for pages that require specific permissions
 */
export function useRequirePermission(permission: Permission): UsePermissionsReturn {
  const permissions = usePermissions();

  if (!permissions.isLoading && !permissions.can(permission)) {
    throw new Error(`Missing required permission: ${permission}`);
  }

  return permissions;
}

/**
 * Hook to check if user can manage another user based on roles
 */
export function useCanManageUser(targetRole: Role | null): boolean {
  const { role, isPlatformAdmin } = usePermissions();

  if (!role || !targetRole) return false;

  // Platform admin can manage anyone
  if (isPlatformAdmin) return true;

  // Can't manage platform admins unless you are one
  if (targetRole === 'platform_admin') return false;

  // Owner and Admin can manage all org users
  if (role === 'owner' || role === 'admin') return true;

  // Manager can manage staff and coordinators
  if (role === 'manager' && (targetRole === 'staff' || targetRole === 'coordinator')) {
    return true;
  }

  // Coordinator can manage staff only
  if (role === 'coordinator' && targetRole === 'staff') {
    return true;
  }

  // Staff cannot manage anyone (but can invite)
  if (role === 'staff') {
    return false;
  }

  return false;
}
