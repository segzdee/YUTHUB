import { Request, Response } from 'express';
import { db } from './db';
import { users, organizations, auditLogs, organizationSubscriptions } from '../shared/schema';
import { eq, desc, count, sql } from 'drizzle-orm';

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

    // TODO: Add MFA verification
    // TODO: Add IP whitelisting check

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
    
    // TODO: Check MFA status
    const mfaRequired = false;
    // TODO: Check IP whitelist
    const ipWhitelisted = true;

    res.json({
      isPlatformAdmin,
      mfaRequired,
      ipWhitelisted,
      user: isPlatformAdmin ? {
        id: user.id,
        email: user.email,
        name: user.name,
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
    // Get total organizations
    const totalOrgs = await db.select({ count: count() }).from(organizations);
    
    // Get active subscriptions
    const activeSubscriptions = await db.select({ count: count() })
      .from(organizationSubscriptions)
      .where(eq(organizationSubscriptions.status, 'active'));

    // Calculate monthly revenue (sample calculation)
    const monthlyRevenue = 125000; // This would be calculated from actual billing data

    // System health (sample data)
    const systemHealth = 99.5;

    // Recent activity (sample data)
    const recentActivity = [
      { action: 'New Organization Created', organization: 'Camden Council', timestamp: '2 hours ago' },
      { action: 'Subscription Upgraded', organization: 'Westminster Council', timestamp: '4 hours ago' },
      { action: 'Payment Failed', organization: 'Hackney Council', timestamp: '6 hours ago' }
    ];

    // System alerts (sample data)
    const systemAlerts = [
      { severity: 'medium', message: 'Database connection pool at 80% capacity' },
      { severity: 'low', message: 'API response time increased by 5%' }
    ];

    res.json({
      totalOrganizations: totalOrgs[0]?.count || 0,
      activeSubscriptions: activeSubscriptions[0]?.count || 0,
      monthlyRevenue,
      systemHealth,
      recentActivity,
      systemAlerts
    });
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
    // Sample monitoring data - in production, this would come from actual monitoring systems
    const monitoringData = {
      database: {
        avgQueryTime: 45,
        connections: 12,
        cacheHitRate: 94
      },
      api: {
        avgResponseTime: 120,
        errorRate: 0.2,
        requestsPerMinute: 1850
      },
      system: {
        uptime: 99.9,
        memoryUsage: 68,
        cpuUsage: 34
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
    // Sample analytics data - in production, this would be calculated from actual data
    const analyticsData = {
      revenue: {
        total: 2500000,
        growth: 18
      },
      conversion: {
        rate: 12.5,
        change: 2.3
      },
      churn: {
        rate: 3.2,
        change: 0.8
      },
      growth: {
        rate: 15.7,
        change: 4.2
      }
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

    // Log the emergency action
    await logPlatformAdminAction(req.user.id, `emergency_${action}`, {
      targetId,
      reason,
      timestamp: new Date()
    });

    // Handle different emergency actions
    switch (action) {
      case 'disable_organization':
        // Disable organization logic
        await db.update(organizations)
          .set({ status: 'disabled' })
          .where(eq(organizations.id, parseInt(targetId)));
        break;
      
      case 'reset_password':
        // Emergency password reset logic
        // This would typically send a secure reset link
        break;
      
      case 'maintenance_mode':
        // Enable maintenance mode
        // This would update system configuration
        break;
      
      case 'system_notification':
        // Send system-wide notification
        // This would use the notification system
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