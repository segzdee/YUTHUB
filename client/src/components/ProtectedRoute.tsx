import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'You do not have permission to access this resource',
}) => (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
    <div className="max-w-md text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-700 text-black">Access Denied</h1>
        <p className="text-lg font-400 text-gray-600">{message}</p>
      </div>
      <a
        href="/app/dashboard"
        className="inline-block px-6 py-3 bg-black text-white rounded-lg font-500 hover:bg-gray-800 transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  </div>
);

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
      <p className="text-gray-600 font-400">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return fallback || <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <AccessDenied message={`This page requires one of these roles: ${requiredRoles.join(', ')}`} />
    );
  }

  return <>{children}</>;
};

export const useHasRole = (roles: string[]): boolean => {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
};

export const useHasPermission = (permission: string): boolean => {
  const { user } = useAuth();
  if (!user) return false;

  const permissions = user.permissions || [];
  return permissions.includes(permission) || permissions.includes('*');
};

export const useOrganizationId = (): string | null => {
  const { user } = useAuth();
  return null;
};

export const withProtection = <P extends object>(
  Component: React.FC<P>,
  requiredRoles?: string[]
): React.FC<P> => {
  return (props: P) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};
