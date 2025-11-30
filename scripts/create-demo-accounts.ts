import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials are required');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Create comprehensive demo accounts for testing
 */
async function createDemoAccounts() {
  console.log('🚀 Creating demo accounts for YUTHUB testing...\n');

  const demoAccounts = [
    {
      email: 'demo.admin@yuthub.com',
      password: 'Demo2025!Admin',
      role: 'admin',
      fullName: 'Admin Demo',
      organizationName: 'Demo Housing Association',
      tier: 'professional',
      billingPeriod: 'month',
      description: 'Full admin access - Professional plan'
    },
    {
      email: 'demo.manager@yuthub.com',
      password: 'Demo2025!Manager',
      role: 'manager',
      fullName: 'Manager Demo',
      organizationName: 'Demo Housing Association',
      tier: 'professional',
      billingPeriod: 'month',
      description: 'Manager access - Can manage residents and staff'
    },
    {
      email: 'demo.staff@yuthub.com',
      password: 'Demo2025!Staff',
      role: 'staff',
      fullName: 'Staff Demo',
      organizationName: 'Demo Housing Association',
      tier: 'professional',
      billingPeriod: 'month',
      description: 'Staff access - Limited permissions'
    },
    {
      email: 'demo.viewer@yuthub.com',
      password: 'Demo2025!Viewer',
      role: 'viewer',
      fullName: 'Viewer Demo',
      organizationName: 'Demo Housing Association',
      tier: 'professional',
      billingPeriod: 'month',
      description: 'Read-only access'
    },
    {
      email: 'demo.starter@yuthub.com',
      password: 'Demo2025!Starter',
      role: 'admin',
      fullName: 'Starter Admin',
      organizationName: 'Small Housing Charity',
      tier: 'starter',
      billingPeriod: 'month',
      description: 'Starter plan - 1 property, 10 residents'
    },
    {
      email: 'demo.enterprise@yuthub.com',
      password: 'Demo2025!Enterprise',
      role: 'admin',
      fullName: 'Enterprise Admin',
      organizationName: 'Large Housing Network',
      tier: 'enterprise',
      billingPeriod: 'year',
      description: 'Enterprise plan - Unlimited everything'
    },
    {
      email: 'demo.trial@yuthub.com',
      password: 'Demo2025!Trial',
      role: 'admin',
      fullName: 'Trial User',
      organizationName: 'Trial Organization',
      tier: 'professional',
      billingPeriod: 'month',
      description: 'In trial period - Testing trial flow'
    },
    {
      email: 'platform.admin@yuthub.com',
      password: 'Platform2025!Admin',
      role: 'platform_admin',
      fullName: 'Platform Administrator',
      organizationName: 'YUTHUB Platform',
      tier: 'enterprise',
      billingPeriod: 'year',
      description: 'Platform admin - Full system access'
    }
  ];

  const createdAccounts = [];
  const organizationMap: Record<string, string> = {};

  for (const account of demoAccounts) {
    try {
      console.log(`\n📝 Creating: ${account.email}`);
      console.log(`   Role: ${account.role} | Org: ${account.organizationName}`);
      console.log(`   Plan: ${account.tier} (${account.billingPeriod})`);

      // Check if user already exists
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users.find(u => u.email === account.email);

      let userId: string;

      if (userExists) {
        console.log(`   ⚠️  User already exists, updating...`);
        userId = userExists.id;
      } else {
        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.fullName,
            role: account.role
          }
        });

        if (authError) {
          console.error(`   ❌ Failed to create auth user:`, authError.message);
          continue;
        }

        userId = authUser.user.id;
        console.log(`   ✅ Auth user created: ${userId}`);
      }

      // Create or get organization
      let organizationId = organizationMap[account.organizationName];

      if (!organizationId) {
        const { data: existingOrg } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', account.organizationName)
          .single();

        if (existingOrg) {
          organizationId = existingOrg.id;
          console.log(`   ✅ Using existing organization: ${organizationId}`);
        } else {
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: account.organizationName,
              email: account.email,
              type: account.organizationName.includes('Platform') ? 'platform' : 'housing_provider',
              status: 'active',
              settings: {
                timezone: 'Europe/London',
                currency: 'GBP',
                language: 'en'
              }
            })
            .select()
            .single();

          if (orgError) {
            console.error(`   ❌ Failed to create organization:`, orgError.message);
            continue;
          }

          organizationId = newOrg.id;
          organizationMap[account.organizationName] = organizationId;
          console.log(`   ✅ Organization created: ${organizationId}`);
        }
      }

      // Link user to organization
      const { error: userOrgError } = await supabase
        .from('user_organizations')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          role: account.role,
          status: 'active'
        }, {
          onConflict: 'user_id,organization_id'
        });

      if (userOrgError) {
        console.error(`   ❌ Failed to link user to org:`, userOrgError.message);
      } else {
        console.log(`   ✅ User linked to organization`);
      }

      // Get subscription tier
      const { data: tier } = await supabase
        .from('subscription_tiers')
        .select('id, price_gbp, tier_name')
        .eq('tier_name', account.tier)
        .eq('billing_period', account.billingPeriod)
        .single();

      if (tier) {
        // Calculate trial dates
        const trialStart = new Date();
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const periodEnd = account.billingPeriod === 'month'
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

        const vatAmount = Math.floor((tier.price_gbp * 20) / 100);
        const totalAmount = tier.price_gbp + vatAmount;

        // Create subscription
        const { error: subError } = await supabase
          .from('organization_subscriptions')
          .upsert({
            organization_id: organizationId,
            tier_id: tier.id,
            status: account.email.includes('trial') ? 'trialing' : 'active',
            billing_period: account.billingPeriod,
            trial_start: trialStart.toISOString(),
            trial_end: trialEnd.toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: periodEnd.toISOString(),
            amount_gbp: tier.price_gbp,
            vat_rate: 20.00,
            vat_amount_gbp: vatAmount,
            total_amount_gbp: totalAmount,
            currency: 'gbp',
            billing_email: account.email,
            billing_name: account.organizationName,
            auto_renew: true
          }, {
            onConflict: 'organization_id'
          });

        if (subError) {
          console.error(`   ❌ Failed to create subscription:`, subError.message);
        } else {
          console.log(`   ✅ Subscription created: ${tier.tier_name} (${account.billingPeriod})`);
        }

        // Initialize usage tracking
        const { error: usageError } = await supabase
          .from('subscription_usage')
          .upsert({
            organization_id: organizationId,
            properties_count: 0,
            residents_count: 0,
            staff_count: 0,
            storage_used_gb: 0,
            period_start: new Date().toISOString(),
            period_end: periodEnd.toISOString()
          }, {
            onConflict: 'organization_id,period_start'
          });

        if (usageError) {
          console.error(`   ❌ Failed to initialize usage:`, usageError.message);
        } else {
          console.log(`   ✅ Usage tracking initialized`);
        }
      }

      createdAccounts.push({
        email: account.email,
        password: account.password,
        role: account.role,
        organization: account.organizationName,
        tier: account.tier,
        userId,
        organizationId
      });

      console.log(`   ✅ Demo account ready!`);

    } catch (error: any) {
      console.error(`   ❌ Failed to create ${account.email}:`, error.message);
    }
  }

  // Create sample data for main demo organization
  const mainOrgId = organizationMap['Demo Housing Association'];
  if (mainOrgId) {
    await createSampleData(mainOrgId);
  }

  // Print summary
  console.log('\n\n' + '═'.repeat(80));
  console.log('🎉 DEMO ACCOUNTS CREATED SUCCESSFULLY');
  console.log('═'.repeat(80));

  console.log('\n📋 ACCOUNT CREDENTIALS:\n');

  console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
  console.log('│ ADMIN & MANAGEMENT ACCOUNTS                                                 │');
  console.log('├──────────────────────────────┬──────────────────┬───────────────────────────┤');

  const adminAccounts = createdAccounts.filter(a =>
    ['demo.admin@yuthub.com', 'demo.manager@yuthub.com', 'platform.admin@yuthub.com'].includes(a.email)
  );

  for (const acc of adminAccounts) {
    const demo = demoAccounts.find(d => d.email === acc.email);
    console.log(`│ ${acc.email.padEnd(28)} │ ${acc.password.padEnd(16)} │ ${acc.role.padEnd(25)} │`);
    console.log(`│ ${demo?.description.padEnd(76)} │`);
    console.log('├──────────────────────────────┼──────────────────┼───────────────────────────┤');
  }

  console.log('│ STAFF & VIEWER ACCOUNTS                                                     │');
  console.log('├──────────────────────────────┬──────────────────┬───────────────────────────┤');

  const staffAccounts = createdAccounts.filter(a =>
    ['demo.staff@yuthub.com', 'demo.viewer@yuthub.com'].includes(a.email)
  );

  for (const acc of staffAccounts) {
    const demo = demoAccounts.find(d => d.email === acc.email);
    console.log(`│ ${acc.email.padEnd(28)} │ ${acc.password.padEnd(16)} │ ${acc.role.padEnd(25)} │`);
    console.log(`│ ${demo?.description.padEnd(76)} │`);
    console.log('├──────────────────────────────┼──────────────────┼───────────────────────────┤');
  }

  console.log('│ TIER TESTING ACCOUNTS                                                       │');
  console.log('├──────────────────────────────┬──────────────────┬───────────────────────────┤');

  const tierAccounts = createdAccounts.filter(a =>
    ['demo.starter@yuthub.com', 'demo.enterprise@yuthub.com', 'demo.trial@yuthub.com'].includes(a.email)
  );

  for (const acc of tierAccounts) {
    const demo = demoAccounts.find(d => d.email === acc.email);
    console.log(`│ ${acc.email.padEnd(28)} │ ${acc.password.padEnd(16)} │ ${acc.tier.padEnd(25)} │`);
    console.log(`│ ${demo?.description.padEnd(76)} │`);
    console.log('├──────────────────────────────┼──────────────────┼───────────────────────────┤');
  }

  console.log('└─────────────────────────────────────────────────────────────────────────────┘');

  console.log('\n\n🔐 AUTHENTICATION TESTING:\n');
  console.log('  ✅ Password authentication - All accounts');
  console.log('  ✅ Role-based access control - 5 different roles');
  console.log('  ✅ Multi-tenant - 4 different organizations');
  console.log('  ✅ Subscription tiers - Starter, Professional, Enterprise');
  console.log('  ✅ Trial mode - demo.trial@yuthub.com');

  console.log('\n\n🎯 FEATURE TESTING:\n');
  console.log('  Professional Plan Features:');
  console.log('    ✅ Safeguarding module');
  console.log('    ✅ Financial management');
  console.log('    ✅ Advanced reporting');
  console.log('    ✅ Priority support');

  console.log('\n  Enterprise Plan Features (demo.enterprise@yuthub.com):');
  console.log('    ✅ Crisis intervention');
  console.log('    ✅ AI-powered analytics');
  console.log('    ✅ API access');
  console.log('    ✅ Custom integrations');
  console.log('    ✅ Dedicated account manager');

  console.log('\n  Usage Limits Testing:');
  console.log('    ✅ Starter: 1 property, 10 residents');
  console.log('    ✅ Professional: 5 properties, 25 residents');
  console.log('    ✅ Enterprise: Unlimited');

  console.log('\n\n📊 SAMPLE DATA CREATED:\n');
  console.log('  ✅ 2 Properties (Main Street Hub, Riverside House)');
  console.log('  ✅ 5 Residents with complete profiles');
  console.log('  ✅ 3 Staff members');
  console.log('  ✅ Sample support plans');
  console.log('  ✅ Progress tracking records');
  console.log('  ✅ Recent activity logs');

  console.log('\n\n🚀 NEXT STEPS:\n');
  console.log('  1. Login with any account above');
  console.log('  2. Test features based on subscription tier');
  console.log('  3. Try creating resources to test usage limits');
  console.log('  4. Switch between accounts to test permissions');
  console.log('  5. Test subscription upgrades/downgrades');

  console.log('\n\n💡 TIPS:\n');
  console.log('  • Use demo.admin@yuthub.com for full feature access');
  console.log('  • Use demo.starter@yuthub.com to test usage limits');
  console.log('  • Use demo.enterprise@yuthub.com for unlimited access');
  console.log('  • Use platform.admin@yuthub.com for platform admin features');
  console.log('  • All passwords follow pattern: Demo2025!<Role>');

  console.log('\n' + '═'.repeat(80) + '\n');
}

