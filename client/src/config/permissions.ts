/**
 * Role-Based Access Control (RBAC) Permissions Configuration
 *
 * Defines all permissions and role hierarchies for the application.
 * Permissions follow the pattern: action:resource
 */

export type Permission =
  // Resident permissions
  | 'read:residents'
  | 'create:residents'
  | 'update:residents'
  | 'delete:residents'
  // Property permissions
  | 'read:properties'
  | 'create:properties'
  | 'update:properties'
  | 'delete:properties'
  // Notes permissions
  | 'create:notes'
  | 'read:notes'
  | 'update:notes'
  | 'delete:notes'
  // Support plan permissions
  | 'read:support-plans'
  | 'create:support-plans'
  | 'update:support-plans'
  | 'delete:support-plans'
  // Incident permissions
  | 'read:incidents'
  | 'create:incidents'
  | 'update:incidents'
  | 'delete:incidents'
  // Report permissions
  | 'read:reports'
  | 'create:reports'
  | 'export:reports'
  // Assessment permissions
  | 'read:assessments'
  | 'create:assessments'
  | 'update:assessments'
  // Financial permissions
  | 'read:financials'
  | 'create:financials'
  | 'update:financials'
  | 'manage:billing'
  // Team management
  | 'read:team'
  | 'invite:team'
  | 'manage:team'
  | 'update:roles'
  // Settings
  | 'read:settings'
  | 'manage:settings'
  // User management
  | 'read:users'
  | 'manage:users'
  | 'delete:users'
  // Platform administration
  | 'manage:organizations'
  | 'manage:subscriptions'
  | 'platform:admin'
  // Special wildcard permission
  | '*';

export type Role = 'staff' | 'coordinator' | 'manager' | 'admin' | 'platform_admin' | 'resident';

/**
 * Role hierarchy - defines which permissions each role has
 * Roles inherit permissions from lower roles in the hierarchy
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Staff - Basic access to view and create notes
  staff: [
    'read:residents',
    'read:properties',
    'create:notes',
    'read:notes',
    'read:support-plans',
    'read:incidents',
    'read:assessments',
    'read:team',
    'invite:team', // Staff can invite team members
  ],

  // Coordinator - Can manage residents and create support plans
  coordinator: [
    // Inherit all staff permissions
    'read:residents',
    'read:properties',
    'create:notes',
    'read:notes',
    'read:support-plans',
    'read:incidents',
    'read:assessments',
    'read:team',
    'invite:team',
    // Additional coordinator permissions
    'create:residents',
    'update:residents',
    'create:support-plans',
    'update:support-plans',
    'create:assessments',
    'update:assessments',
    'update:notes',
    'manage:team', // Coordinators can manage team
  ],

  // Manager - Can access reports and manage incidents
  manager: [
    // Inherit all coordinator permissions
    'read:residents',
    'read:properties',
    'create:notes',
    'read:notes',
    'read:support-plans',
    'read:incidents',
    'read:assessments',
    'read:team',
    'create:residents',
    'update:residents',
    'create:support-plans',
    'update:support-plans',
    'create:assessments',
    'update:assessments',
    'update:notes',
    // Additional manager permissions
    'read:reports',
    'create:reports',
    'export:reports',
    'create:incidents',
    'update:incidents',
    'manage:team',
    'invite:team',
    'read:financials',
    'create:financials',
    'update:financials',
    'create:properties',
    'update:properties',
  ],

  // Admin - Full organization access
  admin: [
    // Inherit all manager permissions
    'read:residents',
    'read:properties',
    'create:notes',
    'read:notes',
    'read:support-plans',
    'read:incidents',
    'read:assessments',
    'read:team',
    'create:residents',
    'update:residents',
    'create:support-plans',
    'update:support-plans',
    'create:assessments',
    'update:assessments',
    'update:notes',
    'read:reports',
    'create:reports',
    'export:reports',
    'create:incidents',
    'update:incidents',
    'manage:team',
    'invite:team',
    'read:financials',
    'create:financials',
    'update:financials',
    'create:properties',
    'update:properties',
    // Additional admin permissions
    'delete:residents',
    'delete:properties',
    'delete:notes',
    'delete:support-plans',
    'delete:incidents',
    'manage:settings',
    'manage:billing',
    'read:users',
    'manage:users',
    'update:roles',
    'read:settings',
  ],

  // Platform Admin - Full system access
  platform_admin: ['*'],

  // Resident - Limited self-access only
  resident: [
    'read:notes', // Own notes only
    'read:support-plans', // Own plans only
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];

  // Platform admin has wildcard access
  if (rolePermissions.includes('*')) {
    return true;
  }

  // Check for exact permission match
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role can perform an action on a resource
 */
export function canPerformAction(
  role: Role,
  action: string,
  resource: string
): boolean {
  const permission = `${action}:${resource}` as Permission;
  return hasPermission(role, permission);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    staff: 'Staff',
    coordinator: 'Coordinator',
    manager: 'Manager',
    admin: 'Administrator',
    platform_admin: 'Platform Administrator',
    resident: 'Resident',
  };

  return displayNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    staff: 'View residents, create notes, and invite team members',
    coordinator: 'Manage residents, support plans, and team members',
    manager: 'Access reports, manage team, handle incidents and finances',
    admin: 'Full organization access including settings and billing',
    platform_admin: 'Complete system administration across all organizations',
    resident: 'Limited access to own information only',
  };

  return descriptions[role] || '';
}

/**
 * Check if a role is higher than another in the hierarchy
 */
export function isHigherRole(role1: Role, role2: Role): boolean {
  const hierarchy: Role[] = ['resident', 'staff', 'coordinator', 'manager', 'admin', 'platform_admin'];
  const index1 = hierarchy.indexOf(role1);
  const index2 = hierarchy.indexOf(role2);

  return index1 > index2;
}

/**
 * Get available roles for assignment (excludes platform_admin and resident)
 */
export function getAssignableRoles(): Role[] {
  return ['staff', 'coordinator', 'manager', 'admin'];
}
