import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/support-plans - List all support plans
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req;
    const { residentId, status } = req.query;

    let query = supabase
      .from('support_plans')
      .select('*, residents(id, first_name, last_name), support_plan_goals(id, status)')
      .eq('organization_id', organizationId);

    if (residentId) query = query.eq('resident_id', residentId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ plans: data || [] });
  } catch (error) {
    console.error('List support plans error:', error);
    res.status(500).json({ error: 'Failed to fetch support plans' });
  }
});

// GET /api/support-plans/:id - Get plan details with goals
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('support_plans')
      .select('*, residents(*), support_plan_goals(*)')
      .eq('id', id)
      .eq('organization_id', organizationId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Support plan not found' });
    }

    res.json({ plan: data });
  } catch (error) {
    console.error('Get support plan error:', error);
    res.status(500).json({ error: 'Failed to fetch support plan' });
  }
});

// POST /api/support-plans - Create support plan
router.post('/', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const planData = req.body;

    const { data, error } = await supabase
      .from('support_plans')
      .insert({
        ...planData,
        organization_id: organizationId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('team_activity_log').insert({
      organization_id: organizationId,
      user_id: userId,
      action: 'create',
      entity_type: 'support_plan',
      entity_id: data.id,
      description: `Created support plan: ${data.plan_name}`,
    });

    res.status(201).json({ plan: data });
  } catch (error) {
    console.error('Create support plan error:', error);
    res.status(500).json({ error: 'Failed to create support plan' });
  }
});

// PATCH /api/support-plans/:id - Update plan
router.patch('/:id', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.organization_id;

    const { data, error } = await supabase
      .from('support_plans')
      .update({...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ plan: data });
  } catch (error) {
    console.error('Update support plan error:', error);
    res.status(500).json({ error: 'Failed to update support plan' });
  }
});

// POST /api/support-plans/:id/goals - Add goal to plan
router.post('/:id/goals', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const goalData = req.body;

    const { data, error } = await supabase
      .from('support_plan_goals')
      .insert({
        ...goalData,
        support_plan_id: id,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ goal: data });
  } catch (error) {
    console.error('Add goal error:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// PATCH /api/support-plans/:id/goals/:goalId - Update goal progress
router.patch('/:id/goals/:goalId', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { goalId } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('support_plan_goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;

    res.json({ goal: data });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

export default router;
