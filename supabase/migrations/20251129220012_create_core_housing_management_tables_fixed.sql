/*
  # Create Core Housing Management Tables

  ## Overview
  Creates the essential tables for youth housing management functionality.
  These tables enable the core business operations of the YUTHUB platform.

  ## New Tables Created
  1. **staff_members** - Care and support staff (created first - no FK dependencies)
  2. **properties** - Housing locations managed by organizations
  3. **rooms** - Individual accommodation units within properties
  4. **residents** - Young people receiving housing support
  5. **placements** - Resident assignments to properties/rooms
  6. **support_plans** - Individual support and development plans
  7. **progress_notes** - Daily progress tracking and observations
  8. **assessments** - Risk and needs assessments
  9. **incidents** - Safeguarding incidents and responses
  10. **maintenance_requests** - Property maintenance tracking
  11. **financial_records** - Resident financial management
  12. **documents** - File attachments and document management

  ## Multi-Tenant Architecture
  - All tables linked to organizations for tenant isolation
  - RLS will be enabled in subsequent migration
  - Foreign keys ensure referential integrity
  - Audit fields (created_at, updated_at, created_by) on all tables
*/

-- ============================================================================
-- STAFF MEMBERS TABLE - Created first (no FK dependencies except organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  staff_role TEXT NOT NULL CHECK (staff_role IN ('manager', 'support_worker', 'key_worker', 'coordinator', 'maintenance', 'admin', 'other')),
  employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'on_leave', 'suspended', 'terminated')),
  start_date DATE NOT NULL,
  end_date DATE,
  qualifications JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  assigned_properties JSONB DEFAULT '[]'::jsonb,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  dbs_check_date DATE,
  dbs_check_expiry DATE,
  training_records JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PROPERTIES TABLE - Housing locations
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'flat', 'hostel', 'foyer', 'supported_lodging', 'other')),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  county TEXT,
  postcode TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United Kingdom',
  total_capacity INTEGER NOT NULL DEFAULT 1,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'closed')),
  manager_id UUID REFERENCES staff_members(id),
  contact_phone TEXT,
  contact_email TEXT,
  description TEXT,
  facilities JSONB DEFAULT '[]'::jsonb,
  accessibility_features JSONB DEFAULT '[]'::jsonb,
  safety_certificates JSONB DEFAULT '{}'::jsonb,
  inspection_due_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RESIDENTS TABLE - Young people receiving support (before rooms/placements)
-- ============================================================================
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reference_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other')),
  nationality TEXT,
  ethnicity TEXT,
  primary_language TEXT DEFAULT 'English',
  contact_phone TEXT,
  contact_email TEXT,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  
  -- Placement information (will be set later)
  current_property_id UUID REFERENCES properties(id),
  current_room_id UUID,
  admission_date DATE,
  expected_move_out_date DATE,
  key_worker_id UUID REFERENCES staff_members(id),
  
  -- Support information
  support_level TEXT CHECK (support_level IN ('low', 'medium', 'high', 'intensive')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  vulnerability_factors JSONB DEFAULT '[]'::jsonb,
  support_needs JSONB DEFAULT '[]'::jsonb,
  
  -- Legal and safeguarding
  legal_status TEXT CHECK (legal_status IN ('voluntary', 'section_20', 'remand', 'other')),
  local_authority TEXT,
  social_worker_name TEXT,
  social_worker_contact TEXT,
  
  -- Medical information
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  gp_details JSONB DEFAULT '{}'::jsonb,
  
  -- Status and lifecycle
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'on_leave', 'moved_on', 'discharged', 'transferred')),
  discharge_date DATE,
  discharge_reason TEXT,
  
  -- Financial
  weekly_rent NUMERIC(10,2),
  housing_benefit_amount NUMERIC(10,2),
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ROOMS TABLE - Individual accommodation units
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('single', 'double', 'shared', 'studio', 'ensuite')),
  floor_number INTEGER,
  size_sqm NUMERIC(6,2),
  is_occupied BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  current_resident_id UUID REFERENCES residents(id),
  max_occupancy INTEGER NOT NULL DEFAULT 1,
  weekly_rent NUMERIC(10,2),
  features JSONB DEFAULT '[]'::jsonb,
  furniture JSONB DEFAULT '[]'::jsonb,
  last_inspection_date DATE,
  next_inspection_date DATE,
  condition_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(property_id, room_number)
);

-- Now add the FK constraint for residents.current_room_id
ALTER TABLE residents ADD CONSTRAINT fk_residents_current_room 
  FOREIGN KEY (current_room_id) REFERENCES rooms(id);

