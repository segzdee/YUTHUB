import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/reports/occupancy - Occupancy report
router.get('/occupancy', async (req, res) => {
  try {
    const { organizationId } = req;
    const { startDate, endDate } = req.query;

    const { data, error } = await supabase
      .from('properties')
      .select('*, rooms(*)')
      .eq('organization_id', organizationId)
      .eq('is_deleted', false);

    if (error) throw error;

    const report = data.map(property => ({
      property_id: property.id,
      property_name: property.property_name,
      total_beds: property.total_beds,
      occupied_beds: property.occupied_beds,
      occupancy_rate: property.total_beds > 0 ? (property.occupied_beds / property.total_beds * 100).toFixed(2) : 0,
      rooms: property.rooms,
    }));

    res.json({ report });
  } catch (error) {
    console.error('Occupancy report error:', error);
    res.status(500).json({ error: 'Failed to generate occupancy report' });
  }
});

// GET /api/reports/outcomes - Outcomes report
router.get('/outcomes', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('residents')
      .select('*, support_plans(*, support_plan_goals(*))')
      .eq('organization_id', organizationId)
      .eq('is_deleted', false);

    if (error) throw error;

    res.json({ outcomes: data || [] });
  } catch (error) {
    console.error('Outcomes report error:', error);
    res.status(500).json({ error: 'Failed to generate outcomes report' });
  }
});

// GET /api/reports/incidents - Incidents summary
router.get('/incidents', async (req, res) => {
  try {
    const { organizationId } = req;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('incidents')
      .select('*')
      .eq('organization_id', organizationId);

    if (startDate) query = query.gte('incident_date', startDate);
    if (endDate) query = query.lte('incident_date', endDate);

    const { data, error } = await query;

    if (error) throw error;

    const summary = {
      total: data.length,
      by_severity: {
        low: data.filter(i => i.severity === 'low').length,
        medium: data.filter(i => i.severity === 'medium').length,
        high: data.filter(i => i.severity === 'high').length,
        critical: data.filter(i => i.severity === 'critical').length,
      },
      by_status: {
        reported: data.filter(i => i.status === 'reported').length,
        investigating: data.filter(i => i.status === 'investigating').length,
        resolved: data.filter(i => i.status === 'resolved').length,
        escalated: data.filter(i => i.status === 'escalated').length,
      },
    };

    res.json({ summary, incidents: data });
  } catch (error) {
    console.error('Incidents report error:', error);
    res.status(500).json({ error: 'Failed to generate incidents report' });
  }
});

// GET /api/reports/financials - Financial report
router.get('/financials', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('organization_id', organizationId)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    res.json({ financials: data || [] });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// POST /api/reports/generate - Generate custom report
router.post('/generate', async (req, res) => {
  try {
    const { organizationId } = req;
    const { reportType, parameters } = req.body;

    res.json({
      message: 'Custom report generation not yet implemented',
      reportType,
      parameters,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
