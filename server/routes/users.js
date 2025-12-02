import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { inviteUserSchema, acceptInviteSchema, updateUserRoleSchema } from '../validators/schemas.js';
import { success, created, notFound, error as apiError } from '../utils/apiResponse.js';
import { AuthorizationError, ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import crypto from 'crypto';

const router = express.Router();

const ROLE_HIERARCHY = {
  owner: 5,
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

router.get('/', authenticateUser, getUserOrganization, asyncHandler(async (req, res) => {
  const { organizationId } = req;

  const { data: userOrgs, error: userOrgsError } = await supabase
    .from('user_organizations')
    .select('user_id, role, status, created_at, last_active_at')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (userOrgsError) throw userOrgsError;

  const users = await Promise.all(
    userOrgs.map(async (userOrg) => {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userOrg.user_id);

      if (error || !user) return null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata?.firstName || user.user_metadata?.first_name,
        lastName: user.user_metadata?.lastName || user.user_metadata?.last_name,
        role: userOrg.role,
        status: userOrg.status,
        lastActiveAt: userOrg.last_active_at,
        joinedAt: userOrg.created_at,
      };
    })
  );

  return success(res, users.filter(Boolean));
}));

router.post('/invite', authenticateUser, getUserOrganization, requireRole(['owner', 'admin', 'platform_admin']), validateBody(inviteUserSchema), asyncHandler(async (req, res) => {
  const { organizationId, userId, userRole } = req;
  const { email, role, firstName, lastName } = req.body;

  if (ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[userRole] && userRole !== 'owner') {
    throw new AuthorizationError('You cannot invite users with a role equal to or higher than your own');
  }

  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const userExists = existingUser.users.find(u => u.email === email);

  if (userExists) {
    const { data: existingMember } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('user_id', userExists.id)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existingMember) {
      throw new ConflictError('User is already a member of this organization');
    }
  }

  const invitationToken = crypto.randomUUID();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      token: invitationToken,
      invited_by: userId,
      expires_at: expiryDate.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (inviteError) throw inviteError;

  const appUrl = process.env.VITE_APP_URL || 'http://localhost:5000';
  const acceptLink = `${appUrl}/invite/accept?token=${invitationToken}`;

  console.log(`Invitation link: ${acceptLink}`);

  await supabase.from('team_activity_log').insert({
    organization_id: organizationId,
    user_id: userId,
    action: 'invite',
    entity_type: 'user',
    entity_id: invitation.id,
    description: `Invited ${email} as ${role}`,
  });

  return created(res, {
    invitation: {
      id: invitation.id,
      email,
      role,
      status: 'pending',
      expiresAt: expiryDate.toISOString(),
      acceptLink
    }
  }, 'Invitation sent successfully');
}));

router.get('/invite/validate/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, organizations(id, display_name)')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (error) throw error;

  if (!invitation) {
    throw new NotFoundError('Invitation not found or already used');
  }

  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);

  if (now > expiresAt) {
    throw new ValidationError('Invitation has expired');
  }

  return success(res, {
    email: invitation.email,
    role: invitation.role,
    organizationName: invitation.organizations?.display_name,
    expiresAt: invitation.expires_at,
  });
}));

router.post('/invite/accept', validateBody(acceptInviteSchema), asyncHandler(async (req, res) => {
  const { token, password, firstName, lastName } = req.body;

  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();

  if (inviteError) throw inviteError;

  if (!invitation) {
    throw new NotFoundError('Invitation not found or already used');
  }

  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);

  if (now > expiresAt) {
    throw new ValidationError('Invitation has expired');
  }

  const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName,
      lastName,
      organization_id: invitation.organization_id,
    },
  });

  if (signUpError) throw signUpError;

  await supabase.from('user_organizations').insert({
    user_id: authData.user.id,
    organization_id: invitation.organization_id,
    role: invitation.role,
    status: 'active',
  });

  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  await supabase.from('team_activity_log').insert({
    organization_id: invitation.organization_id,
    user_id: authData.user.id,
    action: 'accept_invite',
    entity_type: 'user',
    entity_id: authData.user.id,
    description: `${firstName} ${lastName} accepted invitation and joined the organization`,
  });

  return created(res, {
    user: {
      id: authData.user.id,
      email: authData.user.email,
    }
  }, 'Account created successfully. You can now sign in.');
}));

router.patch('/:id/role', authenticateUser, getUserOrganization, requireRole(['owner', 'admin', 'platform_admin']), validateBody(updateUserRoleSchema), asyncHandler(async (req, res) => {
  const { organizationId, userId, userRole } = req;
  const { id } = req.params;
  const { role: newRole } = req.body;

  if (userId === id) {
    throw new ValidationError('You cannot change your own role');
  }

  if (ROLE_HIERARCHY[newRole] >= ROLE_HIERARCHY[userRole] && userRole !== 'owner') {
    throw new AuthorizationError('You cannot assign a role equal to or higher than your own');
  }

  const { data: targetUserOrg, error: fetchError } = await supabase
    .from('user_organizations')
    .select('role, user_id')
    .eq('user_id', id)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!targetUserOrg) throw new NotFoundError('User not found in this organization');

  if (ROLE_HIERARCHY[targetUserOrg.role] >= ROLE_HIERARCHY[userRole] && userRole !== 'owner') {
    throw new AuthorizationError('You cannot modify the role of someone with equal or higher privileges');
  }

  const { data: updatedUserOrg, error: updateError } = await supabase
    .from('user_organizations')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('user_id', id)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (updateError) throw updateError;

  await supabase.from('team_activity_log').insert({
    organization_id: organizationId,
    user_id: userId,
    action: 'update_role',
    entity_type: 'user',
    entity_id: id,
    description: `Changed user role from ${targetUserOrg.role} to ${newRole}`,
    metadata: { oldRole: targetUserOrg.role, newRole },
  });

  return success(res, {
    user: {
      id: targetUserOrg.user_id,
      role: newRole,
    }
  }, 'User role updated successfully');
}));

router.delete('/:id', authenticateUser, getUserOrganization, requireRole(['owner', 'admin']), asyncHandler(async (req, res) => {
  const { organizationId, userId } = req;
  const { id } = req.params;

  if (userId === id) {
    throw new ValidationError('You cannot remove yourself from the organization');
  }

  const { error } = await supabase
    .from('user_organizations')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('user_id', id)
    .eq('organization_id', organizationId);

  if (error) throw error;

  await supabase.from('team_activity_log').insert({
    organization_id: organizationId,
    user_id: userId,
    action: 'remove',
    entity_type: 'user',
    entity_id: id,
    description: 'Removed user from organization',
  });

  return success(res, null, 'User removed successfully');
}));

export default router;
