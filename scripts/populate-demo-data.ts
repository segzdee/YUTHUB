import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

console.log(`Using Supabase URL: ${supabaseUrl}`);
console.log(`Using key type: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon'}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface DemoContext {
  organizationId: string;
  propertyIds: string[];
  roomIds: string[];
  staffIds: string[];
  residentIds: string[];
}

async function clearExistingDemoData() {
  console.log('🧹 Clearing existing demo data...');

  try {
    // Get demo organization
    const { data: demoOrg } = await supabase
      .from('organizations')
      .select('id')
      .or('name.eq.Demo Care Organization,slug.eq.demo-care-org')
      .maybeSingle();

    if (demoOrg) {
      const orgId = demoOrg.id;

      // Delete in correct order (respecting foreign keys)
      await supabase.from('progress_tracking').delete().eq('organization_id', orgId);
      await supabase.from('support_plans').delete().eq('organization_id', orgId);
      await supabase.from('safeguarding_concerns').delete().eq('organization_id', orgId);
      await supabase.from('incidents').delete().eq('organization_id', orgId);
      await supabase.from('residents').delete().eq('organization_id', orgId);
      await supabase.from('rooms').delete().eq('organization_id', orgId);
      await supabase.from('staff_members').delete().eq('organization_id', orgId);
      await supabase.from('properties').delete().eq('organization_id', orgId);

      console.log('✅ Cleared existing demo data');
    }
  } catch (error) {
    console.log('No existing demo data to clear or error:', error);
  }
}

async function createOrganization(): Promise<string> {
  console.log('\n📋 Creating demo organization...');

  const { data, error } = await supabase
    .from('organizations')
    .insert([
      {
        name: 'Demo Care Organization',
        display_name: 'Demo Care Organization',
        slug: 'demo-care-org',
        contact_email: 'demo@yuthub.com',
        contact_phone: '+44 20 1234 5678',
        address: {
          street: '123 Care Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'UK'
        },
        organization_type: 'housing_association',
        status: 'active',
        subscription_tier: 'professional',
        subscription_status: 'active',
        max_residents: 100,
        max_properties: 10,
        settings: {
          timezone: 'Europe/London',
          currency: 'GBP',
          language: 'en'
        }
      }
    ])
    .select()
    .single();

  if (error) throw error;
  console.log(`✅ Created organization: ${data.name} (${data.id})`);
  return data.id;
}

async function createProperties(organizationId: string): Promise<string[]> {
  console.log('\n🏠 Creating properties...');

  const properties = [
    {
      organization_id: organizationId,
      name: 'Sunrise House',
      address: '45 Oak Avenue, Manchester M1 2AB',
      property_type: 'residential',
      total_capacity: 12,
      current_occupancy: 9,
      status: 'active',
      facilities: ['kitchen', 'common_room', 'garden', 'laundry', 'parking']
    },
    {
      organization_id: organizationId,
      name: 'Maple Lodge',
      address: '78 Elm Road, Birmingham B5 7HG',
      property_type: 'residential',
      total_capacity: 8,
      current_occupancy: 7,
      status: 'active',
      facilities: ['kitchen', 'common_room', 'study_room', 'parking']
    },
    {
      organization_id: organizationId,
      name: 'Oakwood Court',
      address: '12 Birch Lane, Liverpool L3 9QR',
      property_type: 'semi_independent',
      total_capacity: 6,
      current_occupancy: 4,
      status: 'active',
      facilities: ['shared_kitchen', 'common_room', 'wifi']
    }
  ];

  const { data, error } = await supabase
    .from('properties')
    .insert(properties)
    .select();

  if (error) throw error;
  console.log(`✅ Created ${data.length} properties`);
  return data.map(p => p.id);
}

async function createRooms(organizationId: string, propertyIds: string[]): Promise<string[]> {
  console.log('\n🚪 Creating rooms...');

  const rooms = [];

  // Sunrise House - 12 rooms
  for (let i = 1; i <= 12; i++) {
    rooms.push({
      organization_id: organizationId,
      property_id: propertyIds[0],
      room_number: `${i}`,
      room_type: i <= 2 ? 'shared' : 'single',
      capacity: i <= 2 ? 2 : 1,
      current_occupancy: i <= 9 ? (i <= 2 ? 2 : 1) : 0,
      floor: Math.ceil(i / 4),
      features: ['bed', 'wardrobe', 'desk', 'wifi']
    });
  }

  // Maple Lodge - 8 rooms
  for (let i = 1; i <= 8; i++) {
    rooms.push({
      organization_id: organizationId,
      property_id: propertyIds[1],
      room_number: `M${i}`,
      room_type: 'single',
      capacity: 1,
      current_occupancy: i <= 7 ? 1 : 0,
      floor: Math.ceil(i / 4),
      features: ['bed', 'wardrobe', 'desk', 'wifi', 'ensuite']
    });
  }

  // Oakwood Court - 6 rooms
  for (let i = 1; i <= 6; i++) {
    rooms.push({
      organization_id: organizationId,
      property_id: propertyIds[2],
      room_number: `OW${i}`,
      room_type: 'studio',
      capacity: 1,
      current_occupancy: i <= 4 ? 1 : 0,
      floor: Math.ceil(i / 3),
      features: ['kitchenette', 'ensuite', 'desk', 'wifi']
    });
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert(rooms)
    .select();

  if (error) throw error;
  console.log(`✅ Created ${data.length} rooms`);
  return data.map(r => r.id);
}

async function createStaffMembers(organizationId: string, propertyIds: string[]): Promise<string[]> {
  console.log('\n👥 Creating staff members...');

  const staff = [
    {
      organization_id: organizationId,
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@demo.yuthub.com',
      phone: '+44 7700 900001',
      role: 'manager',
      status: 'active',
      assigned_properties: [propertyIds[0]],
      qualifications: ['Level 5 Diploma in Leadership', 'Safeguarding Lead']
    },
    {
      organization_id: organizationId,
      first_name: 'Michael',
      last_name: 'Smith',
      email: 'michael.smith@demo.yuthub.com',
      phone: '+44 7700 900002',
      role: 'support_worker',
      status: 'active',
      assigned_properties: [propertyIds[0], propertyIds[1]],
      qualifications: ['Level 3 Diploma in Health & Social Care']
    },
    {
      organization_id: organizationId,
      first_name: 'Emma',
      last_name: 'Williams',
      email: 'emma.williams@demo.yuthub.com',
      phone: '+44 7700 900003',
      role: 'key_worker',
      status: 'active',
      assigned_properties: [propertyIds[0]],
      qualifications: ['Level 3 Diploma', 'First Aid Certified']
    },
    {
      organization_id: organizationId,
      first_name: 'James',
      last_name: 'Brown',
      email: 'james.brown@demo.yuthub.com',
      phone: '+44 7700 900004',
      role: 'key_worker',
      status: 'active',
      assigned_properties: [propertyIds[1]],
      qualifications: ['Level 3 Diploma', 'Mental Health First Aid']
    },
    {
      organization_id: organizationId,
      first_name: 'Lisa',
      last_name: 'Davis',
      email: 'lisa.davis@demo.yuthub.com',
      phone: '+44 7700 900005',
      role: 'support_worker',
      status: 'active',
      assigned_properties: [propertyIds[2]],
      qualifications: ['Level 3 Diploma']
    }
  ];

  const { data, error } = await supabase
    .from('staff_members')
    .insert(staff)
    .select();

  if (error) throw error;
  console.log(`✅ Created ${data.length} staff members`);
  return data.map(s => s.id);
}

async function createResidents(
  organizationId: string,
  propertyIds: string[],
  roomIds: string[],
  staffIds: string[]
): Promise<string[]> {
  console.log('\n👤 Creating residents...');

  const residents = [
    {
      organization_id: organizationId,
      first_name: 'Alice',
      last_name: 'Thompson',
      date_of_birth: '2005-03-15',
      gender: 'female',
      contact_email: 'alice.thompson@email.com',
      contact_phone: '+44 7700 900101',
      current_property_id: propertyIds[0],
      current_room_id: roomIds[0],
      assigned_staff_id: staffIds[2],
      status: 'active',
      support_level: 'medium',
      risk_level: 'low',
      emergency_contacts: [
        {
          name: 'Jane Thompson',
          relationship: 'Mother',
          phone: '+44 7700 900201',
          email: 'jane.thompson@email.com'
        }
      ],
      support_needs: ['independent_living_skills', 'education_support'],
      admission_date: '2024-09-01'
    },
    {
      organization_id: organizationId,
      first_name: 'Ben',
      last_name: 'Martinez',
      date_of_birth: '2006-07-22',
      gender: 'male',
      contact_email: 'ben.martinez@email.com',
      contact_phone: '+44 7700 900102',
      current_property_id: propertyIds[0],
      current_room_id: roomIds[2],
      assigned_staff_id: staffIds[2],
      status: 'active',
      support_level: 'high',
      risk_level: 'medium',
      emergency_contacts: [
        {
          name: 'Carlos Martinez',
          relationship: 'Uncle',
          phone: '+44 7700 900202'
        }
      ],
      support_needs: ['behavioral_support', 'mental_health', 'education_support'],
      admission_date: '2024-08-15'
    },
    {
      organization_id: organizationId,
      first_name: 'Charlie',
      last_name: 'Evans',
      date_of_birth: '2004-11-08',
      gender: 'non_binary',
      contact_email: 'charlie.evans@email.com',
      contact_phone: '+44 7700 900103',
      current_property_id: propertyIds[0],
      current_room_id: roomIds[3],
      assigned_staff_id: staffIds[2],
      status: 'active',
      support_level: 'medium',
      risk_level: 'low',
      emergency_contacts: [
        {
          name: 'Sarah Evans',
          relationship: 'Sister',
          phone: '+44 7700 900203',
          email: 'sarah.evans@email.com'
        }
      ],
      support_needs: ['employment_support', 'financial_management'],
      admission_date: '2024-07-10'
    },
    {
      organization_id: organizationId,
      first_name: 'Diana',
      last_name: 'Patel',
      date_of_birth: '2005-05-30',
      gender: 'female',
      contact_email: 'diana.patel@email.com',
      contact_phone: '+44 7700 900104',
      current_property_id: propertyIds[1],
      current_room_id: roomIds[12],
      assigned_staff_id: staffIds[3],
      status: 'active',
      support_level: 'medium',
      risk_level: 'low',
      emergency_contacts: [
        {
          name: 'Priya Patel',
          relationship: 'Mother',
          phone: '+44 7700 900204'
        }
      ],
      support_needs: ['social_skills', 'education_support'],
      admission_date: '2024-10-01'
    },
    {
      organization_id: organizationId,
      first_name: 'Ethan',
      last_name: 'Clarke',
      date_of_birth: '2006-01-18',
      gender: 'male',
      contact_email: 'ethan.clarke@email.com',
      contact_phone: '+44 7700 900105',
      current_property_id: propertyIds[1],
      current_room_id: roomIds[13],
      assigned_staff_id: staffIds[3],
      status: 'active',
      support_level: 'intensive',
      risk_level: 'high',
      emergency_contacts: [
        {
          name: 'Mark Clarke',
          relationship: 'Father',
          phone: '+44 7700 900205',
          email: 'mark.clarke@email.com'
        }
      ],
      support_needs: ['mental_health', 'behavioral_support', 'substance_misuse'],
      medical_conditions: [{ condition: 'ADHD', diagnosed: '2018-03-15' }],
      medications: [{ name: 'Methylphenidate', dosage: '10mg', frequency: 'twice daily' }],
      admission_date: '2024-06-20'
    },
    {
      organization_id: organizationId,
      first_name: 'Fiona',
      last_name: 'O\'Brien',
      date_of_birth: '2004-09-12',
      gender: 'female',
      contact_email: 'fiona.obrien@email.com',
      contact_phone: '+44 7700 900106',
      current_property_id: propertyIds[2],
      current_room_id: roomIds[20],
      assigned_staff_id: staffIds[4],
      status: 'active',
      support_level: 'low',
      risk_level: 'low',
      emergency_contacts: [
        {
          name: 'Siobhan O\'Brien',
          relationship: 'Aunt',
          phone: '+44 7700 900206'
        }
      ],
      support_needs: ['independent_living_skills', 'employment_support'],
      admission_date: '2024-11-01'
    }
  ];

  const { data, error } = await supabase
    .from('residents')
    .insert(residents)
    .select();

  if (error) throw error;
  console.log(`✅ Created ${data.length} residents`);
  return data.map(r => r.id);
}

async function createIncidents(
  organizationId: string,
  residentIds: string[],
  propertyIds: string[]
): Promise<void> {
  console.log('\n⚠️ Creating incidents...');

  const incidents = [
    {
      organization_id: organizationId,
      title: 'Minor verbal altercation',
      description: 'Two residents had a disagreement over TV remote control in common room. Situation de-escalated quickly.',
      incident_type: 'behavioral',
      severity: 'low',
      status: 'resolved',
      resident_id: residentIds[1],
      property_id: propertyIds[0],
      reported_by: 'Emma Williams',
      actions_taken: 'Mediated discussion between residents. Both apologized. No further action needed.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      organization_id: organizationId,
      title: 'Missed medication dose',
      description: 'Resident refused morning medication, citing feeling unwell.',
      incident_type: 'medical',
      severity: 'medium',
      status: 'investigating',
      resident_id: residentIds[4],
      property_id: propertyIds[1],
      reported_by: 'James Brown',
      actions_taken: 'GP contacted. Monitoring resident. Medication rescheduled for evening dose.',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      organization_id: organizationId,
      title: 'Late return to property',
      description: 'Resident returned 2 hours past agreed curfew without prior notice.',
      incident_type: 'safety',
      severity: 'medium',
      status: 'resolved',
      resident_id: residentIds[2],
      property_id: propertyIds[0],
      reported_by: 'Sarah Johnson',
      actions_taken: 'Discussion held with resident about safety protocols. Updated contact plan.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      organization_id: organizationId,
      title: 'Minor property damage',
      description: 'Hole in bedroom wall discovered during routine inspection.',
      incident_type: 'maintenance',
      severity: 'low',
      status: 'open',
      resident_id: residentIds[1],
      property_id: propertyIds[0],
      reported_by: 'Michael Smith',
      actions_taken: 'Maintenance scheduled. Discussion with resident about property care.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const { error } = await supabase
    .from('incidents')
    .insert(incidents);

  if (error) throw error;
  console.log(`✅ Created ${incidents.length} incidents`);
}

async function createSafeguardingConcerns(
  organizationId: string,
  residentIds: string[],
  propertyIds: string[]
): Promise<void> {
  console.log('\n🛡️ Creating safeguarding concerns...');

  const concerns = [
    {
      organization_id: organizationId,
      concern_type: 'self_harm',
      severity: 'high',
      status: 'monitoring',
      resident_id: residentIds[4],
      property_id: propertyIds[1],
      description: 'Resident disclosed previous self-harm thoughts. Currently stable but requires ongoing monitoring.',
      reported_by: 'James Brown',
      actions_taken: 'Risk assessment completed. Increased check-ins. Mental health referral made.',
      follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    {
      organization_id: organizationId,
      concern_type: 'peer_influence',
      severity: 'medium',
      status: 'investigating',
      resident_id: residentIds[1],
      property_id: propertyIds[0],
      description: 'Concerns raised about resident spending time with individuals known to be involved in risky behaviors.',
      reported_by: 'Emma Williams',
      actions_taken: 'Discussion with resident about peer influences. Monitoring social contacts.',
      follow_up_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ];

  const { error } = await supabase
    .from('safeguarding_concerns')
    .insert(concerns);

  if (error) throw error;
  console.log(`✅ Created ${concerns.length} safeguarding concerns`);
}

async function createSupportPlans(
  organizationId: string,
  residentIds: string[]
): Promise<void> {
  console.log('\n📋 Creating support plans...');

  const plans = [
    {
      organization_id: organizationId,
      resident_id: residentIds[0],
      title: 'Independent Living Skills Development',
      goals: [
        { goal: 'Cook 3 meals independently per week', completed: true },
        { goal: 'Manage weekly budget independently', completed: true },
        { goal: 'Use public transport confidently', completed: false },
        { goal: 'Attend college regularly (90%+ attendance)', completed: true }
      ],
      start_date: '2024-09-01',
      review_date: '2025-01-01',
      status: 'active',
      key_worker: 'Emma Williams',
      review_frequency: 'monthly'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[1],
      title: 'Behavioral Support and Education Plan',
      goals: [
        { goal: 'Attend anger management sessions weekly', completed: false },
        { goal: 'Complete Level 2 Functional Skills English', completed: false },
        { goal: 'Develop conflict resolution strategies', completed: true },
        { goal: 'Participate in group activities twice weekly', completed: true }
      ],
      start_date: '2024-08-15',
      review_date: '2024-12-15',
      status: 'active',
      key_worker: 'Emma Williams',
      review_frequency: 'fortnightly'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[2],
      title: 'Employment and Financial Independence',
      goals: [
        { goal: 'Secure part-time employment', completed: true },
        { goal: 'Open bank account and savings plan', completed: true },
        { goal: 'Complete CV and interview skills workshop', completed: true },
        { goal: 'Save £500 for move-on accommodation', completed: false }
      ],
      start_date: '2024-07-10',
      review_date: '2025-02-10',
      status: 'active',
      key_worker: 'Emma Williams',
      review_frequency: 'monthly'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[3],
      title: 'Education and Social Skills',
      goals: [
        { goal: 'Attend college 5 days per week', completed: true },
        { goal: 'Join one social activity or club', completed: true },
        { goal: 'Develop friendship network', completed: false },
        { goal: 'Complete Level 3 course', completed: false }
      ],
      start_date: '2024-10-01',
      review_date: '2025-04-01',
      status: 'active',
      key_worker: 'James Brown',
      review_frequency: 'monthly'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[4],
      title: 'Mental Health and Wellbeing',
      goals: [
        { goal: 'Attend therapy sessions weekly', completed: true },
        { goal: 'Take medication as prescribed', completed: false },
        { goal: 'Develop coping strategies for anxiety', completed: false },
        { goal: 'Participate in mindfulness group', completed: true }
      ],
      start_date: '2024-06-20',
      review_date: '2024-12-20',
      status: 'review_due',
      key_worker: 'James Brown',
      review_frequency: 'weekly'
    }
  ];

  const { error } = await supabase
    .from('support_plans')
    .insert(plans);

  if (error) throw error;
  console.log(`✅ Created ${plans.length} support plans`);
}

async function createProgressTracking(
  organizationId: string,
  residentIds: string[]
): Promise<void> {
  console.log('\n📊 Creating progress tracking entries...');

  const entries = [
    {
      organization_id: organizationId,
      resident_id: residentIds[0],
      category: 'Independent Living Skills',
      milestone: 'Prepare meals independently',
      description: 'Successfully cooked spaghetti bolognese without assistance',
      progress_percentage: 85,
      status: 'in_progress',
      recorded_by: 'Emma Williams',
      notes: 'Alice is showing great improvement in kitchen confidence'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[0],
      category: 'Financial Management',
      milestone: 'Manage weekly budget',
      description: 'Tracked spending for 3 consecutive weeks within budget',
      progress_percentage: 90,
      status: 'completed',
      recorded_by: 'Emma Williams',
      notes: 'Ready to move to monthly budget management'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[1],
      category: 'Education & Employment',
      milestone: 'Complete English course',
      description: 'Attending classes regularly, currently working on Unit 3',
      progress_percentage: 60,
      status: 'in_progress',
      recorded_by: 'Emma Williams',
      notes: 'Good progress but needs support with written assignments'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[1],
      category: 'Behavioral Support',
      milestone: 'Conflict resolution skills',
      description: 'Used de-escalation techniques in recent disagreement',
      progress_percentage: 70,
      status: 'in_progress',
      recorded_by: 'Emma Williams',
      notes: 'Positive progress in managing emotions'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[2],
      category: 'Employment Support',
      milestone: 'Secure part-time job',
      description: 'Started working at local cafe 12 hours/week',
      progress_percentage: 100,
      status: 'completed',
      recorded_by: 'Emma Williams',
      notes: 'Excellent achievement! Charlie is thriving at work'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[2],
      category: 'Financial Management',
      milestone: 'Build savings',
      description: 'Saved £300 towards move-on goal of £500',
      progress_percentage: 60,
      status: 'in_progress',
      recorded_by: 'Emma Williams',
      notes: 'On track to reach goal by February'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[3],
      category: 'Social Relationships',
      milestone: 'Join community activity',
      description: 'Joined youth club and attending weekly',
      progress_percentage: 100,
      status: 'completed',
      recorded_by: 'James Brown',
      notes: 'Diana has made several new friends'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[4],
      category: 'Health & Wellbeing',
      milestone: 'Attend therapy sessions',
      description: 'Attending CBT sessions weekly with good engagement',
      progress_percentage: 75,
      status: 'in_progress',
      recorded_by: 'James Brown',
      notes: 'Ethan is developing good coping strategies'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[4],
      category: 'Health & Wellbeing',
      milestone: 'Medication compliance',
      description: 'Taking medication regularly but occasional missed doses',
      progress_percentage: 65,
      status: 'attention_needed',
      recorded_by: 'James Brown',
      notes: 'Needs reminder system - discussing options'
    },
    {
      organization_id: organizationId,
      resident_id: residentIds[5],
      category: 'Independent Living Skills',
      milestone: 'Manage own laundry',
      description: 'Doing own washing weekly without prompts',
      progress_percentage: 95,
      status: 'completed',
      recorded_by: 'Lisa Davis',
      notes: 'Fiona is ready for semi-independent living'
    }
  ];

  const { error } = await supabase
    .from('progress_tracking')
    .insert(entries);

  if (error) throw error;
  console.log(`✅ Created ${entries.length} progress tracking entries`);
}

async function main() {
  console.log('🚀 Starting demo data population...\n');
  console.log('This will create realistic demo data for testing the application.');

  try {
    // Clear existing demo data
    await clearExistingDemoData();

    // Create organization
    const organizationId = await createOrganization();

    // Create properties
    const propertyIds = await createProperties(organizationId);

    // Create rooms
    const roomIds = await createRooms(organizationId, propertyIds);

    // Create staff
    const staffIds = await createStaffMembers(organizationId, propertyIds);

    // Create residents
    const residentIds = await createResidents(organizationId, propertyIds, roomIds, staffIds);

    // Create incidents
    await createIncidents(organizationId, residentIds, propertyIds);

    // Create safeguarding concerns
    await createSafeguardingConcerns(organizationId, residentIds, propertyIds);

    // Create support plans
    await createSupportPlans(organizationId, residentIds);

    // Create progress tracking
    await createProgressTracking(organizationId, residentIds);

    console.log('\n✅ Demo data population complete!');
    console.log('\n📊 Summary:');
    console.log(`   - Organization: 1`);
    console.log(`   - Properties: ${propertyIds.length}`);
    console.log(`   - Rooms: ${roomIds.length}`);
    console.log(`   - Staff: ${staffIds.length}`);
    console.log(`   - Residents: ${residentIds.length}`);
    console.log(`   - Incidents: 4`);
    console.log(`   - Safeguarding Concerns: 2`);
    console.log(`   - Support Plans: 5`);
    console.log(`   - Progress Entries: 10`);

    console.log('\n🎉 You can now test the application with realistic data!');
    console.log('\n📝 Note: You\'ll need to create a user account and associate it with the demo organization.');

  } catch (error) {
    console.error('\n❌ Error populating demo data:', error);
    process.exit(1);
  }
}

main();
