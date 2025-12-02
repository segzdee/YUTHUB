import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/users - List organization users
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('user_organizations')
      .select('*, user_id')
      .eq('organization_id', organizationId);

    if (error) throw error;

    const userIds = data.map(uo => uo.user_id);
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        const userOrg = data.find(uo => uo.user_id === userId);
        return {
          id: user?.id,
          email: user?.email,
          user_metadata: user?.user_metadata,
          role: userOrg?.role,
          status: userOrg?.status,
          joined_at: userOrg?.created_at,
        };
      })
    );

    res.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users/invite - Invite team member
router.post('/invite', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { email, role } = req.body;

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { organization_id: organizationId, role },
    });

    if (error) throw error;

    await supabase.from('user_organizations').insert({
      user_id: data.user.id,
      organization_id: organizationId,
      role: role || 'staff',
      status: 'invited',
    });

    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'invite',
      entity_type: 'user',
      description: `Invited user: ${email}`,
    });

    res.status(201).json({ user: data.user });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

// PATCH /api/users/:id - Update user
router.patch('/:id', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase.auth.admin.updateUserById(id, updates);

    if (error) throw error;

    res.json({ user: data.user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// PATCH /api/users/:id/role - Change user role
router.patch('/:id/role', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;
    const { role } = req.body;

    const { data, error } = await supabase
      .from('user_organizations')
      .update({ role })
      .eq('user_id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ userOrganization: data });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ error: 'Failed to change role' });
  }
});

// DELETE /api/users/:id - Deactivate user
router.delete('/:id', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('user_organizations')
      .update({ status: 'inactive' })
      .eq('user_id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

export default router;
