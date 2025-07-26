#!/usr/bin/env node

/**
 * YUTHUB Database Validation Script
 * 
 * This script validates that all required database tables exist and are properly
 * structured according to the comprehensive audit requirements.
 * 
 * Usage: node scripts/validate-database-structure.js
 */

import { db } from "../server/db.js";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema.js";

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper function for colored output
const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Required table definitions with expected column counts
const REQUIRED_TABLES = {
  // Core Application Tables
  'users': { minColumns: 30, category: 'Core Authentication' },
  'sessions': { minColumns: 3, category: 'Core Authentication' },
  'properties': { minColumns: 8, category: 'Core Application' },
  'residents': { minColumns: 15, category: 'Core Application' },
  'incidents': { minColumns: 11, category: 'Core Application' },
  'financial_records': { minColumns: 12, category: 'Core Application' },
  'support_plans': { minColumns: 8, category: 'Core Application' },
  'maintenance_requests': { minColumns: 18, category: 'Core Application' },
  'activities': { minColumns: 7, category: 'Core Application' },
  'invoices': { minColumns: 16, category: 'Core Application' },
  'audit_logs': { minColumns: 10, category: 'Core Application' },
  
  // Platform Admin Tables
  'subscription_plans': { minColumns: 17, category: 'Platform Admin' },
  'organizations': { minColumns: 18, category: 'Platform Admin' },
  'organization_subscriptions': { minColumns: 19, category: 'Platform Admin' },
  'platform_users': { minColumns: 12, category: 'Platform Admin' },
  'usage_tracking': { minColumns: 11, category: 'Platform Admin' },
  'platform_audit_logs': { minColumns: 11, category: 'Platform Admin' },
  'system_metrics': { minColumns: 6, category: 'Platform Admin' },
  'feature_toggles': { minColumns: 9, category: 'Platform Admin' },
  'payment_transactions': { minColumns: 16, category: 'Platform Admin' },
  
  // Authentication Tables
  'user_auth_methods': { minColumns: 11, category: 'Authentication' },
  'user_sessions': { minColumns: 8, category: 'Authentication' },
  'auth_audit_log': { minColumns: 10, category: 'Authentication' },
  'api_tokens': { minColumns: 8, category: 'Authentication' },
  'account_lockouts': { minColumns: 8, category: 'Authentication' },
  
  // Extended Housing Management
  'document_storage': { minColumns: 20, category: 'Document Management' },
  'file_sharing': { minColumns: 9, category: 'Document Management' },
  'communication_logs': { minColumns: 12, category: 'Communication' },
  'calendar_events': { minColumns: 17, category: 'Scheduling' },
  'risk_assessments': { minColumns: 15, category: 'Risk Management' },
  'emergency_contacts': { minColumns: 13, category: 'Emergency Response' },
  'move_records': { minColumns: 16, category: 'Tenancy Management' },
  'rent_payments': { minColumns: 15, category: 'Financial Management' },
  'contractors': { minColumns: 16, category: 'Maintenance' },
  'inspections': { minColumns: 15, category: 'Compliance' },
  'notifications': { minColumns: 14, category: 'System Management' },
  
  // Billing System
  'government_clients': { minColumns: 11, category: 'Government Billing' },
  'billing_periods': { minColumns: 13, category: 'Government Billing' },
  'invoice_line_items': { minColumns: 8, category: 'Government Billing' },
  
  // Additional Management Tables
  'property_rooms': { minColumns: 11, category: 'Property Management' },
  'staff_members': { minColumns: 15, category: 'Staff Management' },
  'tenancy_agreements': { minColumns: 15, category: 'Legal Documentation' },
  'assessment_forms': { minColumns: 10, category: 'Assessment' },
  'progress_tracking': { minColumns: 12, category: 'Progress Monitoring' },
  'referrals': { minColumns: 15, category: 'External Services' },
  'outcomes_tracking': { minColumns: 16, category: 'Performance Metrics' }
};

// Critical foreign key relationships to verify
const CRITICAL_FOREIGN_KEYS = [
  { table: 'residents', column: 'property_id', references: 'properties.id' },
  { table: 'residents', column: 'key_worker_id', references: 'users.id' },
  { table: 'incidents', column: 'property_id', references: 'properties.id' },
  { table: 'incidents', column: 'resident_id', references: 'residents.id' },
  { table: 'support_plans', column: 'resident_id', references: 'residents.id' },
  { table: 'financial_records', column: 'property_id', references: 'properties.id' },
  { table: 'organization_subscriptions', column: 'organization_id', references: 'organizations.id' },
  { table: 'platform_users', column: 'user_id', references: 'users.id' },
  { table: 'user_auth_methods', column: 'user_id', references: 'users.id' },
  { table: 'maintenance_requests', column: 'property_id', references: 'properties.id' }
];

