import axios from 'axios';
import { WebClient } from '@slack/web-api';
import { securityMonitor } from '../security/securityMonitoring';

interface AlertConfig {
  pagerduty?: {
    apiKey: string;
    serviceId: string;
    escalationPolicy: string;
  };
  slack?: {
    token: string;
    channel: string;
    urgentChannel: string;
  };
  email?: {
    recipients: string[];
    smtpConfig: any;
  };
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SecurityAlert {
  title: string;
  description: string;
  severity: AlertSeverity;
  source: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  actionRequired?: string[];
}

class AlertingService {
  private config: AlertConfig;
  private slackClient?: WebClient;
  private alertQueue: SecurityAlert[] = [];
  private isProcessing = false;

  constructor() {
    this.config = {
      pagerduty: {
        apiKey: process.env.PAGERDUTY_API_KEY || '',
        serviceId: process.env.PAGERDUTY_SERVICE_ID || '',
        escalationPolicy: process.env.PAGERDUTY_ESCALATION_POLICY || ''
      },
      slack: {
        token: process.env.SLACK_BOT_TOKEN || '',
        channel: process.env.SLACK_ALERT_CHANNEL || '#security-alerts',
        urgentChannel: process.env.SLACK_URGENT_CHANNEL || '#security-urgent'
      },
      email: {
        recipients: (process.env.SECURITY_ALERT_EMAILS || '').split(','),
        smtpConfig: null // Will be configured based on email service
      }
    };

    // Initialize Slack client if configured
    if (this.config.slack?.token) {
      this.slackClient = new WebClient(this.config.slack.token);
    }

    // Start alert processing
    this.startAlertProcessor();
  }

  /**
   * Send a security alert through all configured channels
   */
  async sendAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Add to queue for processing
      this.alertQueue.push(alert);
      
