import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { AuditLogger } from './authSecurity';

// Define role hierarchy and permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor',
  HOUSING_OFFICER: 'housing_officer',
  SUPPORT_COORDINATOR: 'support_coordinator',
  FINANCE_OFFICER: 'finance_officer',
  SAFEGUARDING_OFFICER: 'safeguarding_officer',
  MAINTENANCE_STAFF: 'maintenance_staff',
  STAFF: 'staff',
  READONLY: 'readonly',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Define resource permissions
export const PERMISSIONS = {
  // Property management
  PROPERTIES_READ: 'properties:read',
  PROPERTIES_WRITE: 'properties:write',
  PROPERTIES_DELETE: 'properties:delete',

  // Resident management
  RESIDENTS_READ: 'residents:read',
  RESIDENTS_WRITE: 'residents:write',
  RESIDENTS_DELETE: 'residents:delete',
  RESIDENTS_SENSITIVE: 'residents:sensitive', // Access to sensitive personal data

  // Financial data
  FINANCIAL_READ: 'financial:read',
  FINANCIAL_WRITE: 'financial:write',
  FINANCIAL_DELETE: 'financial:delete',
  FINANCIAL_REPORTS: 'financial:reports',

  // Support services
  SUPPORT_READ: 'support:read',
  SUPPORT_WRITE: 'support:write',
  SUPPORT_DELETE: 'support:delete',

  // Safeguarding
  SAFEGUARDING_READ: 'safeguarding:read',
  SAFEGUARDING_WRITE: 'safeguarding:write',
  SAFEGUARDING_DELETE: 'safeguarding:delete',

  // Incidents
  INCIDENTS_READ: 'incidents:read',
  INCIDENTS_WRITE: 'incidents:write',
  INCIDENTS_DELETE: 'incidents:delete',

  // Maintenance
  MAINTENANCE_READ: 'maintenance:read',
  MAINTENANCE_WRITE: 'maintenance:write',
  MAINTENANCE_DELETE: 'maintenance:delete',

  // Reports and analytics
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',
  ANALYTICS_READ: 'analytics:read',

  // User management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // System administration
  SYSTEM_READ: 'system:read',
  SYSTEM_WRITE: 'system:write',
  AUDIT_READ: 'audit:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Full access to everything
    ...Object.values(PERMISSIONS),
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.PROPERTIES_WRITE,
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_WRITE,
    PERMISSIONS.RESIDENTS_SENSITIVE,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.FINANCIAL_WRITE,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_WRITE,
    PERMISSIONS.SAFEGUARDING_READ,
    PERMISSIONS.SAFEGUARDING_WRITE,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_WRITE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.AUDIT_READ,
  ],

  [ROLES.SUPERVISOR]: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.PROPERTIES_WRITE,
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_WRITE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_WRITE,
    PERMISSIONS.SAFEGUARDING_READ,
    PERMISSIONS.SAFEGUARDING_WRITE,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_WRITE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.USERS_READ,
  ],

  [ROLES.HOUSING_OFFICER]: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.PROPERTIES_WRITE,
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_WRITE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.REPORTS_READ,
    // NOTE: No financial access
  ],

  [ROLES.SUPPORT_COORDINATOR]: [
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_WRITE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_WRITE,
    PERMISSIONS.SAFEGUARDING_READ,
    PERMISSIONS.SAFEGUARDING_WRITE,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    // NOTE: No property modification access
  ],

  [ROLES.FINANCE_OFFICER]: [
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.FINANCIAL_WRITE,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.RESIDENTS_READ, // Need to link financial records to residents
    PERMISSIONS.PROPERTIES_READ, // Need to link financial records to properties
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ROLES.SAFEGUARDING_OFFICER]: [
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_SENSITIVE,
    PERMISSIONS.SAFEGUARDING_READ,
    PERMISSIONS.SAFEGUARDING_WRITE,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_WRITE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ROLES.MAINTENANCE_STAFF]: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.RESIDENTS_READ, // Basic info only
  ],

  [ROLES.STAFF]: [
    // General staff access - comprehensive permissions for daily operations
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.PROPERTIES_WRITE,
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.RESIDENTS_WRITE,
    PERMISSIONS.SUPPORT_READ,
    PERMISSIONS.SUPPORT_WRITE,
    PERMISSIONS.INCIDENTS_READ,
    PERMISSIONS.INCIDENTS_WRITE,
    PERMISSIONS.MAINTENANCE_READ,
    PERMISSIONS.MAINTENANCE_WRITE,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ROLES.READONLY]: [
    PERMISSIONS.PROPERTIES_READ,
    PERMISSIONS.RESIDENTS_READ,
    PERMISSIONS.REPORTS_READ,
  ],
};

