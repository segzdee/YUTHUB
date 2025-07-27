import { incidents, maintenanceRequests } from '@shared/schema';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import { db } from '../db';
import { backupManager } from '../services/backupManager';
import { storage } from '../storage';
import { DataIntegrityChecker } from '../utils/dataIntegrity';
import { WebSocketManager } from '../websocket';

// Background job scheduler
class BackgroundJobScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Starting background job scheduler...');

    // Schedule maintenance notifications check every 15 minutes
    this.scheduleJob(
      'maintenanceNotifications',
      15 * 60 * 1000,
      this.checkMaintenanceNotifications
    );

    // Schedule incident escalation check every 5 minutes
    this.scheduleJob(
      'incidentEscalation',
      5 * 60 * 1000,
      this.checkIncidentEscalation
    );

    // Schedule daily report generation at 2 AM
    this.scheduleDailyJob('dailyReports', 2, 0, this.generateDailyReports);

    // Schedule session cleanup every hour
    this.scheduleJob(
      'sessionCleanup',
      60 * 60 * 1000,
      this.cleanupExpiredSessions
    );

    // Schedule metric aggregation every 30 minutes
    this.scheduleJob(
      'metricAggregation',
      30 * 60 * 1000,
      this.aggregateMetrics
    );

    // Schedule data backup every 6 hours
    this.scheduleJob('dataBackup', 6 * 60 * 60 * 1000, this.performDataBackup);

    // Schedule data integrity check every 2 hours
    this.scheduleJob(
      'dataIntegrityCheck',
      2 * 60 * 60 * 1000,
      this.performDataIntegrityCheck
    );
  }

  stop(): void {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    console.log('Background job scheduler stopped');
  }

  private scheduleJob(
    name: string,
    interval: number,
    job: () => Promise<void>
  ): void {
    const intervalId = setInterval(async () => {
      try {
        console.log(`Running background job: ${name}`);
        await job();
        console.log(`Completed background job: ${name}`);
      } catch (error) {
        console.error(`Error in background job ${name}:`, error);
      }
    }, interval);

    this.intervals.set(name, intervalId);
    console.log(`Scheduled job: ${name} (every ${interval}ms)`);
  }

  private scheduleDailyJob(
    name: string,
    hour: number,
    minute: number,
    job: () => Promise<void>
  ): void {
    const scheduleNextRun = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(hour, minute, 0, 0);

      // If target time has passed today, schedule for tomorrow
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1);
      }

      const timeToWait = targetTime.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          console.log(`Running daily job: ${name}`);
          await job();
          console.log(`Completed daily job: ${name}`);
        } catch (error) {
          console.error(`Error in daily job ${name}:`, error);
        }

        // Schedule next run
        scheduleNextRun();
      }, timeToWait);
    };

    scheduleNextRun();
    console.log(`Scheduled daily job: ${name} at ${hour}:${minute}`);
  }

  // Check for maintenance requests requiring notifications
  private checkMaintenanceNotifications = async (): Promise<void> => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find overdue maintenance requests
    const overdueRequests = await db
      .select()
      .from(maintenanceRequests)
      .where(
        and(
          eq(maintenanceRequests.status, 'open'),
          lt(maintenanceRequests.createdAt, oneDayAgo)
        )
      );

    // Find critical maintenance requests older than 3 days
    const criticalOverdue = await db
      .select()
      .from(maintenanceRequests)
      .where(
        and(
          eq(maintenanceRequests.priority, 'urgent'),
          eq(maintenanceRequests.status, 'open'),
          lt(maintenanceRequests.createdAt, threeDaysAgo)
        )
      );

    // Send notifications for overdue requests
    for (const request of overdueRequests) {
      await this.sendMaintenanceNotification(request, 'overdue');
    }

    // Send escalation notifications for critical overdue requests
    for (const request of criticalOverdue) {
      await this.sendMaintenanceNotification(request, 'critical_overdue');
    }
  };

  // Check for incident escalation
  private checkIncidentEscalation = async (): Promise<void> => {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find high severity incidents that haven't been resolved
    const highSeverityIncidents = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.severity, 'high'),
          eq(incidents.status, 'open'),
          lt(incidents.createdAt, twoHoursAgo)
        )
      );

    // Find critical incidents older than 24 hours
    const criticalIncidents = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.severity, 'critical'),
          eq(incidents.status, 'open'),
          lt(incidents.createdAt, twentyFourHoursAgo)
        )
      );

    // Send escalation notifications
    for (const incident of highSeverityIncidents) {
      await this.sendIncidentEscalation(incident, 'high_severity_overdue');
    }

    for (const incident of criticalIncidents) {
      await this.sendIncidentEscalation(incident, 'critical_overdue');
    }
  };

  // Generate daily reports
  private generateDailyReports = async (): Promise<void> => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get daily metrics
    const metrics = await storage.getDashboardMetrics();

    // Get new incidents from yesterday
    const newIncidents = await db
      .select()
      .from(incidents)
      .where(
        and(gt(incidents.createdAt, yesterday), lt(incidents.createdAt, today))
      );

    // Get resolved incidents from yesterday
    const resolvedIncidents = await db
      .select()
      .from(incidents)
      .where(
        and(
          gt(incidents.resolvedAt, yesterday),
          lt(incidents.resolvedAt, today)
        )
      );

    // Generate daily summary
    const dailySummary = {
      date: yesterday.toISOString().split('T')[0],
      metrics,
      incidents: {
        new: newIncidents.length,
        resolved: resolvedIncidents.length,
        breakdown: this.categorizeIncidents(newIncidents),
      },
    };

    // Store daily summary (you might want to save this to a reports table)
    console.log('Daily Summary Generated:', dailySummary);

    // Send summary to administrators
    await this.sendDailySummary(dailySummary);
  };

  // Clean up expired sessions
  private cleanupExpiredSessions = async (): Promise<void> => {
    try {
      const result = await db.execute(
        sql`DELETE FROM sessions WHERE expire < NOW()`
      );
      console.log(
        `Cleaned up expired sessions: ${result.rowCount || 0} sessions removed`
      );
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  };

  // Aggregate metrics for performance
  private aggregateMetrics = async (): Promise<void> => {
    // This would typically update aggregated metrics tables
    // For now, we'll just log that metrics are being aggregated
    const metrics = await storage.getDashboardMetrics();
    console.log('Metrics aggregated:', metrics);
  };

  // Enhanced backup job
  private performDataBackup = async (): Promise<void> => {
    try {
      console.log('🔄 Enhanced backup initiated at:', new Date().toISOString());

      // Create comprehensive backup
      const result = await backupManager.createBackup('full');

      console.log('✅ Enhanced backup completed:', result);

      // Clean up old backups
      await backupManager.cleanupOldBackups();
    } catch (error) {
      console.error('❌ Enhanced backup failed:', error);

      // Send alert to administrators
      console.error('🚨 ALERT: Enhanced backup failed - notify administrators');
    }
  };

  // Perform data integrity check
  private performDataIntegrityCheck = async (): Promise<void> => {
    try {
      console.log(
        'Data integrity check initiated at:',
        new Date().toISOString()
      );

      const integrityResult =
        await DataIntegrityChecker.runFullIntegrityCheck();

      // Check for critical issues
      const hasCriticalIssues =
        integrityResult.orphanedRecords.orphanedResidents > 0 ||
        integrityResult.orphanedRecords.orphanedIncidents > 0 ||
        integrityResult.dataConsistency.dateInconsistencies > 0;

      if (hasCriticalIssues) {
        console.warn('Data integrity issues detected:', integrityResult);

        // Send alert to administrators
        // Note: In a real implementation, you would use a proper notification system
        console.warn(
          'ALERT: Data integrity issues detected - notify administrators'
        );
        console.warn('Details:', integrityResult);
      } else {
        console.log('Data integrity check passed:', integrityResult);
      }
    } catch (error) {
      console.error('Data integrity check failed:', error);
    }
  };

  // Send maintenance notification
  private sendMaintenanceNotification = async (
    request: any,
    type: string
  ): Promise<void> => {
    const wsManager = WebSocketManager.getInstance();

    const notification = {
      type: 'maintenance_notification',
      data: {
        requestId: request.id,
        title: request.title,
        priority: request.priority,
        notificationType: type,
        message: this.getMaintenanceMessage(request, type),
        timestamp: new Date().toISOString(),
      },
    };

    // Broadcast to facility managers and maintenance staff
    wsManager.broadcastToRoles(notification, [
      'admin',
      'manager',
      'maintenance_staff',
    ]);
  };

  // Send incident escalation
  private sendIncidentEscalation = async (
    incident: any,
    type: string
  ): Promise<void> => {
    const wsManager = WebSocketManager.getInstance();

    const escalation = {
      type: 'incident_escalation',
      data: {
        incidentId: incident.id,
        title: incident.title,
        severity: incident.severity,
        escalationType: type,
        message: this.getEscalationMessage(incident, type),
        timestamp: new Date().toISOString(),
      },
    };

    // Broadcast to management and safeguarding officers
    wsManager.broadcastToRoles(escalation, [
      'admin',
      'manager',
      'safeguarding_officer',
    ]);
  };

  // Send daily summary
  private sendDailySummary = async (summary: any): Promise<void> => {
    const wsManager = WebSocketManager.getInstance();

    const summaryNotification = {
      type: 'daily_summary',
      data: {
        summary,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to administrators
    wsManager.broadcastToRoles(summaryNotification, ['admin', 'manager']);
  };

  // Helper methods
  private getMaintenanceMessage(request: any, type: string): string {
    switch (type) {
      case 'overdue':
        return `Maintenance request "${request.title}" is overdue and requires attention.`;
      case 'critical_overdue':
        return `URGENT: Critical maintenance request "${request.title}" is severely overdue and requires immediate action.`;
      default:
        return `Maintenance request "${request.title}" requires attention.`;
    }
  }

  private getEscalationMessage(incident: any, type: string): string {
    switch (type) {
      case 'high_severity_overdue':
        return `High severity incident "${incident.title}" has been unresolved for over 2 hours.`;
      case 'critical_overdue':
        return `CRITICAL: Incident "${incident.title}" has been unresolved for over 24 hours and requires immediate management attention.`;
      default:
        return `Incident "${incident.title}" requires escalation.`;
    }
  }

  private categorizeIncidents(incidents: any[]): Record<string, number> {
    const categories: Record<string, number> = {};

    incidents.forEach(incident => {
      categories[incident.incidentType] =
        (categories[incident.incidentType] || 0) + 1;
    });

    return categories;
  }
}

// Export singleton instance
export const backgroundJobScheduler = new BackgroundJobScheduler();
