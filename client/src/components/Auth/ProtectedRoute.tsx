import PageLoader from '@/components/common/PageLoader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermissions?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermissions,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message='Verifying authentication...' />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  if (requiredRole) {
    // Convert to array if single role provided
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // Owner role has all permissions
    const effectiveRoles = rolesArray.includes('owner') ? rolesArray : ['owner', ...rolesArray];

    if (!effectiveRoles.includes(user?.role || '')) {
      return <Navigate to='/app/dashboard' replace />;
    }
  }

  if (
    requiredPermissions &&
    !requiredPermissions.every(permission =>
      user?.permissions?.includes(permission)
    )
  ) {
    return <Navigate to='/app/dashboard' replace />;
  }

  return <>{children}</>;
}
