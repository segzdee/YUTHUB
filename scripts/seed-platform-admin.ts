#!/usr/bin/env npx tsx

import { db } from '../server/db';
import { users, organizations, organizationSubscriptions, subscriptionPlans, auditLogs } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedPlatformAdminData() {
  console.log('🌱 Seeding Platform Admin Test Data...');
  
  try {
    // 1. Create a test platform admin user
    const testAdmin = {
      id: 'platform-admin-test',
      email: 'admin@yuthub.platform',
      firstName: 'Platform',
      lastName: 'Administrator',
      role: 'platform_admin',
      department: 'Platform Operations',
      employeeId: 'PA001',
      authMethod: 'OIDC',
      mfaEnabled: true,
      mfaSecret: 'test-secret-' + Date.now(),
      accountLocked: false,
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      emailVerified: true,
      isActive: true,
      subscriptionTier: 'enterprise',
      subscriptionStatus: 'active',
      maxResidents: 999999,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.id, testAdmin.id));
    if (existingAdmin.length === 0) {
      await db.insert(users).values(testAdmin);
      console.log('✅ Created test platform admin user');
    } else {
      console.log('ℹ️  Test platform admin user already exists');
    }

    // 2. Create test organizations
    const testOrganizations = [
      {
        name: 'Test Council North',
        organizationType: 'local_authority',
        contactEmail: 'contact@testnorth.gov.uk',
        contactPhone: '01234 567890',
        address: '123 Test Street, Test City, TC1 2AB',
        website: 'https://testnorth.gov.uk',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Council South',
        organizationType: 'local_authority',
        contactEmail: 'contact@testsouth.gov.uk',
        contactPhone: '01234 567891',
        address: '456 Test Avenue, Test Town, TC2 3CD',
        website: 'https://testsouth.gov.uk',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const org of testOrganizations) {
      const existing = await db.select().from(organizations).where(eq(organizations.name, org.name));
      if (existing.length === 0) {
        await db.insert(organizations).values(org);
        console.log(`✅ Created test organization: ${org.name}`);
      } else {
        console.log(`ℹ️  Test organization already exists: ${org.name}`);
      }
    }

    // 3. Create test subscription plan
    const testPlan = {
      planName: 'professional',
      displayName: 'Professional Plan',
      description: 'Professional tier for local authorities',
      monthlyPrice: '149.00',
      annualPrice: '1491.00',
      annualDiscountPercent: 15,
      maxResidents: 100,
      maxProperties: 50,
      maxUsers: 10,
      maxApiCalls: 50000,
      maxStorage: 100,
      features: JSON.stringify(['advanced_reporting', 'api_access', 'multi_property']),
      isActive: true,
      sortOrder: 2,
      trialDays: 14,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.planName, testPlan.planName));
    if (existingPlan.length === 0) {
      await db.insert(subscriptionPlans).values(testPlan);
      console.log('✅ Created test subscription plan');
    } else {
      console.log('ℹ️  Test subscription plan already exists');
    }

    // 4. Create test organization subscriptions
    const orgs = await db.select().from(organizations).limit(2);
    const plans = await db.select().from(subscriptionPlans).limit(1);
    
    if (orgs.length > 0 && plans.length > 0) {
      const testSubscription = {
        organizationId: orgs[0].id,
        planId: plans[0].id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        billingCycle: 'monthly',
        amount: '149.00',
        currency: 'GBP',
        autoRenew: true,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const existingSub = await db.select().from(organizationSubscriptions).where(eq(organizationSubscriptions.organizationId, orgs[0].id));
      if (existingSub.length === 0) {
        await db.insert(organizationSubscriptions).values(testSubscription);
        console.log('✅ Created test organization subscription');
      } else {
        console.log('ℹ️  Test organization subscription already exists');
      }
    }

    // 5. Create test audit log entries
    const testAuditLogs = [
      {
        id: 'audit-1-' + Date.now(),
        userId: testAdmin.id,
        action: 'platform_admin_login',
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Test Browser' }),
        timestamp: new Date(),
        riskLevel: 'low' as const,
        metadata: { source: 'platform_admin_test' }
      },
      {
        id: 'audit-2-' + Date.now(),
        userId: testAdmin.id,
        action: 'organization_view',
        details: JSON.stringify({ organizationId: orgs[0]?.id || 1 }),
        timestamp: new Date(),
        riskLevel: 'low' as const,
        metadata: { source: 'platform_admin_test' }
      }
    ];

    for (const log of testAuditLogs) {
      await db.insert(auditLogs).values(log);
    }
    console.log('✅ Created test audit log entries');

    console.log('\n🎉 Platform Admin test data seeded successfully!');
    console.log('\nTest Platform Admin User:');
    console.log(`  Email: ${testAdmin.email}`);
    console.log(`  Role: ${testAdmin.role}`);
    console.log(`  MFA Enabled: ${testAdmin.mfaEnabled}`);
    console.log(`  Status: ${testAdmin.isActive ? 'Active' : 'Inactive'}`);

    console.log('\nTest Organizations:');
    for (const org of testOrganizations) {
      console.log(`  - ${org.name} (${org.status})`);
    }

    console.log('\nRun validation again: npx tsx scripts/validate-platform-admin.ts');

  } catch (error) {
    console.error('❌ Error seeding platform admin data:', error);
    process.exit(1);
  }
}

seedPlatformAdminData().catch(console.error);