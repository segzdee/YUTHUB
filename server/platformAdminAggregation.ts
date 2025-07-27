import { and, count, eq, gte, lte, sql } from 'drizzle-orm';
import {
  incidents,
  maintenanceRequests,
  organizations,
  organizationSubscriptions,
  properties,
  residents,
  supportPlans,
  users,
} from '../shared/schema';
import { db } from './db';

// Platform-wide data aggregation service
export class PlatformDataAggregator {
  // Get comprehensive platform overview with aggregated metrics
  static async getPlatformOverview(): Promise<{
    totalOrganizations: number;
    totalResidents: number;
    totalProperties: number;
    totalIncidents: number;
    totalRevenue: number;
    occupancyRate: number;
    activeSubscriptions: number;
    averageResponseTime: number;
    platformHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      // Execute all aggregation queries in parallel for performance
      const [
        totalOrganizations,
        totalResidents,
        totalProperties,
        totalIncidents,
        totalRevenue,
        occupancyData,
        activeSubscriptions,
        responseTimeData,
      ] = await Promise.all([
        // Total organizations
        db
          .select({ count: count() })
          .from(organizations)
          .where(eq(organizations.status, 'active')),

        // Total residents across all organizations
        db
          .select({ count: count() })
          .from(residents)
          .where(eq(residents.status, 'active')),

        // Total properties
        db
          .select({ count: count() })
          .from(properties)
          .where(eq(properties.status, 'active')),

        // Total incidents (last 30 days)
        db
          .select({ count: count() })
          .from(incidents)
          .where(
            gte(
              incidents.createdAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
          ),

        // Total revenue from active subscriptions
        db
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${organizationSubscriptions.amount} AS DECIMAL)), 0)`,
          })
          .from(organizationSubscriptions)
          .where(eq(organizationSubscriptions.status, 'active')),

        // Occupancy data for rate calculation
        db
          .select({
            totalCapacity: sql<number>`COALESCE(SUM(${properties.totalUnits}), 0)`,
            occupiedUnits: sql<number>`COALESCE(SUM(${properties.occupiedUnits}), 0)`,
          })
          .from(properties)
          .where(eq(properties.status, 'active')),

        // Active subscriptions
        db
          .select({ count: count() })
          .from(organizationSubscriptions)
          .where(eq(organizationSubscriptions.status, 'active')),

        // Average crisis response time (last 30 days)
        db
          .select({
            avgResponseTime: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${incidents.resolvedAt} - ${incidents.createdAt}))), 0)`,
          })
          .from(incidents)
          .where(
            and(
              gte(
                incidents.createdAt,
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ),
              eq(incidents.severity, 'critical'),
              sql`${incidents.resolvedAt} IS NOT NULL`
            )
          ),
      ]);

      // Calculate derived metrics
      const occupancyRate =
        occupancyData[0].totalCapacity > 0
          ? (occupancyData[0].occupiedUnits / occupancyData[0].totalCapacity) *
            100
          : 0;

      const averageResponseTime = responseTimeData[0].avgResponseTime || 0;

      // Determine platform health based on key metrics
      let platformHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (occupancyRate > 95 || averageResponseTime > 3600) {
        platformHealth = 'critical';
      } else if (occupancyRate > 90 || averageResponseTime > 1800) {
        platformHealth = 'warning';
      }

      return {
        totalOrganizations: totalOrganizations[0].count,
        totalResidents: totalResidents[0].count,
        totalProperties: totalProperties[0].count,
        totalIncidents: totalIncidents[0].count,
        totalRevenue: parseFloat(totalRevenue[0].total?.toString() || '0'),
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        activeSubscriptions: activeSubscriptions[0].count,
        averageResponseTime: Math.round(averageResponseTime),
        platformHealth,
      };
    } catch (error) {
      console.error('Platform overview aggregation error:', error);
      throw new Error('Failed to aggregate platform overview data');
    }
  }

  // Get organization-specific breakdowns for comparative analysis
  static async getOrganizationBreakdowns(timeRange: string = '30d'): Promise<
    Array<{
      organizationId: number;
      organizationName: string;
      residents: number;
      properties: number;
      incidents: number;
      revenue: number;
      occupancyRate: number;
      responseTime: number;
      satisfactionScore: number;
    }>
  > {
    try {
      const timeRangeMs = this.getTimeRangeMs(timeRange);
      const startDate = new Date(Date.now() - timeRangeMs);

      // Get all active organizations
      const orgs = await db
        .select()
        .from(organizations)
        .where(eq(organizations.status, 'active'));

      // Process each organization in parallel
      const organizationMetrics = await Promise.all(
        orgs.map(async org => {
          const [
            residentCount,
            propertyCount,
            incidentCount,
            subscriptionRevenue,
            occupancyData,
            responseTimeData,
            satisfactionData,
          ] = await Promise.all([
            // Residents count
            db
              .select({ count: count() })
              .from(residents)
              .where(
                and(
                  eq(residents.organizationId, org.id),
                  eq(residents.status, 'active')
                )
              ),

            // Properties count
            db
              .select({ count: count() })
              .from(properties)
              .where(
                and(
                  eq(properties.organizationId, org.id),
                  eq(properties.status, 'active')
                )
              ),

            // Incidents in time range
            db
              .select({ count: count() })
              .from(incidents)
              .where(
                and(
                  eq(incidents.organizationId, org.id),
                  gte(incidents.createdAt, startDate)
                )
              ),

            // Revenue from subscriptions
            db
              .select({
                total: sql<number>`COALESCE(SUM(CAST(${organizationSubscriptions.amount} AS DECIMAL)), 0)`,
              })
              .from(organizationSubscriptions)
              .where(
                and(
                  eq(organizationSubscriptions.organizationId, org.id),
                  eq(organizationSubscriptions.status, 'active')
                )
              ),

            // Occupancy data
            db
              .select({
                totalCapacity: sql<number>`COALESCE(SUM(${properties.totalUnits}), 0)`,
                occupiedUnits: sql<number>`COALESCE(SUM(${properties.occupiedUnits}), 0)`,
              })
              .from(properties)
              .where(
                and(
                  eq(properties.organizationId, org.id),
                  eq(properties.status, 'active')
                )
              ),

            // Response time
            db
              .select({
                avgResponseTime: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${incidents.resolvedAt} - ${incidents.createdAt}))), 0)`,
              })
              .from(incidents)
              .where(
                and(
                  eq(incidents.organizationId, org.id),
                  gte(incidents.createdAt, startDate),
                  eq(incidents.severity, 'critical'),
                  sql`${incidents.resolvedAt} IS NOT NULL`
                )
              ),

            // Satisfaction score (placeholder - would come from survey data)
            Promise.resolve([{ avgSatisfaction: 0 }]),
          ]);

          const occupancyRate =
            occupancyData[0].totalCapacity > 0
              ? (occupancyData[0].occupiedUnits /
                  occupancyData[0].totalCapacity) *
                100
              : 0;

          return {
            organizationId: org.id,
            organizationName: org.name,
            residents: residentCount[0].count,
            properties: propertyCount[0].count,
            incidents: incidentCount[0].count,
            revenue: parseFloat(
              subscriptionRevenue[0].total?.toString() || '0'
            ),
            occupancyRate: Math.round(occupancyRate * 100) / 100,
            responseTime: Math.round(responseTimeData[0].avgResponseTime || 0),
            satisfactionScore: satisfactionData[0].avgSatisfaction || 0,
          };
        })
      );

      return organizationMetrics;
    } catch (error) {
      console.error('Organization breakdowns aggregation error:', error);
      throw new Error('Failed to aggregate organization breakdown data');
    }
  }

  // Get historical trend data for platform analytics
  static async getHistoricalTrends(months: number = 12): Promise<{
    residentTrends: Array<{ month: string; count: number }>;
    revenueTrends: Array<{ month: string; revenue: number }>;
    incidentTrends: Array<{ month: string; incidents: number }>;
    occupancyTrends: Array<{ month: string; occupancy: number }>;
  }> {
    try {
      const monthlyData = [];

      for (let i = 0; i < months; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthLabel = monthStart.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
        });

        const [residents, revenue, incidents, occupancy] = await Promise.all([
          db
            .select({ count: count() })
            .from(residents)
            .where(
              and(
                gte(residents.createdAt, monthStart),
                lte(residents.createdAt, monthEnd),
                eq(residents.status, 'active')
              )
            ),

          db
            .select({
              total: sql<number>`COALESCE(SUM(CAST(${organizationSubscriptions.amount} AS DECIMAL)), 0)`,
            })
            .from(organizationSubscriptions)
            .where(
              and(
                gte(organizationSubscriptions.createdAt, monthStart),
                lte(organizationSubscriptions.createdAt, monthEnd),
                eq(organizationSubscriptions.status, 'active')
              )
            ),

          db
            .select({ count: count() })
            .from(incidents)
            .where(
              and(
                gte(incidents.createdAt, monthStart),
                lte(incidents.createdAt, monthEnd)
              )
            ),

          db
            .select({
              totalCapacity: sql<number>`COALESCE(SUM(${properties.totalUnits}), 0)`,
              occupiedUnits: sql<number>`COALESCE(SUM(${properties.occupiedUnits}), 0)`,
            })
            .from(properties)
            .where(
              and(
                gte(properties.createdAt, monthStart),
                lte(properties.createdAt, monthEnd),
                eq(properties.status, 'active')
              )
            ),
        ]);

        const occupancyRate =
          occupancy[0].totalCapacity > 0
            ? (occupancy[0].occupiedUnits / occupancy[0].totalCapacity) * 100
            : 0;

        monthlyData.push({
          month: monthLabel,
          residents: residents[0].count,
          revenue: parseFloat(revenue[0].total?.toString() || '0'),
          incidents: incidents[0].count,
          occupancy: Math.round(occupancyRate * 100) / 100,
        });
      }

      return {
        residentTrends: monthlyData
          .map(d => ({ month: d.month, count: d.residents }))
          .reverse(),
        revenueTrends: monthlyData
          .map(d => ({ month: d.month, revenue: d.revenue }))
          .reverse(),
        incidentTrends: monthlyData
          .map(d => ({ month: d.month, incidents: d.incidents }))
          .reverse(),
        occupancyTrends: monthlyData
          .map(d => ({ month: d.month, occupancy: d.occupancy }))
          .reverse(),
      };
    } catch (error) {
      console.error('Historical trends aggregation error:', error);
      throw new Error('Failed to aggregate historical trend data');
    }
  }

  // Get real-time aggregated dashboard metrics
  static async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    totalMaintenanceCosts: number;
    averageSatisfactionScore: number;
    criticalIncidents: number;
    supportPlanCompletion: number;
    platformUptime: number;
  }> {
    try {
      const [
        activeUsers,
        maintenanceCosts,
        criticalIncidents,
        supportPlanStats,
        satisfactionScore,
      ] = await Promise.all([
        // Active users in last 24 hours
        db
          .select({ count: count() })
          .from(users)
          .where(
            and(
              gte(users.lastLogin, new Date(Date.now() - 24 * 60 * 60 * 1000)),
              eq(users.isActive, true)
            )
          ),

        // Total maintenance costs (last 30 days)
        db
          .select({
            total: sql<number>`COALESCE(SUM(CAST(${maintenanceRequests.estimatedCost} AS DECIMAL)), 0)`,
          })
          .from(maintenanceRequests)
          .where(
            gte(
              maintenanceRequests.createdAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
          ),

        // Critical incidents (last 7 days)
        db
          .select({ count: count() })
          .from(incidents)
          .where(
            and(
              gte(
                incidents.createdAt,
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ),
              eq(incidents.severity, 'critical')
            )
          ),

        // Support plan completion rate
        db
          .select({
            total: count(),
            completed: sql<number>`SUM(CASE WHEN ${supportPlans.status} = 'completed' THEN 1 ELSE 0 END)`,
          })
          .from(supportPlans)
          .where(
            gte(
              supportPlans.createdAt,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
          ),

        // Average satisfaction score (placeholder)
        Promise.resolve([{ avgSatisfaction: 4.2 }]),
      ]);

      const supportPlanCompletion =
        supportPlanStats[0].total > 0
          ? (supportPlanStats[0].completed / supportPlanStats[0].total) * 100
          : 0;

      return {
        activeUsers: activeUsers[0].count,
        totalMaintenanceCosts: parseFloat(
          maintenanceCosts[0].total?.toString() || '0'
        ),
        averageSatisfactionScore: satisfactionScore[0].avgSatisfaction,
        criticalIncidents: criticalIncidents[0].count,
        supportPlanCompletion: Math.round(supportPlanCompletion * 100) / 100,
        platformUptime: 99.9, // Would be calculated from actual monitoring data
      };
    } catch (error) {
      console.error('Real-time metrics aggregation error:', error);
      throw new Error('Failed to aggregate real-time metrics');
    }
  }

  // Helper method to convert time range string to milliseconds
  private static getTimeRangeMs(timeRange: string): number {
    const timeRangeMap: { [key: string]: number } = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
    };

    return timeRangeMap[timeRange] || timeRangeMap['30d'];
  }
}

// Data integrity validator for aggregated data
export class AggregatedDataValidator {
  // Validate data consistency across organizations
  static async validateDataConsistency(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check for orphaned records
      const orphanedResidents = await db
        .select({ count: count() })
        .from(residents)
        .leftJoin(organizations, eq(residents.organizationId, organizations.id))
        .where(sql`${organizations.id} IS NULL`);

      if (orphanedResidents[0].count > 0) {
        issues.push(
          `${orphanedResidents[0].count} residents have invalid organization references`
        );
      }

      const orphanedProperties = await db
        .select({ count: count() })
        .from(properties)
        .leftJoin(
          organizations,
          eq(properties.organizationId, organizations.id)
        )
        .where(sql`${organizations.id} IS NULL`);

      if (orphanedProperties[0].count > 0) {
        issues.push(
          `${orphanedProperties[0].count} properties have invalid organization references`
        );
      }

      // Check subscription consistency
      const invalidSubscriptions = await db
        .select({ count: count() })
        .from(organizationSubscriptions)
        .leftJoin(
          organizations,
          eq(organizationSubscriptions.organizationId, organizations.id)
        )
        .where(sql`${organizations.id} IS NULL`);

      if (invalidSubscriptions[0].count > 0) {
        issues.push(
          `${invalidSubscriptions[0].count} subscriptions have invalid organization references`
        );
      }

      return {
        valid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error('Data consistency validation error:', error);
      return {
        valid: false,
        issues: ['Data consistency validation failed'],
      };
    }
  }

  // Performance check for aggregation queries
  static async checkAggregationPerformance(): Promise<{
    performant: boolean;
    slowQueries: string[];
  }> {
    const slowQueries: string[] = [];
    const performanceThreshold = 5000; // 5 seconds

    try {
      // Test key aggregation queries
      const tests = [
        {
          name: 'Platform Overview',
          test: () => PlatformDataAggregator.getPlatformOverview(),
        },
        {
          name: 'Organization Breakdowns',
          test: () => PlatformDataAggregator.getOrganizationBreakdowns(),
        },
        {
          name: 'Real-time Metrics',
          test: () => PlatformDataAggregator.getRealTimeMetrics(),
        },
      ];

      for (const test of tests) {
        const startTime = Date.now();
        await test.test();
        const duration = Date.now() - startTime;

        if (duration > performanceThreshold) {
          slowQueries.push(`${test.name}: ${duration}ms`);
        }
      }

      return {
        performant: slowQueries.length === 0,
        slowQueries,
      };
    } catch (error) {
      console.error('Performance check error:', error);
      return {
        performant: false,
        slowQueries: ['Performance check failed'],
      };
    }
  }
}

// Export aggregated data with proper privacy controls
export class SecureDataExporter {
  // Export aggregated data without exposing sensitive information
  static async exportAggregatedReport(
    format: 'csv' | 'json' = 'json'
  ): Promise<{
    data: any;
    filename: string;
  }> {
    try {
      const [overview, breakdowns, trends, metrics] = await Promise.all([
        PlatformDataAggregator.getPlatformOverview(),
        PlatformDataAggregator.getOrganizationBreakdowns(),
        PlatformDataAggregator.getHistoricalTrends(),
        PlatformDataAggregator.getRealTimeMetrics(),
      ]);

      // Sanitize data for export (remove sensitive information)
      const sanitizedBreakdowns = breakdowns.map(org => ({
        organizationName: org.organizationName,
        residents: org.residents,
        properties: org.properties,
        incidents: org.incidents,
        occupancyRate: org.occupancyRate,
        responseTime: org.responseTime,
        satisfactionScore: org.satisfactionScore,
        // Exclude revenue and other sensitive data
      }));

      const exportData = {
        generatedAt: new Date().toISOString(),
        platformOverview: {
          totalOrganizations: overview.totalOrganizations,
          totalResidents: overview.totalResidents,
          totalProperties: overview.totalProperties,
          totalIncidents: overview.totalIncidents,
          occupancyRate: overview.occupancyRate,
          averageResponseTime: overview.averageResponseTime,
          platformHealth: overview.platformHealth,
        },
        organizationBreakdowns: sanitizedBreakdowns,
        historicalTrends: trends,
        realTimeMetrics: {
          activeUsers: metrics.activeUsers,
          criticalIncidents: metrics.criticalIncidents,
          supportPlanCompletion: metrics.supportPlanCompletion,
          platformUptime: metrics.platformUptime,
        },
      };

      const filename = `platform-analytics-${new Date().toISOString().split('T')[0]}.${format}`;

      return {
        data: exportData,
        filename,
      };
    } catch (error) {
      console.error('Data export error:', error);
      throw new Error('Failed to export aggregated data');
    }
  }
}
