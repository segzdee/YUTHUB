import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import {
  emitIncidentEscalated,
  emitSupportPlanReviewDue,
  emitDocumentExpiring,
  emitMetricsRefresh,
} from '../websocket.js';

/**
 * Initialize all scheduled background jobs
 */
export function initializeScheduledJobs() {
  console.log('Initializing scheduled background jobs...');

  // Daily jobs at 9:00 AM
  cron.schedule('0 9 * * *', checkOverdueSupportPlanReviews, {
    timezone: 'Europe/London',
  });

  cron.schedule('0 9 * * *', checkExpiringComplianceDocuments, {
    timezone: 'Europe/London',
  });

  // Hourly jobs
  cron.schedule('0 * * * *', autoEscalateUnacknowledgedIncidents);

  cron.schedule('30 * * * *', refreshDashboardMetrics);

  // Weekly jobs on Monday at 6:00 AM
  cron.schedule('0 6 * * 1', generateWeeklyUsageSnapshots, {
    timezone: 'Europe/London',
  });

  // Cleanup old audit logs monthly
  cron.schedule('0 0 1 * *', cleanupOldAuditLogs, {
    timezone: 'Europe/London',
  });

  console.log('Scheduled jobs initialized successfully');
}

/**
 * DAILY: Check for overdue support plan reviews
 */
async function checkOverdueSupportPlanReviews() {
  console.log('[CRON] Checking overdue support plan reviews...');

  try {
    const today = new Date().toISOString().split('T')[0];

    // Get support plans that are overdue for review
    const { data: overduePlans, error } = await supabase
      .from('support_plans')
      .select('*, residents(first_name, last_name), organizations(id)')
      .eq('status', 'active')
      .lt('review_date', today);

    if (error) throw error;

    console.log(`Found ${overduePlans?.length || 0} overdue support plans`);

    // Emit alerts for each overdue plan
    for (const plan of overduePlans || []) {
      emitSupportPlanReviewDue(plan.organization_id, plan);

      // Log activity
      await supabase.from('team_activity_log').insert({
        organization_id: plan.organization_id,
        user_id: '00000000-0000-0000-0000-000000000000',
        action: 'review_overdue',
        entity_type: 'support_plan',
        entity_id: plan.id,
        description: `Support plan review overdue for ${plan.residents?.first_name} ${plan.residents?.last_name}`,
      });
    }

    console.log('[CRON] Support plan review check complete');
  } catch (error) {
    console.error('[CRON] Error checking overdue reviews:', error);
  }
}

/**
 * DAILY: Check for expiring compliance documents
 */
async function checkExpiringComplianceDocuments() {
  console.log('[CRON] Checking expiring compliance documents...');

  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiryDate = thirtyDaysFromNow.toISOString().split('T')[0];

    // TODO: Query compliance documents table
    // For now, this is a placeholder
    console.log(`Checking for documents expiring before ${expiryDate}`);

    // Example query (when compliance_documents table exists):
    // const { data: expiringDocs } = await supabase
    //   .from('compliance_documents')
    //   .select('*, organizations(id)')
    //   .lt('expiry_date', expiryDate)
    //   .eq('status', 'active');

    console.log('[CRON] Compliance document check complete');
  } catch (error) {
    console.error('[CRON] Error checking expiring documents:', error);
  }
}

/**
 * HOURLY: Auto-escalate unacknowledged high-priority incidents
 */
async function autoEscalateUnacknowledgedIncidents() {
  console.log('[CRON] Auto-escalating unacknowledged incidents...');

  try {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    // Find critical/high incidents that haven't been acknowledged in 2 hours
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*, organizations(id)')
      .in('severity', ['critical', 'high'])
      .eq('status', 'reported')
      .lt('created_at', twoHoursAgo.toISOString());

    if (error) throw error;

    console.log(`Found ${incidents?.length || 0} incidents to escalate`);

    for (const incident of incidents || []) {
      // Update incident status
      const { error: updateError } = await supabase
        .from('incidents')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString(),
          escalation_reason: 'Auto-escalated: No acknowledgment within 2 hours',
        })
        .eq('id', incident.id);

      if (!updateError) {
        // Emit escalation event
        emitIncidentEscalated(incident.organization_id, incident);

        // Log activity
        await supabase.from('team_activity_log').insert({
          organization_id: incident.organization_id,
          user_id: '00000000-0000-0000-0000-000000000000',
          action: 'auto_escalate',
          entity_type: 'incident',
          entity_id: incident.id,
          description: `Incident auto-escalated: ${incident.title}`,
        });
      }
    }

    console.log('[CRON] Auto-escalation complete');
  } catch (error) {
    console.error('[CRON] Error auto-escalating incidents:', error);
  }
}

/**
 * HOURLY: Refresh dashboard metrics for all organizations
 */
async function refreshDashboardMetrics() {
  console.log('[CRON] Refreshing dashboard metrics...');

  try {
    // Get all active organizations
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('status', 'active');

    if (error) throw error;

    // Emit metrics refresh event for each organization
    for (const org of organizations || []) {
      emitMetricsRefresh(org.id);
    }

    console.log(`[CRON] Refreshed metrics for ${organizations?.length || 0} organizations`);
  } catch (error) {
    console.error('[CRON] Error refreshing metrics:', error);
  }
}

/**
 * WEEKLY: Generate usage snapshots for billing
 */
async function generateWeeklyUsageSnapshots() {
  console.log('[CRON] Generating weekly usage snapshots...');

  try {
    // Get all active organizations
    const { data: organizations, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('status', 'active');

    if (error) throw error;

    for (const org of organizations || []) {
      // Count resources for this organization
      const [residents, properties, staff] = await Promise.all([
        supabase
          .from('residents')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('is_deleted', false),
        supabase
          .from('properties')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('is_deleted', false),
        supabase
          .from('user_organizations')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('status', 'active'),
      ]);

      // TODO: Store usage snapshot in usage_snapshots table
      console.log(`Org ${org.id}: ${residents.count} residents, ${properties.count} properties, ${staff.count} staff`);

      // Log activity
      await supabase.from('team_activity_log').insert({
        organization_id: org.id,
        user_id: '00000000-0000-0000-0000-000000000000',
        action: 'usage_snapshot',
        entity_type: 'billing',
        description: `Weekly usage: ${residents.count} residents, ${properties.count} properties, ${staff.count} staff`,
      });
    }

    console.log('[CRON] Usage snapshots generated');
  } catch (error) {
    console.error('[CRON] Error generating usage snapshots:', error);
  }
}

/**
 * MONTHLY: Cleanup old audit logs (keep last 12 months)
 */
async function cleanupOldAuditLogs() {
  console.log('[CRON] Cleaning up old audit logs...');

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', twelveMonthsAgo.toISOString());

    if (error) throw error;

    console.log('[CRON] Old audit logs cleaned up');
  } catch (error) {
    console.error('[CRON] Error cleaning up audit logs:', error);
  }
}