// Permission checking utilities
export class PermissionChecker {
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
  }

  static hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  static hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(userRole, permission)
    );
  }

  static canAccessResource(
    userRole: Role,
    resource: string,
    action: 'read' | 'write' | 'delete'
  ): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(userRole, permission);
  }
}

// Middleware factory for permission checking
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Invalid user session' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userRole = user.role as Role;

      if (!PermissionChecker.hasPermission(userRole, permission)) {
        // Log unauthorized access attempt
        await AuditLogger.logAuthAttempt(userId, false, {
          action: 'UNAUTHORIZED_ACCESS',
          resource: permission,
          role: userRole,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(403).json({
          message: 'Insufficient permissions',
          required: permission,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

// Middleware factory for role checking
export function requireRole(requiredRole: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Invalid user session' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userRole = user.role as Role;

      // Check if user has required role or higher
      const roleHierarchy = [
        ROLES.READONLY,
        ROLES.STAFF,
        ROLES.MAINTENANCE_STAFF,
        ROLES.HOUSING_OFFICER,
        ROLES.SUPPORT_COORDINATOR,
        ROLES.FINANCE_OFFICER,
        ROLES.SAFEGUARDING_OFFICER,
        ROLES.SUPERVISOR,
        ROLES.MANAGER,
        ROLES.ADMIN,
      ];

      const userRoleIndex = roleHierarchy.indexOf(userRole);
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

      if (userRoleIndex < requiredRoleIndex) {
        // Log unauthorized access attempt
        await AuditLogger.logAuthAttempt(userId, false, {
          action: 'UNAUTHORIZED_ACCESS',
          requiredRole,
          userRole,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(403).json({
          message: 'Insufficient role level',
          required: requiredRole,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

// Resource-specific access control
export function requireResourceAccess(
  resource: string,
  action: 'read' | 'write' | 'delete'
) {
  return requirePermission(`${resource}:${action}` as Permission);
}

// Data filtering middleware based on role
export function filterDataByRole(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const originalJson = res.json;

  res.json = function (data: any) {
    const userId = (req.user as any)?.claims?.sub;

    if (userId && data) {
      // Apply role-based data filtering
      const filteredData = applyRoleBasedFiltering(data, req.user);
      return originalJson.call(this, filteredData);
    }

    return originalJson.call(this, data);
  };

  next();
}

// Apply role-based data filtering
function applyRoleBasedFiltering(data: any, user: any): any {
  if (!user || !user.role) return data;

  const userRole = user.role as Role;

  // Filter sensitive resident data for non-safeguarding roles
  if (Array.isArray(data) && data.length > 0 && data[0].firstName) {
    // This is resident data
    if (
      !PermissionChecker.hasPermission(
        userRole,
        PERMISSIONS.RESIDENTS_SENSITIVE
      )
    ) {
      return data.map((resident: any) => ({
        ...resident,
        medicalInfo: undefined,
        emergencyContact: undefined,
        socialWorkerContact: undefined,
        previousAddresses: undefined,
      }));
    }
  }

  // Filter financial data for non-financial roles
  if (Array.isArray(data) && data.length > 0 && data[0].amount) {
    // This is financial data
    if (
      !PermissionChecker.hasPermission(userRole, PERMISSIONS.FINANCIAL_READ)
    ) {
      return [];
    }
  }

  return data;
}
