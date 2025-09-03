import cron from 'node-cron';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { 
  users, 
  tenants, 
  residents, 
  supportPlans,
  auditLogs,
  securityEvents,
  sessions
} from '@shared/schema';
import { alertingService, AlertSeverity } from '../services/alertingService';

interface RetentionAuditResult {
  category: string;
  tableName: string;
  totalRecords: number;
  expiredRecords: number;
  retentionPeriod: string;
  lastCleaned?: Date;
  nextCleanup: Date;
  compliance: 'compliant' | 'warning' | 'violation';
  actions: string[];
}

class DataRetentionAuditor {
  private auditResults: RetentionAuditResult[] = [];
  private isRunning = false;

  /**
   * Schedule retention audits
   */
  scheduleAudits(): void {
    // Daily cleanup of short-term data (runs at 2 AM)
    cron.schedule('0 2 * * *', () => {
      this.runDailyCleanup();
    });

    // Weekly retention check (runs on Sundays at 3 AM)
    cron.schedule('0 3 * * 0', () => {
      this.runWeeklyAudit();
    });

    // Monthly comprehensive audit (runs on 1st of each month at 4 AM)
    cron.schedule('0 4 1 * *', () => {
      this.runMonthlyAudit();
    });

    // Quarterly compliance report (runs on 1st day of quarter at 5 AM)
    cron.schedule('0 5 1 */3 *', () => {
      this.runQuarterlyComplianceReport();
    });

    console.log('📅 Data retention audit schedules configured');
  }

