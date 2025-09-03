import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { securityEvents } from '@shared/schema';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface SecurityEvent {
  eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 
             'password_change' | 'mfa_enabled' | 'mfa_disabled' | 'suspicious_activity' |
             'account_locked' | 'permission_denied' | 'data_export' | 'data_deletion' |
             'api_key_created' | 'api_key_revoked' | 'csp_violation' | 'rate_limit_exceeded';
  userId?: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

class SecurityMonitor {
  private alertThresholds = {
    failedLogins: 5,
    suspiciousActivities: 3,
    rateLimitExceeded: 10,
  };

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await db.insert(securityEvents).values({
        id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventType: event.eventType,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata || {},
        severity: event.severity,
        timestamp: new Date(),
      });

      // Check if alert should be triggered
      await this.checkAlertThresholds(event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async checkAlertThresholds(event: SecurityEvent): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for repeated failed login attempts
    if (event.eventType === 'login_failure' && event.userId) {
      const failedAttempts = await db
        .select({ count: sql<number>`count(*)` })
        .from(securityEvents)
        .where(
          and(
            eq(securityEvents.userId, event.userId),
            eq(securityEvents.eventType, 'login_failure'),
            gte(securityEvents.timestamp, oneHourAgo)
          )
        );

      if (failedAttempts[0]?.count >= this.alertThresholds.failedLogins) {
        await this.sendSecurityAlert({
          type: 'excessive_failed_logins',
          userId: event.userId,
          count: failedAttempts[0].count,
          ipAddress: event.ipAddress,
        });
      }
    }

    // Check for suspicious activities
    if (event.severity === 'warning' || event.severity === 'critical') {
      await this.sendSecurityAlert({
        type: 'suspicious_activity',
        event: event.eventType,
        userId: event.userId,
        ipAddress: event.ipAddress,
        severity: event.severity,
      });
    }

    // Check for rate limit violations
    if (event.eventType === 'rate_limit_exceeded') {
      const rateLimitViolations = await db
        .select({ count: sql<number>`count(*)` })
        .from(securityEvents)
        .where(
          and(
            eq(securityEvents.ipAddress, event.ipAddress),
            eq(securityEvents.eventType, 'rate_limit_exceeded'),
            gte(securityEvents.timestamp, oneHourAgo)
          )
        );

      if (rateLimitViolations[0]?.count >= this.alertThresholds.rateLimitExceeded) {
        await this.sendSecurityAlert({
          type: 'excessive_rate_limit_violations',
          ipAddress: event.ipAddress,
          count: rateLimitViolations[0].count,
        });
      }
    }
  }

  private async sendSecurityAlert(alert: any): Promise<void> {
    // In production, integrate with alerting service (e.g., PagerDuty, Slack, email)
    console.error('🚨 SECURITY ALERT:', alert);
    
    // Log alert to database
    await this.logSecurityEvent({
      eventType: 'suspicious_activity',
      userId: alert.userId,
      ipAddress: alert.ipAddress || 'system',
      severity: 'critical',
      metadata: alert,
    });

    // TODO: Implement actual alert notifications
    // - Send email to security team
    // - Post to Slack security channel
    // - Create PagerDuty incident if critical
  }

  async getSecurityEvents(filters: {
    userId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
  }) {
    const conditions = [];
    
    if (filters.userId) {
      conditions.push(eq(securityEvents.userId, filters.userId));
    }
    if (filters.eventType) {
      conditions.push(eq(securityEvents.eventType, filters.eventType));
    }
    if (filters.startDate) {
      conditions.push(gte(securityEvents.timestamp, filters.startDate));
    }
    if (filters.severity) {
      conditions.push(eq(securityEvents.severity, filters.severity));
    }

    return db
      .select()
      .from(securityEvents)
      .where(and(...conditions))
      .orderBy(sql`${securityEvents.timestamp} DESC`)
      .limit(100);
  }

  async generateSecurityReport(startDate: Date, endDate: Date) {
    const events = await db
      .select({
        eventType: securityEvents.eventType,
        severity: securityEvents.severity,
        count: sql<number>`count(*)`,
      })
      .from(securityEvents)
      .where(
        and(
          gte(securityEvents.timestamp, startDate),
          sql`${securityEvents.timestamp} <= ${endDate}`
        )
      )
      .groupBy(securityEvents.eventType, securityEvents.severity);

    return {
      period: { startDate, endDate },
      summary: events,
      generatedAt: new Date(),
    };
  }
}

export const securityMonitor = new SecurityMonitor();

// Middleware to log security events
export const securityLoggingMiddleware = (eventType: SecurityEvent['eventType']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    const userId = (req as any).user?.id;

    await securityMonitor.logSecurityEvent({
      eventType,
      userId,
      ipAddress,
      userAgent,
      severity: 'info',
      metadata: {
        method: req.method,
        path: req.path,
      },
    });

    next();
  };
};

// CSP violation reporter
export const cspReportHandler = async (req: Request, res: Response) => {
  const report = req.body;
  
  await securityMonitor.logSecurityEvent({
    eventType: 'csp_violation',
    ipAddress: req.ip || 'unknown',
    userAgent: req.headers['user-agent'],
    severity: 'warning',
    metadata: report,
  });

  res.status(204).send();
};

// Security dashboard endpoint
export const securityDashboardHandler = async (req: Request, res: Response) => {
  try {
    const { userId, eventType, startDate, endDate, severity } = req.query;
    
    const events = await securityMonitor.getSecurityEvents({
      userId: userId as string,
      eventType: eventType as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      severity: severity as string,
    });

    res.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security events',
    });
  }
};

// Security report generator
export const securityReportHandler = async (req: Request, res: Response) => {
  try {
    const startDate = new Date(req.query.startDate as string || Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(req.query.endDate as string || Date.now());
    
    const report = await securityMonitor.generateSecurityReport(startDate, endDate);
    
    res.json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate security report',
    });
  }
};