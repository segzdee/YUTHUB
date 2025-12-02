import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/compliance/safeguarding - List safeguarding concerns
router.get('/safeguarding', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('safeguarding_concerns')
      .select('*, residents(first_name, last_name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ concerns: data || [] });
  } catch (error) {
    console.error('List safeguarding error:', error);
    res.status(500).json({ error: 'Failed to fetch safeguarding concerns' });
  }
});

// POST /api/compliance/safeguarding - Create concern
router.post('/safeguarding', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const concernData = req.body;

    const { data, error } = await supabase
      .from('safeguarding_concerns')
      .insert({
        ...concernData,
        organization_id: organizationId,
        reported_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ concern: data });
  } catch (error) {
    console.error('Create concern error:', error);
    res.status(500).json({ error: 'Failed to create concern' });
  }
});

// PATCH /api/compliance/safeguarding/:id - Update concern
router.patch('/safeguarding/:id', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('safeguarding_concerns')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ concern: data });
  } catch (error) {
    console.error('Update concern error:', error);
    res.status(500).json({ error: 'Failed to update concern' });
  }
});

// GET /api/compliance/incidents - List incidents
router.get('/incidents', async (req, res) => {
  try {
    const { organizationId } = req;
    const { severity, status, residentId } = req.query;

    let query = supabase
      .from('incidents')
      .select('*, residents(first_name, last_name)')
      .eq('organization_id', organizationId);

    if (severity) query = query.eq('severity', severity);
    if (status) query = query.eq('status', status);
    if (residentId) query = query.eq('resident_id', residentId);

    const { data, error } = await query.order('incident_date', { ascending: false });

    if (error) throw error;

    res.json({ incidents: data || [] });
  } catch (error) {
    console.error('List incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// POST /api/compliance/incidents - Report incident
router.post('/incidents', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const incidentData = req.body;

    const { data, error } = await supabase
      .from('incidents')
      .insert({
        ...incidentData,
        organization_id: organizationId,
        reported_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ incident: data });
  } catch (error) {
    console.error('Report incident error:', error);
    res.status(500).json({ error: 'Failed to report incident' });
  }
});

// PATCH /api/compliance/incidents/:id - Update incident
router.patch('/incidents/:id', requireRole(['owner', 'admin', 'manager', 'staff']), async (req, res) => {
  try {
    const { organizationId } = req;
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ incident: data });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// POST /api/compliance/incidents/:id/escalate - Escalate incident
router.post('/incidents/:id/escalate', requireRole(['owner', 'admin', 'manager']), async (req, res) => {
  try {
    const { organizationId, userId } = req;
    const { id } = req.params;
    const { escalation_reason } = req.body;

    const { data, error } = await supabase
      .from('incidents')
      .update({
        status: 'escalated',
        escalated_at: new Date().toISOString(),
        escalated_by: userId,
        escalation_reason,
      })
      .eq('id', id)
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({ incident: data });
  } catch (error) {
    console.error('Escalate incident error:', error);
    res.status(500).json({ error: 'Failed to escalate incident' });
  }
});

export default router;