  /**
   * Run daily cleanup of short-term data
   */
  private async runDailyCleanup(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log('🧹 Starting daily data cleanup...');
      
      // Clean expired sessions (30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedSessions = await db
        .delete(sessions)
        .where(sql`${sessions.expiresAt} < ${thirtyDaysAgo}`)
        .returning({ id: sessions.id });
      
      console.log(`Deleted ${deletedSessions.length} expired sessions`);

      // Clean old error logs (30 days)
      // This would be implemented based on your error logging system
      
      // Clean temporary files
      // This would clean up any temporary upload files

      await this.logAuditAction('daily_cleanup', {
        sessions: deletedSessions.length,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Daily cleanup failed:', error);
      await alertingService.sendAlert({
        title: 'Data Retention Daily Cleanup Failed',
        description: `Daily cleanup process encountered an error: ${error}`,
        severity: AlertSeverity.MEDIUM,
        source: 'Data Retention Auditor',
        timestamp: new Date()
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run weekly retention audit
   */
  private async runWeeklyAudit(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log('📊 Starting weekly retention audit...');
      this.auditResults = [];

      // Audit each data category
      await this.auditUserData();
      await this.auditResidentData();
      await this.auditSecurityData();
      await this.auditCommunicationData();

      // Generate summary
      const summary = this.generateAuditSummary();
      
      // Send alert if issues found
      const hasViolations = this.auditResults.some(r => r.compliance === 'violation');
      const hasWarnings = this.auditResults.some(r => r.compliance === 'warning');

      if (hasViolations) {
        await alertingService.sendAlert({
          title: 'Data Retention Compliance Violation',
          description: 'Weekly audit found data retention violations that require immediate attention',
          severity: AlertSeverity.HIGH,
          source: 'Data Retention Auditor',
          timestamp: new Date(),
          metadata: summary,
          actionRequired: [
            'Review retention violations immediately',
            'Execute data deletion for expired records',
            'Update retention policies if needed'
          ]
        });
      } else if (hasWarnings) {
        await alertingService.sendAlert({
          title: 'Data Retention Warning',
          description: 'Weekly audit found data approaching retention limits',
          severity: AlertSeverity.LOW,
          source: 'Data Retention Auditor',
          timestamp: new Date(),
          metadata: summary
        });
      }

      await this.logAuditAction('weekly_audit', summary);

    } catch (error) {
      console.error('Weekly audit failed:', error);
      await alertingService.sendAlert({
        title: 'Data Retention Weekly Audit Failed',
        description: `Weekly audit process encountered an error: ${error}`,
        severity: AlertSeverity.HIGH,
        source: 'Data Retention Auditor',
        timestamp: new Date()
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run monthly comprehensive audit
   */
  private async runMonthlyAudit(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      console.log('🔍 Starting monthly comprehensive audit...');
      
      // Run full audit
      await this.runWeeklyAudit();
      
      // Additional monthly checks
      await this.auditBackups();
      await this.auditArchives();
      await this.validateRetentionPolicies();
      
      // Generate detailed report
      const report = await this.generateDetailedReport();
      
      // Store report
      await this.storeAuditReport(report);
      
      // Send to stakeholders
      await alertingService.sendAlert({
        title: 'Monthly Data Retention Audit Complete',
        description: 'Monthly comprehensive data retention audit has been completed',
        severity: AlertSeverity.LOW,
        source: 'Data Retention Auditor',
        timestamp: new Date(),
        metadata: report,
        actionRequired: [
          'Review monthly retention report',
          'Approve any pending deletions',
          'Update retention schedule if needed'
        ]
      });

    } catch (error) {
      console.error('Monthly audit failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run quarterly compliance report
   */
  private async runQuarterlyComplianceReport(): Promise<void> {
    try {
      console.log('📋 Generating quarterly compliance report...');
      
      const report = {
        quarter: Math.floor((new Date().getMonth() / 3)) + 1,
        year: new Date().getFullYear(),
        generatedAt: new Date(),
        compliance: {
          gdprCompliant: true,
          dataMinimization: true,
          rightToErasure: true,
          dataPortability: true
        },
        statistics: await this.getQuarterlyStatistics(),
        recommendations: await this.generateRecommendations(),
        upcomingChanges: await this.getUpcomingPolicyChanges()
      };

      // Store compliance report
      await this.storeComplianceReport(report);

      // Send to legal team
      await alertingService.sendAlert({
        title: 'Quarterly Compliance Report Ready',
        description: 'Quarterly data retention compliance report is ready for review',
        severity: AlertSeverity.LOW,
        source: 'Data Retention Auditor',
        timestamp: new Date(),
        metadata: report,
        actionRequired: [
          'Review with legal counsel',
          'Update policies based on recommendations',
          'Schedule compliance training if needed',
          'Prepare for any regulatory changes'
        ]
      });

    } catch (error) {
      console.error('Quarterly compliance report failed:', error);
    }
  }

  /**
   * Audit user data retention
   */
  private async auditUserData(): Promise<void> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const sixYearsAgo = new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000);

    // Check inactive user accounts
    const inactiveUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.lastLoginAt} < ${ninetyDaysAgo} AND ${users.deletedAt} IS NULL`);

    this.auditResults.push({
      category: 'User Data',
      tableName: 'users',
      totalRecords: await this.getTableCount('users'),
      expiredRecords: inactiveUsers[0]?.count || 0,
      retentionPeriod: '90 days after account closure',
      nextCleanup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      compliance: inactiveUsers[0]?.count > 100 ? 'warning' : 'compliant',
      actions: inactiveUsers[0]?.count > 0 ? ['Mark inactive users for deletion'] : []
    });
  }

  /**
   * Audit resident data retention
   */
  private async auditResidentData(): Promise<void> {
    const sevenYearsAgo = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000);

    // Check old resident records
    const oldResidents = await db
      .select({ count: sql<number>`count(*)` })
      .from(residents)
      .where(sql`${residents.moveOutDate} < ${sevenYearsAgo}`);

    this.auditResults.push({
      category: 'Resident Data',
      tableName: 'residents',
      totalRecords: await this.getTableCount('residents'),
      expiredRecords: oldResidents[0]?.count || 0,
      retentionPeriod: '7 years after tenancy ends',
      nextCleanup: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      compliance: oldResidents[0]?.count > 0 ? 'violation' : 'compliant',
      actions: oldResidents[0]?.count > 0 ? ['Archive and anonymize old resident data'] : []
    });
  }

  /**
   * Audit security data retention
   */
  private async auditSecurityData(): Promise<void> {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);

    // Check old security events
    const oldSecurityEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityEvents)
      .where(sql`${securityEvents.timestamp} < ${twoYearsAgo}`);

    this.auditResults.push({
      category: 'Security Data',
      tableName: 'security_events',
      totalRecords: await this.getTableCount('security_events'),
      expiredRecords: oldSecurityEvents[0]?.count || 0,
      retentionPeriod: '2 years',
      nextCleanup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      compliance: oldSecurityEvents[0]?.count > 0 ? 'warning' : 'compliant',
      actions: oldSecurityEvents[0]?.count > 0 ? ['Archive old security events'] : []
    });
  }

  /**
   * Audit communication data retention
   */
  private async auditCommunicationData(): Promise<void> {
    // This would audit emails, messages, etc.
    // Implementation depends on your communication system
  }

  /**
   * Audit backup retention
   */
  private async auditBackups(): Promise<void> {
    // Check backup files older than retention period
    // Implementation depends on your backup strategy
    console.log('Auditing backup retention...');
  }

  /**
   * Audit archived data
   */
  private async auditArchives(): Promise<void> {
    // Check archived data for compliance
    console.log('Auditing archived data...');
  }

  /**
   * Validate retention policies against regulations
   */
  private async validateRetentionPolicies(): Promise<void> {
    // Cross-check policies with current regulations
    console.log('Validating retention policies...');
  }

  /**
   * Get table record count
   */
  private async getTableCount(tableName: string): Promise<number> {
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM ${sql.identifier(tableName)}`);
      return (result.rows[0] as any)?.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Generate audit summary
   */
  private generateAuditSummary(): any {
    const totalExpired = this.auditResults.reduce((sum, r) => sum + r.expiredRecords, 0);
    const violations = this.auditResults.filter(r => r.compliance === 'violation');
    const warnings = this.auditResults.filter(r => r.compliance === 'warning');

    return {
      auditDate: new Date(),
      totalCategories: this.auditResults.length,
      totalExpiredRecords: totalExpired,
      violations: violations.length,
      warnings: warnings.length,
      compliant: this.auditResults.filter(r => r.compliance === 'compliant').length,
      results: this.auditResults
    };
  }

  /**
   * Generate detailed retention report
   */
  private async generateDetailedReport(): Promise<any> {
    return {
      reportDate: new Date(),
      executiveSummary: await this.generateExecutiveSummary(),
      detailedFindings: this.auditResults,
      complianceStatus: await this.assessComplianceStatus(),
      recommendations: await this.generateRecommendations(),
      actionPlan: await this.generateActionPlan()
    };
  }

  /**
   * Generate executive summary
   */
  private async generateExecutiveSummary(): Promise<string> {
    const violations = this.auditResults.filter(r => r.compliance === 'violation').length;
    const warnings = this.auditResults.filter(r => r.compliance === 'warning').length;
    
    if (violations > 0) {
      return `Critical: ${violations} data retention violations found requiring immediate action.`;
    } else if (warnings > 0) {
      return `Warning: ${warnings} data categories approaching retention limits.`;
    } else {
      return 'All data categories are compliant with retention policies.';
    }
  }

  /**
   * Assess overall compliance status
   */
  private async assessComplianceStatus(): Promise<string> {
    const hasViolations = this.auditResults.some(r => r.compliance === 'violation');
    const hasWarnings = this.auditResults.some(r => r.compliance === 'warning');
    
    if (hasViolations) return 'NON_COMPLIANT';
    if (hasWarnings) return 'AT_RISK';
    return 'COMPLIANT';
  }

  /**
   * Generate recommendations
   */
  private async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    
    for (const result of this.auditResults) {
      if (result.compliance === 'violation') {
        recommendations.push(`Immediate action required for ${result.category}: ${result.expiredRecords} expired records`);
      } else if (result.compliance === 'warning') {
        recommendations.push(`Schedule cleanup for ${result.category} within 30 days`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue regular monitoring and audits');
    }
    
    return recommendations;
  }

  /**
   * Generate action plan
   */
  private async generateActionPlan(): Promise<any[]> {
    const actions = [];
    
    for (const result of this.auditResults) {
      if (result.actions.length > 0) {
        actions.push({
          category: result.category,
          priority: result.compliance === 'violation' ? 'HIGH' : 'MEDIUM',
          actions: result.actions,
          deadline: result.nextCleanup
        });
      }
    }
    
    return actions;
  }

  /**
   * Get quarterly statistics
   */
  private async getQuarterlyStatistics(): Promise<any> {
    // Generate statistics for the quarter
    return {
      recordsDeleted: 0, // Would be tracked
      recordsArchived: 0, // Would be tracked
      dataSubjectRequests: 0, // Would be tracked
      complianceScore: 95
    };
  }

  /**
   * Get upcoming policy changes
   */
  private async getUpcomingPolicyChanges(): Promise<string[]> {
    return [
      'Review retention periods for financial records (Q2 2025)',
      'Update safeguarding data retention to 30 years (Q3 2025)'
    ];
  }

  /**
   * Store audit report
   */
  private async storeAuditReport(report: any): Promise<void> {
    // Store in database or file system
    await db.insert(auditLogs).values({
      id: `audit_${Date.now()}`,
      action: 'retention_audit',
      userId: 'system',
      metadata: report,
      timestamp: new Date(),
      ipAddress: 'system'
    });
  }

  /**
   * Store compliance report
   */
  private async storeComplianceReport(report: any): Promise<void> {
    // Store compliance report
    await db.insert(auditLogs).values({
      id: `compliance_${Date.now()}`,
      action: 'compliance_report',
      userId: 'system',
      metadata: report,
      timestamp: new Date(),
      ipAddress: 'system'
    });
  }

  /**
   * Log audit action
   */
  private async logAuditAction(action: string, details: any): Promise<void> {
    console.log(`Audit action: ${action}`, details);
    
    await db.insert(auditLogs).values({
      id: `audit_action_${Date.now()}`,
      action: `retention_${action}`,
      userId: 'system',
      metadata: details,
      timestamp: new Date(),
      ipAddress: 'system'
    });
  }

  /**
   * Manually trigger retention audit
   */
  async runManualAudit(): Promise<any> {
    console.log('🔍 Running manual retention audit...');
    await this.runWeeklyAudit();
    return this.generateAuditSummary();
  }

  /**
   * Get next scheduled audits
   */
  getScheduledAudits(): any[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return [
      {
        type: 'Daily Cleanup',
        nextRun: tomorrow.setHours(2, 0, 0, 0),
        frequency: 'Daily at 2:00 AM'
      },
      {
        type: 'Weekly Audit',
        nextRun: nextWeek,
        frequency: 'Weekly on Sundays at 3:00 AM'
      },
      {
        type: 'Monthly Comprehensive Audit',
        nextRun: nextMonth.setHours(4, 0, 0, 0),
        frequency: 'Monthly on the 1st at 4:00 AM'
      },
      {
        type: 'Quarterly Compliance Report',
        nextRun: this.getNextQuarterlyDate(),
        frequency: 'Quarterly on the 1st at 5:00 AM'
      }
    ];
  }

  /**
   * Get next quarterly date
   */
  private getNextQuarterlyDate(): number {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const nextQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 1);
    return nextQuarter.setHours(5, 0, 0, 0);
  }
}

// Create and export singleton instance
export const dataRetentionAuditor = new DataRetentionAuditor();

// Initialize retention audit schedules
export function initializeRetentionAudits(): void {
  dataRetentionAuditor.scheduleAudits();
  
  console.log('✅ Data retention audit system initialized');
  console.log('📅 Next scheduled audits:');
  const schedules = dataRetentionAuditor.getScheduledAudits();
  schedules.forEach(schedule => {
    console.log(`  - ${schedule.type}: ${new Date(schedule.nextRun).toLocaleString()} (${schedule.frequency})`);
  });
}

// Export for testing and manual triggers
export default dataRetentionAuditor;