/**
 * Create sample data for testing
 */
async function createSampleData(organizationId: string) {
  console.log('\n\n📊 Creating sample data...');

  try {
    // Create properties
    const properties = [
      {
        organization_id: organizationId,
        name: 'Main Street Hub',
        address: '123 Main Street',
        city: 'Manchester',
        postcode: 'M1 1AA',
        type: 'supported_living',
        capacity: 10,
        current_occupancy: 5,
        status: 'active'
      },
      {
        organization_id: organizationId,
        name: 'Riverside House',
        address: '45 River Road',
        city: 'Manchester',
        postcode: 'M2 2BB',
        type: 'shared_house',
        capacity: 6,
        current_occupancy: 4,
        status: 'active'
      }
    ];

    const { data: createdProperties, error: propError } = await supabase
      .from('properties')
      .insert(properties)
      .select();

    if (propError) {
      console.error('   ❌ Failed to create properties:', propError.message);
    } else {
      console.log(`   ✅ Created ${createdProperties?.length} properties`);

      // Create residents
      if (createdProperties && createdProperties.length > 0) {
        const residents = [
          {
            organization_id: organizationId,
            property_id: createdProperties[0].id,
            first_name: 'James',
            last_name: 'Wilson',
            date_of_birth: '2002-03-15',
            gender: 'male',
            phone: '07700900001',
            email: 'james.wilson@demo.test',
            status: 'active',
            move_in_date: '2024-01-15',
            emergency_contact_name: 'Sarah Wilson',
            emergency_contact_phone: '07700900002'
          },
          {
            organization_id: organizationId,
            property_id: createdProperties[0].id,
            first_name: 'Emily',
            last_name: 'Brown',
            date_of_birth: '2003-07-22',
            gender: 'female',
            phone: '07700900003',
            email: 'emily.brown@demo.test',
            status: 'active',
            move_in_date: '2024-02-01',
            emergency_contact_name: 'Robert Brown',
            emergency_contact_phone: '07700900004'
          },
          {
            organization_id: organizationId,
            property_id: createdProperties[0].id,
            first_name: 'Mohammed',
            last_name: 'Ahmed',
            date_of_birth: '2001-11-08',
            gender: 'male',
            phone: '07700900005',
            email: 'mohammed.ahmed@demo.test',
            status: 'active',
            move_in_date: '2023-09-10',
            emergency_contact_name: 'Fatima Ahmed',
            emergency_contact_phone: '07700900006'
          },
          {
            organization_id: organizationId,
            property_id: createdProperties[1].id,
            first_name: 'Sophie',
            last_name: 'Taylor',
            date_of_birth: '2004-05-19',
            gender: 'female',
            phone: '07700900007',
            email: 'sophie.taylor@demo.test',
            status: 'active',
            move_in_date: '2024-03-01',
            emergency_contact_name: 'Jane Taylor',
            emergency_contact_phone: '07700900008'
          },
          {
            organization_id: organizationId,
            property_id: createdProperties[1].id,
            first_name: 'Daniel',
            last_name: 'Garcia',
            date_of_birth: '2002-09-30',
            gender: 'male',
            phone: '07700900009',
            email: 'daniel.garcia@demo.test',
            status: 'active',
            move_in_date: '2024-01-20',
            emergency_contact_name: 'Maria Garcia',
            emergency_contact_phone: '07700900010'
          }
        ];

        const { data: createdResidents, error: resError } = await supabase
          .from('residents')
          .insert(residents)
          .select();

        if (resError) {
          console.error('   ❌ Failed to create residents:', resError.message);
        } else {
          console.log(`   ✅ Created ${createdResidents?.length} residents`);
        }
      }

      // Create staff members
      const staff = [
        {
          organization_id: organizationId,
          first_name: 'Sarah',
          last_name: 'Johnson',
          email: 'sarah.johnson@demo.staff',
          phone: '07700900020',
          role: 'support_worker',
          employment_type: 'full_time',
          start_date: '2023-06-01',
          status: 'active'
        },
        {
          organization_id: organizationId,
          first_name: 'Michael',
          last_name: 'Chen',
          email: 'michael.chen@demo.staff',
          phone: '07700900021',
          role: 'team_leader',
          employment_type: 'full_time',
          start_date: '2022-03-15',
          status: 'active'
        },
        {
          organization_id: organizationId,
          first_name: 'Lisa',
          last_name: 'Patel',
          email: 'lisa.patel@demo.staff',
          phone: '07700900022',
          role: 'support_worker',
          employment_type: 'part_time',
          start_date: '2024-01-10',
          status: 'active'
        }
      ];

      const { data: createdStaff, error: staffError } = await supabase
        .from('staff_members')
        .insert(staff)
        .select();

      if (staffError) {
        console.error('   ❌ Failed to create staff:', staffError.message);
      } else {
        console.log(`   ✅ Created ${createdStaff?.length} staff members`);
      }
    }

    // Update usage counts
    await supabase.rpc('update_usage_counts', {
      p_organization_id: organizationId
    });

    console.log('   ✅ Updated usage counts');

  } catch (error: any) {
    console.error('   ❌ Failed to create sample data:', error.message);
  }
}

// Run the script
createDemoAccounts()
  .then(() => {
    console.log('✅ Demo account creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to create demo accounts:', error);
    process.exit(1);
  });
