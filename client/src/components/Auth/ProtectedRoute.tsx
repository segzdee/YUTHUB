import PageLoader from '@/components/common/PageLoader';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
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

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to='/app/dashboard' replace />;
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
