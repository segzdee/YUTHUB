import { supabase } from '../config/supabase.js';

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'Authentication failed' });
  }
}

export async function getUserOrganization(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
    }

    const { data: userOrg, error } = await supabase
      .from('user_organizations')
      .select('organization_id, role, status')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    if (error || !userOrg) {
      return res.status(403).json({ error: 'Forbidden', message: 'No active organization found' });
    }

    req.organizationId = userOrg.organization_id;
    req.userRole = userOrg.role;
    next();
  } catch (error) {
    console.error('Organization lookup error:', error);
    return res.status(500).json({ error: 'Internal server error', message: 'Failed to get organization' });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ error: 'Forbidden', message: 'Role not found' });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