-- ============================================================================
-- PLACEMENTS TABLE - Resident housing assignments
-- ============================================================================
CREATE TABLE IF NOT EXISTS placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('emergency', 'short_term', 'medium_term', 'long_term', 'permanent')),
  
  -- Dates
  start_date DATE NOT NULL,
  planned_end_date DATE,
  actual_end_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planned', 'active', 'on_hold', 'completed', 'terminated')),
  
  -- Financial
  weekly_rent NUMERIC(10,2),
  deposit_amount NUMERIC(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  
  -- Termination
  termination_reason TEXT,
  termination_type TEXT CHECK (termination_type IN ('planned_move_on', 'eviction', 'abandonment', 'transfer', 'other')),
  
  -- Assignment
  key_worker_id UUID REFERENCES staff_members(id),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SUPPORT PLANS TABLE - Individual support planning
-- ============================================================================
CREATE TABLE IF NOT EXISTS support_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('initial', 'ongoing', 'move_on', 'crisis', 'review')),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  review_date DATE NOT NULL,
  next_review_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'under_review', 'completed', 'superseded')),
  
  -- Plan details
  goals JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  interventions JSONB DEFAULT '[]'::jsonb,
  outcomes JSONB DEFAULT '[]'::jsonb,
  
  -- Involvement
  created_by_id UUID REFERENCES staff_members(id),
  reviewed_by_id UUID REFERENCES staff_members(id),
  
  -- Progress
  overall_progress TEXT CHECK (overall_progress IN ('not_started', 'minimal', 'some_progress', 'good_progress', 'achieved')),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- PROGRESS NOTES TABLE - Daily observations and updates
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  support_plan_id UUID REFERENCES support_plans(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES staff_members(id),
  
  note_type TEXT NOT NULL CHECK (note_type IN ('daily', 'weekly', 'incident', 'achievement', 'concern', 'handover', 'other')),
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note_time TIME NOT NULL DEFAULT CURRENT_TIME,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Categorization
  categories JSONB DEFAULT '[]'::jsonb,
  related_goal_ids JSONB DEFAULT '[]'::jsonb,
  
  -- Priority and visibility
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_confidential BOOLEAN DEFAULT false,
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT false,
  
  -- Mood and behavior tracking
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  behavior_observations TEXT,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ASSESSMENTS TABLE - Risk and needs assessments
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('initial', 'risk', 'needs', 'review', 'discharge', 'safeguarding', 'mental_health')),
  
  -- Dates
  assessment_date DATE NOT NULL,
  due_date DATE,
  completed_date DATE,
  review_date DATE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed', 'archived')),
  
  -- Assessor
  assessor_id UUID NOT NULL REFERENCES staff_members(id),
  reviewer_id UUID REFERENCES staff_members(id),
  
  -- Scores and outcomes
  overall_score INTEGER,
  risk_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Assessment data
  questions_responses JSONB DEFAULT '{}'::jsonb,
  identified_risks JSONB DEFAULT '[]'::jsonb,
  identified_needs JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  action_plan JSONB DEFAULT '[]'::jsonb,
  
  summary TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INCIDENTS TABLE - Safeguarding and critical incidents
