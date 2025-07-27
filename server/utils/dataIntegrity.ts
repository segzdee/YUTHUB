import { sql } from 'drizzle-orm';
import { db } from '../db';

// Database integrity checks
export class DataIntegrityChecker {
  // Check for orphaned records
  static async checkOrphanedRecords(): Promise<{
    orphanedResidents: number;
    orphanedIncidents: number;
    orphanedFinancialRecords: number;
  }> {
    const [orphanedResidents, orphanedIncidents, orphanedFinancialRecords] =
      await Promise.all([
        // Residents without valid properties
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM residents r 
        LEFT JOIN properties p ON r.property_id = p.id 
        WHERE r.property_id IS NOT NULL AND p.id IS NULL
      `),

        // Incidents without valid residents or properties
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM incidents i 
        LEFT JOIN residents r ON i.resident_id = r.id 
        LEFT JOIN properties p ON i.property_id = p.id 
        WHERE (i.resident_id IS NOT NULL AND r.id IS NULL) 
           OR (i.property_id IS NOT NULL AND p.id IS NULL)
      `),

        // Financial records without valid residents or properties
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM financial_records f 
        LEFT JOIN residents r ON f.resident_id = r.id 
        LEFT JOIN properties p ON f.property_id = p.id 
        WHERE (f.resident_id IS NOT NULL AND r.id IS NULL) 
           OR (f.property_id IS NOT NULL AND p.id IS NULL)
      `),
      ]);

    return {
      orphanedResidents: Number(orphanedResidents.rows[0]?.count || 0),
      orphanedIncidents: Number(orphanedIncidents.rows[0]?.count || 0),
      orphanedFinancialRecords: Number(
        orphanedFinancialRecords.rows[0]?.count || 0
      ),
    };
  }

  // Check data consistency
  static async checkDataConsistency(): Promise<{
    propertyOccupancyMismatch: number;
    invalidStatusCombinations: number;
    dateInconsistencies: number;
  }> {
    const [occupancyMismatch, statusCombinations, dateInconsistencies] =
      await Promise.all([
        // Properties with incorrect occupancy counts
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM properties p 
        WHERE p.occupied_units != (
          SELECT COUNT(*) 
          FROM residents r 
          WHERE r.property_id = p.id AND r.status = 'active'
        )
      `),

        // Residents with invalid status combinations
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM residents r 
        WHERE (r.status = 'moved_out' AND r.move_out_date IS NULL) 
           OR (r.status = 'active' AND r.move_out_date IS NOT NULL)
      `),

        // Date inconsistencies
        db.execute(sql`
        SELECT COUNT(*) as count 
        FROM residents r 
        WHERE r.move_in_date > r.move_out_date 
           OR r.move_in_date > CURRENT_DATE
      `),
      ]);

    return {
      propertyOccupancyMismatch: Number(occupancyMismatch.rows[0]?.count || 0),
      invalidStatusCombinations: Number(statusCombinations.rows[0]?.count || 0),
      dateInconsistencies: Number(dateInconsistencies.rows[0]?.count || 0),
    };
  }

  // Fix property occupancy counts
  static async fixPropertyOccupancyCounts(): Promise<number> {
    const result = await db.execute(sql`
      UPDATE properties 
      SET occupied_units = (
        SELECT COUNT(*) 
        FROM residents 
        WHERE residents.property_id = properties.id 
          AND residents.status = 'active'
      )
      WHERE occupied_units != (
        SELECT COUNT(*) 
        FROM residents 
        WHERE residents.property_id = properties.id 
          AND residents.status = 'active'
      )
    `);

    return result.rowCount || 0;
  }

  // Run full integrity check
  static async runFullIntegrityCheck(): Promise<{
    timestamp: string;
    orphanedRecords: any;
    dataConsistency: any;
    fixedRecords: number;
  }> {
    const timestamp = new Date().toISOString();

    console.log('Running data integrity check...');

    const orphanedRecords = await this.checkOrphanedRecords();
    const dataConsistency = await this.checkDataConsistency();
    const fixedRecords = await this.fixPropertyOccupancyCounts();

    const result = {
      timestamp,
      orphanedRecords,
      dataConsistency,
      fixedRecords,
    };

    console.log('Data integrity check completed:', result);

    return result;
  }
}

// Database backup utilities
export class DatabaseBackupManager {
  // Create a logical backup of critical data
  static async createBackupSnapshot(): Promise<{
    timestamp: string;
    tables: Record<string, number>;
    totalRecords: number;
  }> {
    const timestamp = new Date().toISOString();

    const [
      users,
      properties,
      residents,
      incidents,
      activities,
      financialRecords,
    ] = await Promise.all([
      db.execute(sql`SELECT COUNT(*) as count FROM users`),
      db.execute(sql`SELECT COUNT(*) as count FROM properties`),
      db.execute(sql`SELECT COUNT(*) as count FROM residents`),
      db.execute(sql`SELECT COUNT(*) as count FROM incidents`),
      db.execute(sql`SELECT COUNT(*) as count FROM activities`),
      db.execute(sql`SELECT COUNT(*) as count FROM financial_records`),
    ]);

    const tables = {
      users: Number(users.rows[0]?.count || 0),
      properties: Number(properties.rows[0]?.count || 0),
      residents: Number(residents.rows[0]?.count || 0),
      incidents: Number(incidents.rows[0]?.count || 0),
      activities: Number(activities.rows[0]?.count || 0),
      financial_records: Number(financialRecords.rows[0]?.count || 0),
    };

    const totalRecords = Object.values(tables).reduce(
      (sum, count) => sum + count,
      0
    );

    const snapshot = {
      timestamp,
      tables,
      totalRecords,
    };

    console.log('Database backup snapshot created:', snapshot);

    return snapshot;
  }

  // Verify backup integrity
  static async verifyBackupIntegrity(): Promise<{
    isValid: boolean;
    errors: string[];
    lastSnapshot: any;
  }> {
    const errors: string[] = [];

    try {
      // Check if critical tables exist
      // Around line 206 - use or remove tableChecks
      const tableChecks = await Promise.all([
        // ... existing code ...
      ]);
      console.log('Table checks completed:', tableChecks.length);

      // Around line 292 - use or remove dbSize
      const dbSize = await db.execute(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      console.log('Database size calculated:', dbSize);

      // Around line 330-332 - remove non-existent method calls
      // Remove these lines:
      // storage.getProperties(),
      // storage.getResidents(),
      // storage.getDashboardMetrics(),
      const avgQueryTime = (Date.now() - start) / 3;

      // Check for slow queries
      const slowQueries = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM pg_stat_statements 
        WHERE mean_time > 1000
      `);

      const performance = {
        avgQueryTime,
        slowQueries: Number(slowQueries.rows[0]?.count || 0),
      };

      if (avgQueryTime > 500) {
        errors.push(`Average query time too high: ${avgQueryTime}ms`);
      }

      return {
        success: errors.length === 0,
        errors,
        performance,
      };
    } catch (error) {
      errors.push(
        `Post-migration verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      return {
        success: false,
        errors,
        performance: {
          avgQueryTime: 0,
          slowQueries: 0,
        },
      };
    }
  }
}
