import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';
import { success, error as apiError } from '../utils/apiResponse.js';

const router = express.Router();

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/dashboard/metrics - Dashboard KPIs with trends
router.get('/metrics', async (req, res) => {
  try {
    const { organizationId } = req;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel database queries for current period
    const [
      currentResidentsResult,
      previousResidentsResult,
      currentPropertiesResult,
      currentIncidentsResult,
      previousIncidentsResult,
      currentRevenueResult,
      previousRevenueResult,
      roomsResult
    ] = await Promise.all([
      // Current active residents
      supabase
        .from('residents')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .eq('is_deleted', false),

      // Previous period active residents (30 days ago)
      supabase
        .from('residents')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .eq('is_deleted', false)
        .lte('created_at', thirtyDaysAgo.toISOString()),

      // Current active properties
      supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .eq('is_deleted', false),

      // Current period incidents (last 30 days, open)
      supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'open')
        .gte('created_at', thirtyDaysAgo.toISOString()),

      // Previous period incidents (30-60 days ago, open)
      supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'open')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString()),

      // Current month revenue
      supabase
        .from('financial_records')
        .select('amount')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'income')
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0]),

      // Previous month revenue
      supabase
        .from('financial_records')
        .select('amount')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'income')
        .gte('transaction_date', startOfLastMonth.toISOString().split('T')[0])
        .lte('transaction_date', endOfLastMonth.toISOString().split('T')[0]),

      // Rooms for occupancy calculation
      supabase
        .from('room_allocations')
        .select('id, status')
        .eq('organization_id', organizationId)
        .in('status', ['occupied', 'vacant'])
    ]);

    // Calculate metrics
    const totalResidents = currentResidentsResult.count || 0;
    const previousResidents = previousResidentsResult.count || 0;

    const totalProperties = currentPropertiesResult.count || 0;

    const activeIncidents = currentIncidentsResult.count || 0;
    const previousIncidents = previousIncidentsResult.count || 0;

    const monthlyRevenue = currentRevenueResult.data?.reduce((sum, record) =>
      sum + (parseFloat(record.amount) || 0), 0) || 0;
    const previousRevenue = previousRevenueResult.data?.reduce((sum, record) =>
      sum + (parseFloat(record.amount) || 0), 0) || 0;

    // Calculate occupancy rate
    const totalRooms = roomsResult.data?.length || 0;
    const occupiedRooms = roomsResult.data?.filter(r => r.status === 'occupied').length || 0;
    const occupancyRate = totalRooms > 0
      ? parseFloat((occupiedRooms / totalRooms * 100).toFixed(1))
      : 0;

    // Calculate trend percentages
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100.0%' : '0.0%';
      const change = ((current - previous) / previous * 100).toFixed(1);
      return change >= 0 ? `+${change}%` : `${change}%`;
    };

    const trends = {
      residents: calculateTrend(totalResidents, previousResidents),
      incidents: calculateTrend(activeIncidents, previousIncidents),
      revenue: calculateTrend(monthlyRevenue, previousRevenue),
      occupancy: occupancyRate > 0 ? `${occupancyRate}%` : '0.0%'
    };

    return success(res, {
      totalResidents,
      totalProperties,
      occupancyRate,
      activeIncidents,
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      trends
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return apiError(res, 'Failed to fetch dashboard metrics', 500, error.message);
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
