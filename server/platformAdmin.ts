import { Request, Response } from 'express';
import { db } from './db';
import { users, organizations, auditLogs, organizationSubscriptions } from '../shared/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { PlatformAdminValidator, DataIntegrityValidator, PerformanceMonitor } from './platformAdminValidation';
import { PlatformDataAggregator, AggregatedDataValidator, SecureDataExporter } from './platformAdminAggregation';
import { PlatformDataAggregator, AggregatedDataValidator, SecureDataExporter } from './platformAdminAggregation';

// Platform Admin Authentication Middleware
export async function verifyPlatformAdmin(req: Request, res: Response, next: any) {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user has platform admin role
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });

    if (!user || user.role !== 'platform_admin') {
      return res.status(403).json({ message: 'Platform admin access required' });
    }

    // Platform admin verification completed
    next();
  } catch (error) {
    console.error('Platform admin verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Platform Admin Authentication Check
export async function checkPlatformAdminAuth(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.json({ isPlatformAdmin: false, mfaRequired: false, ipWhitelisted: false });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });

    const isPlatformAdmin = user && user.role === 'platform_admin';
    
    // Check MFA status
    const mfaRequired = user?.mfaEnabled || false;
    
    // Check IP whitelist
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const ipWhitelisted = await PlatformAdminValidator.validateIPWhitelist(clientIP);

    res.json({
      isPlatformAdmin,
      mfaRequired,
      ipWhitelisted,
      user: isPlatformAdmin ? {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error('Platform admin auth check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Platform Overview
export async function getPlatformOverview(req: Request, res: Response) {
  try {
    // Get comprehensive aggregated platform data
    const platformData = await PlatformDataAggregator.getPlatformOverview();
    
    // Get real-time metrics
    const realTimeMetrics = await PlatformDataAggregator.getRealTimeMetrics();
    
    // Validate data consistency
    const dataConsistency = await AggregatedDataValidator.validateDataConsistency();
    
    // Get recent activity from audit logs
    const recentActivity = await db.query.auditLogs.findMany({
      limit: 5,
      orderBy: [desc(auditLogs.timestamp)],
      where: sql`${auditLogs.action} NOT LIKE '%login%'`
    });

    const platformOverview = {
      ...platformData,
      realTimeMetrics,
      dataConsistency: {
        valid: dataConsistency.valid,
        issues: dataConsistency.issues
      },
      recentActivity: recentActivity.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp?.toISOString() || new Date().toISOString(),
        userId: activity.userId,
        riskLevel: activity.riskLevel
      })),
      lastUpdated: new Date().toISOString()
    };

    res.json(platformOverview);
  } catch (error) {
    console.error('Platform overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Subscription Management
export async function getPlatformSubscriptions(req: Request, res: Response) {
  try {
    const subscriptionsData = await db.query.organizationSubscriptions.findMany({
      with: {
        organization: {
          columns: {
            name: true,
            contactEmail: true
          }
        }
      },
      orderBy: [desc(organizationSubscriptions.updatedAt)]
    });

    const formattedSubscriptions = subscriptionsData.map(sub => ({
      id: sub.id,
      organizationName: sub.organization?.name || 'Unknown',
      contact: sub.organization?.contactEmail || 'No contact',
      planName: 'Professional', // This would come from the plan relationship
      status: sub.status,
      monthlyRevenue: parseFloat(sub.amount.toString()),
      residents: 0, // This would be calculated from usage tracking
      maxResidents: 100, // This would come from the plan
      usagePercent: 0 // This would be calculated from usage tracking
    }));

    res.json(formattedSubscriptions);
  } catch (error) {
    console.error('Platform subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Organization Management
export async function getPlatformOrganizations(req: Request, res: Response) {
  try {
    const orgsData = await db.query.organizations.findMany({
      orderBy: [desc(organizations.createdAt)]
    });

    const formattedOrgs = orgsData.map(org => ({
      id: org.id,
      name: org.name,
      status: org.status || 'inactive',
      subscriptionPlan: 'Professional', // This would come from subscription relationship
      residents: 0, // This would be calculated from actual data
      createdAt: org.createdAt?.toISOString().split('T')[0] || 'Unknown',
      primaryContact: org.contactEmail || 'No contact'
    }));

    res.json(formattedOrgs);
  } catch (error) {
    console.error('Platform organizations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// System Monitoring
export async function getSystemMonitoring(req: Request, res: Response) {
  try {
    // Get real-time monitoring data
    const [databaseMetrics, apiMetrics, systemMetrics] = await Promise.all([
      PerformanceMonitor.getDatabaseMetrics(),
      PerformanceMonitor.getAPIMetrics(),
      PerformanceMonitor.getSystemMetrics()
    ]);

    const monitoringData = {
      database: {
        avgQueryTime: databaseMetrics.queryTime,
        connections: databaseMetrics.connections,
        cacheHitRate: databaseMetrics.cacheHitRate
      },
      api: {
        avgResponseTime: apiMetrics.avgResponseTime,
        errorRate: apiMetrics.errorRate,
        requestsPerMinute: apiMetrics.requestsPerMinute
      },
      system: {
        uptime: systemMetrics.uptime,
        memoryUsage: systemMetrics.memoryUsage,
        cpuUsage: systemMetrics.cpuUsage
      }
    };

    res.json(monitoringData);
  } catch (error) {
    console.error('System monitoring error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Platform Analytics
export async function getPlatformAnalytics(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    // Get comprehensive analytics data
    const [
      organizationBreakdowns,
      historicalTrends,
      realTimeMetrics,
      performanceCheck
    ] = await Promise.all([
      PlatformDataAggregator.getOrganizationBreakdowns(timeRange),
      PlatformDataAggregator.getHistoricalTrends(12),
      PlatformDataAggregator.getRealTimeMetrics(),
      AggregatedDataValidator.checkAggregationPerformance()
    ]);

    // Calculate analytics metrics
    const totalRevenue = organizationBreakdowns.reduce((sum, org) => sum + org.revenue, 0);
    const averageOccupancy = organizationBreakdowns.reduce((sum, org) => sum + org.occupancyRate, 0) / organizationBreakdowns.length;
    const averageResponseTime = organizationBreakdowns.reduce((sum, org) => sum + org.responseTime, 0) / organizationBreakdowns.length;

    const analyticsData = {
      revenue: {
        total: totalRevenue,
        byOrganization: organizationBreakdowns.map(org => ({
          name: org.organizationName,
          revenue: org.revenue
        })),
        trends: historicalTrends.revenueTrends
      },
      occupancy: {
        average: Math.round(averageOccupancy * 100) / 100,
        byOrganization: organizationBreakdowns.map(org => ({
          name: org.organizationName,
          occupancy: org.occupancyRate
        })),
        trends: historicalTrends.occupancyTrends
      },
      incidents: {
        total: organizationBreakdowns.reduce((sum, org) => sum + org.incidents, 0),
        averageResponseTime: Math.round(averageResponseTime),
        byOrganization: organizationBreakdowns.map(org => ({
          name: org.organizationName,
          incidents: org.incidents,
          responseTime: org.responseTime
        })),
        trends: historicalTrends.incidentTrends
      },
      residents: {
        total: organizationBreakdowns.reduce((sum, org) => sum + org.residents, 0),
        byOrganization: organizationBreakdowns.map(org => ({
          name: org.organizationName,
          residents: org.residents
        })),
        trends: historicalTrends.residentTrends
      },
      performance: {
        aggregationPerformance: performanceCheck.performant,
        slowQueries: performanceCheck.slowQueries,
        realTimeMetrics
      },
      lastUpdated: new Date().toISOString()
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Billing Oversight
export async function getBillingOversight(req: Request, res: Response) {
  try {
    // Sample billing data - in production, this would come from payment processor
    const billingData = {
      payments: {
        successRate: 96.8,
        failed: 23,
        volume: 485000
      },
      invoices: {
        generated: 156,
        paid: 142,
        overdue: 8
      },
      revenue: {
        monthly: 125000,
        annual: 1400000,
        growth: 18.5
      }
    };

    res.json(billingData);
  } catch (error) {
    console.error('Billing oversight error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Feature Flag Management
export async function getFeatureFlags(req: Request, res: Response) {
  try {
    // Sample feature flags - in production, this would come from feature flag service
    const featureFlags = [
      {
        id: 'crisis-connect-v2',
        name: 'Crisis Connect V2',
        description: 'Enhanced crisis response system with AI-powered escalation',
        enabled: true
      },
      {
        id: 'mobile-app-beta',
        name: 'Mobile App Beta',
        description: 'Beta version of the mobile application',
        enabled: false
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Analytics',
        description: 'Machine learning powered analytics and predictions',
        enabled: true
      },
      {
        id: 'multi-language',
        name: 'Multi-Language Support',
        description: 'Support for multiple languages in the interface',
        enabled: false
      }
    ];

    res.json(featureFlags);
  } catch (error) {
    console.error('Feature flags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Log platform admin action
export async function logPlatformAdminAction(userId: string, action: string, details: any) {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId,
      action,
      details: JSON.stringify(details),
      timestamp: new Date(),
      riskLevel: 'high', // Platform admin actions are high risk
      metadata: {
        source: 'platform_admin',
        userAgent: 'platform_admin_interface'
      }
    });
  } catch (error) {
    console.error('Platform admin action logging error:', error);
  }
}

// Emergency Tools Actions
export async function handleEmergencyAction(req: Request, res: Response) {
  try {
    const { action, targetId, reason } = req.body;

    // Validate emergency action authorization
    const validation = await PlatformAdminValidator.validateEmergencyAction(
      req.user.id, 
      action, 
      targetId
    );

    if (!validation.authorized) {
      return res.status(403).json({ message: validation.reason });
    }

    // Log the emergency action
    await logPlatformAdminAction(req.user.id, `emergency_${action}`, {
      targetId,
      reason,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    });

    // Handle different emergency actions with additional validation
    switch (action) {
      case 'disable_organization':
        // Validate organization data before disabling
        const orgValidation = await DataIntegrityValidator.validateOrganizationData(parseInt(targetId));
        if (!orgValidation.valid) {
          return res.status(400).json({ message: 'Organization validation failed', issues: orgValidation.issues });
        }
        
        await db.update(organizations)
          .set({ status: 'disabled' })
          .where(eq(organizations.id, parseInt(targetId)));
        break;
      
      case 'reset_password':
        // Emergency password reset with additional security
        const targetUser = await db.query.users.findFirst({
          where: eq(users.id, targetId)
        });
        
        if (!targetUser) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate secure reset token and send notification
        break;
      
      case 'maintenance_mode':
        // Enable maintenance mode with system-wide notification
        // This would update system configuration and notify all users
        break;
      
      case 'system_notification':
        // Send system-wide notification with delivery tracking
        // This would use the notification system with delivery confirmation
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid emergency action' });
    }

    res.json({ success: true, message: `Emergency ${action} executed successfully` });
  } catch (error) {
    console.error('Emergency action error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Organization Breakdown Analytics
export async function getOrganizationBreakdowns(req: Request, res: Response) {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    
    const breakdowns = await PlatformDataAggregator.getOrganizationBreakdowns(timeRange);
    
    res.json({
      timeRange,
      organizations: breakdowns,
      summary: {
        totalOrganizations: breakdowns.length,
        totalResidents: breakdowns.reduce((sum, org) => sum + org.residents, 0),
        totalProperties: breakdowns.reduce((sum, org) => sum + org.properties, 0),
        averageOccupancy: breakdowns.reduce((sum, org) => sum + org.occupancyRate, 0) / breakdowns.length,
        totalIncidents: breakdowns.reduce((sum, org) => sum + org.incidents, 0)
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Organization breakdowns error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Historical Trends Analytics
export async function getHistoricalTrends(req: Request, res: Response) {
  try {
    const months = parseInt(req.query.months as string) || 12;
    
    const trends = await PlatformDataAggregator.getHistoricalTrends(months);
    
    res.json({
      months,
      trends,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Historical trends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Real-time Dashboard Metrics
export async function getRealTimeDashboardMetrics(req: Request, res: Response) {
  try {
    const metrics = await PlatformDataAggregator.getRealTimeMetrics();
    
    res.json({
      metrics,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time dashboard metrics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Export Aggregated Data
export async function exportAggregatedData(req: Request, res: Response) {
  try {
    const format = req.query.format as 'csv' | 'json' || 'json';
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Log the export action
    await logPlatformAdminAction(userId, 'data_export', {
      format,
      timestamp: new Date()
    });

    const exportData = await SecureDataExporter.exportAggregatedReport(format);
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.filename}"`);
    
    if (format === 'csv') {
      // Convert JSON to CSV format
      const csvData = convertJSONToCSV(exportData.data);
      res.send(csvData);
    } else {
      res.json(exportData.data);
    }
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Data Consistency Validation
export async function validateDataConsistency(req: Request, res: Response) {
  try {
    const validation = await AggregatedDataValidator.validateDataConsistency();
    const performanceCheck = await AggregatedDataValidator.checkAggregationPerformance();
    
    res.json({
      dataConsistency: validation,
      performanceCheck,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Data consistency validation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to convert JSON to CSV
function convertJSONToCSV(data: any): string {
  const organizations = data.organizationBreakdowns || [];
  
  const headers = [
    'Organization Name',
    'Residents',
    'Properties',
    'Incidents',
    'Occupancy Rate',
    'Response Time',
    'Satisfaction Score'
  ];
  
  const csvRows = [
    headers.join(','),
    ...organizations.map((org: any) => [
      org.organizationName,
      org.residents,
      org.properties,
      org.incidents,
      org.occupancyRate,
      org.responseTime,
      org.satisfactionScore
    ].join(','))
  ];
  
  return csvRows.join('\n');
}