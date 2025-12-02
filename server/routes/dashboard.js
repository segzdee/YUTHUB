import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/dashboard/metrics - Dashboard KPIs
router.get('/metrics', async (req, res) => {
  try {
    const { organizationId } = req;

    const [residentsResult, propertiesResult, incidentsResult] = await Promise.all([
      supabase
        .from('residents')
        .select('id, status', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_deleted', false),

      supabase
        .from('properties')
        .select('id, total_beds, occupied_beds', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_deleted', false),

      supabase
        .from('incidents')
        .select('id, severity, status', { count: 'exact' })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const activeResidents = residentsResult.data?.filter(r => r.status === 'active').length || 0;
    const totalResidents = residentsResult.count || 0;

    const totalBeds = propertiesResult.data?.reduce((sum, p) => sum + (p.total_beds || 0), 0) || 0;
    const occupiedBeds = propertiesResult.data?.reduce((sum, p) => sum + (p.occupied_beds || 0), 0) || 0;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const totalIncidents = incidentsResult.count || 0;
    const criticalIncidents = incidentsResult.data?.filter(
      i => i.severity === 'critical' && i.status !== 'resolved'
    ).length || 0;

    res.json({
      residents: {
        active: activeResidents,
        total: totalResidents,
      },
      properties: {
        total: propertiesResult.count || 0,
        totalBeds,
        occupiedBeds,
        occupancyRate,
      },
      incidents: {
        total: totalIncidents,
        critical: criticalIncidents,
      },
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// GET /api/dashboard/activity - Recent activity feed
router.get('/activity', async (req, res) => {
  try {
    const { organizationId } = req;
    const limit = parseInt(req.query.limit) || 20;

    const { data: activities, error } = await supabase
      .from('team_activity_log')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ activities: activities || [] });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// GET /api/dashboard/alerts - Active alerts and notifications
router.get('/alerts', async (req, res) => {
  try {
    const { organizationId } = req;

    const [criticalIncidents, upcomingReviews, overdueActions] = await Promise.all([
      supabase
        .from('incidents')
        .select('id, title, severity, created_at, residents(first_name, last_name)')
        .eq('organization_id', organizationId)
        .eq('severity', 'critical')
        .in('status', ['reported', 'investigating'])
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('support_plans')
        .select('id, plan_name, review_date, residents(first_name, last_name)')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .gte('review_date', new Date().toISOString())
        .lte('review_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('review_date', { ascending: true })
        .limit(5),

      supabase
        .from('support_plan_goals')
        .select('id, goal_description, target_date, support_plans(id, plan_name, residents(first_name, last_name))')
        .eq('status', 'in_progress')
        .lt('target_date', new Date().toISOString())
        .order('target_date', { ascending: true })
        .limit(5)
    ]);

    res.json({
      criticalIncidents: criticalIncidents.data || [],
      upcomingReviews: upcomingReviews.data || [],
      overdueActions: overdueActions.data || [],
    });
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

export default router;