-- ============================================================================
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  incident_reference TEXT UNIQUE NOT NULL,
  
  -- People involved
  resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  reported_by_id UUID NOT NULL REFERENCES staff_members(id),
  
  -- Incident details
  incident_type TEXT NOT NULL CHECK (incident_type IN ('safeguarding', 'behavioral', 'medical', 'property_damage', 'missing_person', 'substance_misuse', 'violence', 'self_harm', 'accident', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Dates and times
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reported_time TIME NOT NULL DEFAULT CURRENT_TIME,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'under_investigation', 'action_taken', 'resolved', 'escalated', 'closed')),
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  witnesses JSONB DEFAULT '[]'::jsonb,
  
  -- Response
  immediate_action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT true,
  follow_up_actions JSONB DEFAULT '[]'::jsonb,
  
  -- External reporting
  police_notified BOOLEAN DEFAULT false,
  police_reference TEXT,
  safeguarding_team_notified BOOLEAN DEFAULT false,
  local_authority_notified BOOLEAN DEFAULT false,
  other_agencies_notified JSONB DEFAULT '[]'::jsonb,
  
  -- Resolution
  resolution_date DATE,
  resolution_summary TEXT,
  lessons_learned TEXT,
  
  -- Assignment
  assigned_to_id UUID REFERENCES staff_members(id),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- MAINTENANCE REQUESTS TABLE - Property maintenance tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  request_reference TEXT UNIQUE NOT NULL,
  
  -- Location
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN ('repair', 'inspection', 'replacement', 'upgrade', 'emergency', 'routine')),
  category TEXT NOT NULL CHECK (category IN ('electrical', 'plumbing', 'heating', 'structural', 'appliances', 'security', 'decoration', 'cleaning', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),
  
  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_details TEXT,
  
  -- Dates
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  completed_date DATE,
  target_completion_date DATE,
  
  -- People
  requested_by_id UUID REFERENCES staff_members(id),
  assigned_to_id UUID REFERENCES staff_members(id),
  contractor_name TEXT,
  contractor_contact TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  
  -- Cost
  estimated_cost NUMERIC(10,2),
  actual_cost NUMERIC(10,2),
  
  -- Completion
  work_carried_out TEXT,
  completion_notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  
  -- Attachments and images
  photos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FINANCIAL RECORDS TABLE - Resident financial management
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'rent_payment', 'deposit', 'refund', 'fine', 'allowance', 'benefit', 'other')),
  category TEXT NOT NULL,
  
  -- Amount
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  
  -- Dates
  transaction_date DATE NOT NULL,
  due_date DATE,
  
  -- Description
  description TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'direct_debit', 'standing_order', 'cheque', 'card', 'benefit', 'other')),
  
  -- Reference
  reference_number TEXT,
  invoice_number TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Tracking
  recorded_by_id UUID REFERENCES staff_members(id),
  
  -- Related records
  related_placement_id UUID REFERENCES placements(id),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- DOCUMENTS TABLE - File attachments and document management
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Document details
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('assessment', 'care_plan', 'contract', 'id_document', 'medical', 'legal', 'photo', 'report', 'certificate', 'correspondence', 'other')),
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'documents',
  
  -- Associations (one document can relate to multiple entities)
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  support_plan_id UUID REFERENCES support_plans(id) ON DELETE CASCADE,
  
  -- Security
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT NOT NULL DEFAULT 'staff' CHECK (access_level IN ('public', 'staff', 'managers', 'admins', 'restricted')),
  
  -- Metadata
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  expiry_date DATE,
  
  -- Tracking
  uploaded_by UUID NOT NULL REFERENCES staff_members(id),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  
  -- Versions
  version INTEGER DEFAULT 1,
  is_current_version BOOLEAN DEFAULT true,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_properties_manager_id ON properties(manager_id);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_current_resident_id ON rooms(current_resident_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_available ON rooms(is_available) WHERE is_available = true;

-- Staff members indexes
CREATE INDEX IF NOT EXISTS idx_staff_organization_id ON staff_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_employment_status ON staff_members(employment_status) WHERE employment_status = 'active';

-- Residents indexes
CREATE INDEX IF NOT EXISTS idx_residents_organization_id ON residents(organization_id);
CREATE INDEX IF NOT EXISTS idx_residents_reference_number ON residents(reference_number);
CREATE INDEX IF NOT EXISTS idx_residents_current_property_id ON residents(current_property_id);
CREATE INDEX IF NOT EXISTS idx_residents_key_worker_id ON residents(key_worker_id);
CREATE INDEX IF NOT EXISTS idx_residents_status ON residents(status) WHERE status = 'active';

-- Placements indexes
CREATE INDEX IF NOT EXISTS idx_placements_organization_id ON placements(organization_id);
CREATE INDEX IF NOT EXISTS idx_placements_resident_id ON placements(resident_id);
CREATE INDEX IF NOT EXISTS idx_placements_property_id ON placements(property_id);
CREATE INDEX IF NOT EXISTS idx_placements_status ON placements(status) WHERE status = 'active';

-- Support plans indexes
CREATE INDEX IF NOT EXISTS idx_support_plans_organization_id ON support_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_resident_id ON support_plans(resident_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_status ON support_plans(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_support_plans_review_date ON support_plans(review_date);

-- Progress notes indexes
CREATE INDEX IF NOT EXISTS idx_progress_notes_organization_id ON progress_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_resident_id ON progress_notes(resident_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_author_id ON progress_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_note_date ON progress_notes(note_date DESC);

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_resident_id ON assessments(resident_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessment_date ON assessments(assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Incidents indexes
CREATE INDEX IF NOT EXISTS idx_incidents_organization_id ON incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_incidents_resident_id ON incidents(resident_id);
CREATE INDEX IF NOT EXISTS idx_incidents_property_id ON incidents(property_id);
CREATE INDEX IF NOT EXISTS idx_incidents_incident_date ON incidents(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);

-- Maintenance requests indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_organization_id ON maintenance_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_priority ON maintenance_requests(priority);

-- Financial records indexes
CREATE INDEX IF NOT EXISTS idx_financial_organization_id ON financial_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_financial_resident_id ON financial_records(resident_id);
CREATE INDEX IF NOT EXISTS idx_financial_transaction_date ON financial_records(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_status ON financial_records(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_resident_id ON documents(resident_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_staff_id ON documents(staff_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);

-- ============================================================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON placements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_plans_updated_at BEFORE UPDATE ON support_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_notes_updated_at BEFORE UPDATE ON progress_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();