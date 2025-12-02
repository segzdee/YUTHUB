import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/organizations/current - Get current organization
router.get('/current', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: data });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// PATCH /api/organizations/:id - Update organization settings
router.patch('/:id', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;
    const updates = req.body;

    if (id !== organizationId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    delete updates.id;
    delete updates.created_at;
    delete updates.stripe_customer_id;
    delete updates.stripe_subscription_id;

    const { data, error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ organization: data });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

export default router;