// Critical indexes for performance
const CRITICAL_INDEXES = [
  'idx_residents_property_id',
  'idx_residents_key_worker_id', 
  'idx_incidents_severity',
  'idx_financial_records_date',
  'idx_organization_subscriptions_organization_id',
  'idx_user_auth_methods_user_id',
  'idx_activities_created_at',
  'idx_audit_logs_timestamp'
];

class DatabaseValidator {
  constructor() {
    this.results = {
      tables: { passed: 0, failed: 0, details: [] },
      foreignKeys: { passed: 0, failed: 0, details: [] },
      indexes: { passed: 0, failed: 0, details: [] },
      connectivity: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] }
    };
  }

  async validateDatabaseConnectivity() {
    log('blue', '\n🔌 Testing Database Connectivity...');
    
    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1 as test`);
      const duration = Date.now() - start;
      
      log('green', `✅ Database connection successful (${duration}ms)`);
      this.results.connectivity.passed++;
      
      if (duration < 100) {
        log('green', '✅ Excellent response time');
        this.results.performance.passed++;
      } else if (duration < 500) {
        log('yellow', '⚠️  Good response time');
        this.results.performance.passed++;
      } else {
        log('yellow', '⚠️  Slow response time - consider optimization');
        this.results.performance.failed++;
      }
      
    } catch (error) {
      log('red', `❌ Database connection failed: ${error.message}`);
      this.results.connectivity.failed++;
      throw error;
    }
  }

  async validateTableStructure() {
    log('blue', '\n📋 Validating Table Structure...');
    
    try {
      // Get all tables with column counts
      const tableInfo = await db.execute(sql`
        SELECT 
          table_name,
          COUNT(column_name) as column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        GROUP BY table_name
        ORDER BY table_name
      `);

      const existingTables = {};
      tableInfo.forEach(row => {
        existingTables[row.table_name] = parseInt(row.column_count);
      });

      // Check each required table
      const categories = {};
      
      for (const [tableName, requirements] of Object.entries(REQUIRED_TABLES)) {
        const category = requirements.category;
        if (!categories[category]) categories[category] = { passed: 0, failed: 0 };
        
        if (existingTables[tableName]) {
          const actualColumns = existingTables[tableName];
          if (actualColumns >= requirements.minColumns) {
            log('green', `✅ ${tableName} (${actualColumns} columns)`);
            this.results.tables.passed++;
            categories[category].passed++;
          } else {
            log('yellow', `⚠️  ${tableName} (${actualColumns}/${requirements.minColumns} columns - missing columns)`);
            this.results.tables.failed++;
            categories[category].failed++;
          }
        } else {
          log('red', `❌ ${tableName} - TABLE MISSING`);
          this.results.tables.failed++;
          categories[category].failed++;
        }
      }

      // Summary by category
      log('blue', '\n📊 Table Structure Summary by Category:');
      for (const [category, stats] of Object.entries(categories)) {
        const total = stats.passed + stats.failed;
        const percentage = Math.round((stats.passed / total) * 100);
        const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
        log('blue', `${status} ${category}: ${stats.passed}/${total} tables (${percentage}%)`);
      }

    } catch (error) {
      log('red', `❌ Table structure validation failed: ${error.message}`);
      this.results.tables.failed++;
    }
  }

  async validateForeignKeys() {
    log('blue', '\n🔗 Validating Foreign Key Relationships...');
    
    try {
      // Get all foreign key constraints
      const foreignKeys = await db.execute(sql`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, kcu.column_name
      `);

      const existingFKs = foreignKeys.map(fk => 
        `${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`
      );

      // Check critical foreign keys
      for (const fk of CRITICAL_FOREIGN_KEYS) {
        const fkString = `${fk.table}.${fk.column} -> ${fk.references}`;
        if (existingFKs.some(existing => existing === fkString)) {
          log('green', `✅ ${fkString}`);
          this.results.foreignKeys.passed++;
        } else {
          log('red', `❌ Missing: ${fkString}`);
          this.results.foreignKeys.failed++;
        }
      }

      log('blue', `\n📊 Foreign Key Summary: ${foreignKeys.length} total relationships found`);

    } catch (error) {
      log('red', `❌ Foreign key validation failed: ${error.message}`);
      this.results.foreignKeys.failed++;
    }
  }

  async validateIndexes() {
    log('blue', '\n🚀 Validating Performance Indexes...');
    
    try {
      // Get all indexes
      const indexes = await db.execute(sql`
        SELECT 
          indexname as index_name,
          tablename as table_name
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname NOT LIKE '%_pkey'
        ORDER BY tablename, indexname
      `);

      const existingIndexes = indexes.map(idx => idx.index_name);
      
      // Check critical indexes
      for (const indexName of CRITICAL_INDEXES) {
        if (existingIndexes.includes(indexName)) {
          log('green', `✅ ${indexName}`);
          this.results.indexes.passed++;
        } else {
          log('yellow', `⚠️  Missing: ${indexName}`);
          this.results.indexes.failed++;
        }
      }

      log('blue', `\n📊 Index Summary: ${indexes.length} total indexes found`);

    } catch (error) {
      log('red', `❌ Index validation failed: ${error.message}`);
      this.results.indexes.failed++;
    }
  }

  async validateDataIntegrity() {
    log('blue', '\n🔍 Validating Data Integrity...');
    
    try {
      // Test basic queries on core tables
      const coreTableTests = [
        { name: 'users', query: () => db.execute(sql`SELECT COUNT(*) as count FROM users`) },
        { name: 'properties', query: () => db.execute(sql`SELECT COUNT(*) as count FROM properties`) },
        { name: 'residents', query: () => db.execute(sql`SELECT COUNT(*) as count FROM residents`) },
        { name: 'organizations', query: () => db.execute(sql`SELECT COUNT(*) as count FROM organizations`) }
      ];

      for (const test of coreTableTests) {
        try {
          const result = await test.query();
          const count = result[0]?.count || 0;
          log('green', `✅ ${test.name}: ${count} records`);
          this.results.performance.passed++;
        } catch (error) {
          log('red', `❌ ${test.name}: Query failed - ${error.message}`);
          this.results.performance.failed++;
        }
      }

    } catch (error) {
      log('red', `❌ Data integrity validation failed: ${error.message}`);
      this.results.performance.failed++;
    }
  }

  calculateOverallScore() {
    const total = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed + category.failed, 0
    );
    const passed = Object.values(this.results).reduce((sum, category) => 
      sum + category.passed, 0
    );
    
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  }

  printSummary() {
    log('blue', '\n' + '='.repeat(60));
    log('bold', '📊 DATABASE VALIDATION SUMMARY');
    log('blue', '='.repeat(60));

    const categories = [
      { name: 'Connectivity', ...this.results.connectivity },
      { name: 'Table Structure', ...this.results.tables },
      { name: 'Foreign Keys', ...this.results.foreignKeys },
      { name: 'Performance Indexes', ...this.results.indexes },
      { name: 'Data Integrity', ...this.results.performance }
    ];

    categories.forEach(category => {
      const total = category.passed + category.failed;
      const percentage = total > 0 ? Math.round((category.passed / total) * 100) : 0;
      const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      
      log('blue', `${status} ${category.name}: ${category.passed}/${total} (${percentage}%)`);
    });

    const overallScore = this.calculateOverallScore();
    log('blue', '\n' + '='.repeat(60));
    
    if (overallScore >= 95) {
      log('green', `🎉 EXCELLENT: Database validation score ${overallScore}%`);
      log('green', '✅ Database is production-ready with excellent configuration');
    } else if (overallScore >= 90) {
      log('green', `✅ VERY GOOD: Database validation score ${overallScore}%`);
      log('green', '✅ Database is production-ready with minor optimizations needed');
    } else if (overallScore >= 80) {
      log('yellow', `⚠️  GOOD: Database validation score ${overallScore}%`);
      log('yellow', '⚠️  Database needs some improvements before production');
    } else {
      log('red', `❌ NEEDS WORK: Database validation score ${overallScore}%`);
      log('red', '❌ Database requires significant improvements');
    }

    log('blue', '='.repeat(60));
  }

  async run() {
    log('bold', '🔍 YUTHUB Database Validation');
    log('blue', 'Validating database structure, relationships, and performance...\n');

    try {
      await this.validateDatabaseConnectivity();
      await this.validateTableStructure();
      await this.validateForeignKeys();
      await this.validateIndexes();
      await this.validateDataIntegrity();
      
      this.printSummary();
      
      const overallScore = this.calculateOverallScore();
      process.exit(overallScore >= 80 ? 0 : 1);
      
    } catch (error) {
      log('red', `\n❌ Validation failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Handle environment check
if (!process.env.DATABASE_URL) {
  log('red', '❌ DATABASE_URL environment variable is not set');
  log('yellow', 'Please ensure your database is configured before running validation');
  process.exit(1);
}

// Run validation
const validator = new DatabaseValidator();
validator.run().catch(error => {
  log('red', `Fatal error: ${error.message}`);
  process.exit(1);
});