      // Process immediately if critical
      if (alert.severity === AlertSeverity.CRITICAL) {
        await this.processAlerts();
      }
    } catch (error) {
      console.error('Failed to queue alert:', error);
      // Fallback to console logging
      this.logAlertToConsole(alert);
    }
  }

  /**
   * Process queued alerts
   */
  private async processAlerts(): Promise<void> {
    if (this.isProcessing || this.alertQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.alertQueue.length > 0) {
        const alert = this.alertQueue.shift()!;
        
        // Send to appropriate channels based on severity
        const promises: Promise<any>[] = [];

        if (alert.severity === AlertSeverity.CRITICAL) {
          promises.push(this.sendToPagerDuty(alert));
          promises.push(this.sendToSlack(alert, true)); // Use urgent channel
        } else if (alert.severity === AlertSeverity.HIGH) {
          promises.push(this.sendToSlack(alert, false));
          promises.push(this.sendEmail(alert));
        } else {
          promises.push(this.sendToSlack(alert, false));
        }

        // Log to security monitoring
        promises.push(this.logToSecurityMonitor(alert));

        await Promise.allSettled(promises);
      }
    } catch (error) {
      console.error('Error processing alerts:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send alert to PagerDuty
   */
  private async sendToPagerDuty(alert: SecurityAlert): Promise<void> {
    if (!this.config.pagerduty?.apiKey) {
      console.log('PagerDuty not configured, skipping');
      return;
    }

    try {
      const incident = {
        incident: {
          type: 'incident',
          title: alert.title,
          service: {
            id: this.config.pagerduty.serviceId,
            type: 'service_reference'
          },
          urgency: alert.severity === AlertSeverity.CRITICAL ? 'high' : 'low',
          body: {
            type: 'incident_body',
            details: alert.description
          },
          escalation_policy: {
            id: this.config.pagerduty.escalationPolicy,
            type: 'escalation_policy_reference'
          },
          incident_key: `security-${Date.now()}`,
          metadata: alert.metadata
        }
      };

      await axios.post(
        'https://api.pagerduty.com/incidents',
        incident,
        {
          headers: {
            'Authorization': `Token token=${this.config.pagerduty.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.pagerduty+json;version=2'
          }
        }
      );

      console.log(`✅ PagerDuty incident created for: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send PagerDuty alert:', error);
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendToSlack(alert: SecurityAlert, urgent: boolean = false): Promise<void> {
    if (!this.slackClient) {
      console.log('Slack not configured, skipping');
      return;
    }

    try {
      const channel = urgent ? 
        this.config.slack!.urgentChannel : 
        this.config.slack!.channel;

      const color = this.getSeverityColor(alert.severity);
      
      const message = {
        channel,
        text: urgent ? `🚨 URGENT SECURITY ALERT: ${alert.title}` : `Security Alert: ${alert.title}`,
        attachments: [
          {
            color,
            title: alert.title,
            text: alert.description,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Source',
                value: alert.source,
                short: true
              },
              {
                title: 'Timestamp',
                value: alert.timestamp.toISOString(),
                short: true
              }
            ],
            footer: 'YUTHUB Security',
            ts: Math.floor(Date.now() / 1000).toString()
          }
        ]
      };

      // Add action items if present
      if (alert.actionRequired && alert.actionRequired.length > 0) {
        message.attachments[0].fields.push({
          title: 'Action Required',
          value: alert.actionRequired.map((a, i) => `${i + 1}. ${a}`).join('\n'),
          short: false
        });
      }

      // Add metadata if present
      if (alert.metadata) {
        message.attachments[0].fields.push({
          title: 'Additional Details',
          value: JSON.stringify(alert.metadata, null, 2),
          short: false
        });
      }

      await this.slackClient.chat.postMessage(message);
      console.log(`✅ Slack alert sent to ${channel}: ${alert.title}`);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Send alert via email
   */
  private async sendEmail(alert: SecurityAlert): Promise<void> {
    if (!this.config.email?.recipients.length) {
      console.log('Email recipients not configured, skipping');
      return;
    }

    try {
      // This would integrate with your email service (SendGrid, SES, etc.)
      // For now, we'll just log the intent
      console.log(`📧 Email alert would be sent to: ${this.config.email.recipients.join(', ')}`);
      console.log(`Subject: [${alert.severity.toUpperCase()}] ${alert.title}`);
      console.log(`Body: ${alert.description}`);
      
      // In production, implement actual email sending:
      // await emailService.send({
      //   to: this.config.email.recipients,
      //   subject: `[${alert.severity.toUpperCase()}] Security Alert: ${alert.title}`,
      //   html: this.generateEmailTemplate(alert)
      // });
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  /**
   * Log alert to security monitoring system
   */
  private async logToSecurityMonitor(alert: SecurityAlert): Promise<void> {
    try {
      await securityMonitor.logSecurityEvent({
        eventType: 'suspicious_activity',
        severity: alert.severity === AlertSeverity.CRITICAL ? 'critical' : 
                 alert.severity === AlertSeverity.HIGH ? 'error' : 
                 alert.severity === AlertSeverity.MEDIUM ? 'warning' : 'info',
        ipAddress: 'system',
        metadata: {
          alert: alert.title,
          description: alert.description,
          source: alert.source,
          ...alert.metadata
        }
      });
    } catch (error) {
      console.error('Failed to log to security monitor:', error);
    }
  }

  /**
   * Get color code for severity level
   */
  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return '#FF0000'; // Red
      case AlertSeverity.HIGH:
        return '#FF9900'; // Orange
      case AlertSeverity.MEDIUM:
        return '#FFFF00'; // Yellow
      case AlertSeverity.LOW:
        return '#00FF00'; // Green
      default:
        return '#808080'; // Gray
    }
  }

  /**
   * Log alert to console as fallback
   */
  private logAlertToConsole(alert: SecurityAlert): void {
    const prefix = alert.severity === AlertSeverity.CRITICAL ? '🚨 CRITICAL' :
                  alert.severity === AlertSeverity.HIGH ? '⚠️  HIGH' :
                  alert.severity === AlertSeverity.MEDIUM ? '⚡ MEDIUM' : 'ℹ️  LOW';
    
    console.log('='.repeat(50));
    console.log(`${prefix} SECURITY ALERT`);
    console.log('='.repeat(50));
    console.log(`Title: ${alert.title}`);
    console.log(`Description: ${alert.description}`);
    console.log(`Source: ${alert.source}`);
    console.log(`Timestamp: ${alert.timestamp.toISOString()}`);
    
    if (alert.actionRequired) {
      console.log('Action Required:');
      alert.actionRequired.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
    }
    
    if (alert.metadata) {
      console.log('Metadata:', JSON.stringify(alert.metadata, null, 2));
    }
    console.log('='.repeat(50));
  }

  /**
   * Start background alert processor
   */
  private startAlertProcessor(): void {
    // Process alerts every 30 seconds for non-critical alerts
    setInterval(() => {
      this.processAlerts();
    }, 30000);
  }

  /**
   * Test alert configuration
   */
  async testConfiguration(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Test PagerDuty
    if (this.config.pagerduty?.apiKey) {
      try {
        await axios.get('https://api.pagerduty.com/abilities', {
          headers: {
            'Authorization': `Token token=${this.config.pagerduty.apiKey}`,
            'Accept': 'application/vnd.pagerduty+json;version=2'
          }
        });
        results.pagerduty = true;
      } catch {
        results.pagerduty = false;
      }
    }

    // Test Slack
    if (this.slackClient) {
      try {
        await this.slackClient.auth.test();
        results.slack = true;
      } catch {
        results.slack = false;
      }
    }

    // Email is always available if recipients are configured
    results.email = this.config.email?.recipients.length > 0;

    return results;
  }
}

// Export singleton instance
export const alertingService = new AlertingService();

// Helper function to send alerts from anywhere in the application
export async function sendSecurityAlert(
  title: string,
  description: string,
  severity: AlertSeverity,
  metadata?: Record<string, any>,
  actionRequired?: string[]
): Promise<void> {
  const alert: SecurityAlert = {
    title,
    description,
    severity,
    source: 'YUTHUB Security System',
    timestamp: new Date(),
    metadata,
    actionRequired
  };

  await alertingService.sendAlert(alert);
}

// Export alert templates for common scenarios
export const AlertTemplates = {
  bruteForceDetected: (userId: string, attempts: number, ipAddress: string) => ({
    title: 'Brute Force Attack Detected',
    description: `Multiple failed login attempts detected for user ${userId}`,
    severity: AlertSeverity.HIGH,
    metadata: { userId, attempts, ipAddress },
    actionRequired: [
      'Review login attempts in security dashboard',
      'Consider blocking IP address',
      'Verify user account security'
    ]
  }),

  suspiciousActivity: (activity: string, userId?: string) => ({
    title: 'Suspicious Activity Detected',
    description: activity,
    severity: AlertSeverity.MEDIUM,
    metadata: { userId },
    actionRequired: [
      'Review activity in audit logs',
      'Monitor for further suspicious behavior'
    ]
  }),

  dataBreachAttempt: (details: string) => ({
    title: 'Potential Data Breach Attempt',
    description: details,
    severity: AlertSeverity.CRITICAL,
    actionRequired: [
      'Immediately investigate the breach attempt',
      'Review access logs',
      'Check for data exfiltration',
      'Notify security team lead'
    ]
  }),

  vulnerabilityFound: (vulnerability: string, severity: string) => ({
    title: 'Security Vulnerability Detected',
    description: `A ${severity} severity vulnerability was found: ${vulnerability}`,
    severity: severity === 'critical' ? AlertSeverity.CRITICAL : 
             severity === 'high' ? AlertSeverity.HIGH : 
             AlertSeverity.MEDIUM,
    actionRequired: [
      'Apply security patches',
      'Review affected components',
      'Test fixes in staging environment'
    ]
  }),

  complianceViolation: (violation: string) => ({
    title: 'Compliance Violation Detected',
    description: violation,
    severity: AlertSeverity.HIGH,
    actionRequired: [
      'Review compliance requirements',
      'Document violation resolution',
      'Update policies if necessary'
    ]
  })
};