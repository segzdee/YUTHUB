/*
  # Multi-Tenant Architecture Implementation

  ## Overview
  This migration adds comprehensive multi-tenant support to enable organization-level data isolation
  and subscription-based feature access for the YUTHUB Housing Platform.

  ## 1. New Tables
  
  ### `organizations`
  Core multi-tenant organization management table
  - `id` (uuid, primary key) - Unique organization identifier
  - `name` (text) - Organization legal name
  - `display_name` (text) - Public display name
  - `slug` (text, unique) - URL-friendly identifier
  - `organization_type` (text) - Type: charity, housing_association, local_authority, national_provider
  - `registration_number` (text) - Official registration/charity number
  - `contact_email` (text) - Primary contact email
  - `contact_phone` (text) - Primary contact phone
  - `address` (jsonb) - Full address details
  - `status` (text) - active, suspended, cancelled
  - `subscription_tier` (text) - starter, professional, enterprise
  - `subscription_status` (text) - trial, active, past_due, cancelled
  - `max_residents` (integer) - Resident limit based on tier
  - `max_properties` (integer) - Property limit based on tier
  - `current_resident_count` (integer) - Current resident count
  - `current_property_count` (integer) - Current property count
  - `stripe_customer_id` (text, unique) - Stripe customer reference
  - `stripe_subscription_id` (text) - Stripe subscription reference
  - `trial_start_date` (timestamptz) - Trial period start
  - `trial_end_date` (timestamptz) - Trial period end
  - `subscription_start_date` (timestamptz) - Paid subscription start
  - `subscription_end_date` (timestamptz) - Subscription renewal/expiry
  - `billing_cycle` (text) - monthly, annual
  - `features_enabled` (jsonb) - Feature flags by tier
  - `settings` (jsonb) - Organization-specific settings
  - `metadata` (jsonb) - Additional custom data
  - Timestamps: created_at, updated_at

  ### `subscription_plans`
  Available subscription tiers and pricing
  - `id` (uuid, primary key)
  - `name` (text) - starter, professional, enterprise
  - `display_name` (text) - User-facing plan name
  - `description` (text) - Plan description
  - `price_monthly` (numeric) - Monthly price in GBP
  - `price_annual` (numeric) - Annual price in GBP
  - `max_residents` (integer) - Resident limit
  - `max_properties` (integer) - Property limit
  - `features` (jsonb) - Available features
  - `stripe_price_id_monthly` (text) - Stripe price ID for monthly
  - `stripe_price_id_annual` (text) - Stripe price ID for annual
  - `is_active` (boolean) - Plan availability
  - `sort_order` (integer) - Display order
  - Timestamps: created_at, updated_at

  ### `user_organizations`
  Maps users to organizations with roles
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Reference to auth.users
  - `organization_id` (uuid) - Reference to organizations
  - `role` (text) - admin, manager, coordinator, support_worker, resident
  - `is_primary` (boolean) - Primary organization for user
  - `invited_by` (uuid) - User who sent invitation
  - `invited_at` (timestamptz) - Invitation timestamp
  - `accepted_at` (timestamptz) - Acceptance timestamp
  - `status` (text) - pending, active, suspended, removed
  - `permissions` (jsonb) - Custom permissions override
  - Timestamps: created_at, updated_at

  ### `subscription_usage`
  Track usage metrics for billing and limits
  - `id` (uuid, primary key)
  - `organization_id` (uuid) - Reference to organizations
  - `period_start` (timestamptz) - Usage period start
  - `period_end` (timestamptz) - Usage period end
  - `resident_count` (integer) - Residents during period
  - `property_count` (integer) - Properties during period
  - `api_calls` (integer) - API calls made
  - `storage_used_mb` (integer) - Storage consumption
  - `features_used` (jsonb) - Feature usage tracking
  - Timestamps: created_at, updated_at

  ### `payment_transactions`
  Payment history and transaction log
  - `id` (uuid, primary key)
  - `organization_id` (uuid) - Reference to organizations
  - `stripe_payment_intent_id` (text, unique) - Stripe payment reference
  - `amount` (numeric) - Payment amount
  - `currency` (text) - Currency code (GBP)
  - `status` (text) - pending, succeeded, failed, refunded
  - `payment_method` (text) - Payment method used
  - `description` (text) - Payment description
  - `invoice_id` (uuid) - Related invoice
  - `metadata` (jsonb) - Additional payment data
  - `paid_at` (timestamptz) - Payment completion timestamp
  - Timestamps: created_at, updated_at

  ### `subscription_invoices`
  Invoice management
  - `id` (uuid, primary key)
  - `organization_id` (uuid) - Reference to organizations
  - `stripe_invoice_id` (text, unique) - Stripe invoice reference
  - `invoice_number` (text, unique) - Human-readable invoice number
  - `status` (text) - draft, open, paid, void, uncollectible
  - `amount_due` (numeric) - Total amount due
  - `amount_paid` (numeric) - Amount paid
  - `tax` (numeric) - Tax amount
  - `currency` (text) - Currency code
  - `billing_period_start` (timestamptz) - Period start
  - `billing_period_end` (timestamptz) - Period end
  - `due_date` (timestamptz) - Payment due date
  - `paid_at` (timestamptz) - Payment date
  - `invoice_pdf_url` (text) - PDF download URL
  - `line_items` (jsonb) - Invoice line items
  - Timestamps: created_at, updated_at

  ## 2. Modify Existing Tables
  
  Add `tenant_id` (uuid) to all user-created content tables:
  - users (links to organization via user_organizations)
  - properties
  - residents
  - support_plans
  - incidents
  - financial_records
  - staff_members
  - activities
  - progress_tracking
  
  ## 3. Security - Row Level Security (RLS)
  
  Enable RLS on all tables and create policies ensuring:
  - Users can only access data from their organization (tenant_id)
  - Admin role can manage organization settings
  - Manager/Coordinator can view and modify operational data
  - Support workers can access assigned residents only
  - Residents can view their own data only
  
  ## 4. Indexes
  
  Create indexes for performance:
  - tenant_id on all tables (critical for multi-tenant queries)
  - organization slug for lookups
  - user_organizations (user_id, organization_id, role)
  - subscription status and tier
  
  ## 5. Important Notes
  
  - All tenant_id columns are NOT NULL with foreign key to organizations
  - Default values prevent accidental global access
  - RLS policies are RESTRICTIVE by default
  - Subscription limits enforced at application and database level
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CREATE ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('charity', 'housing_association', 'local_authority', 'national_provider')),
  registration_number TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  subscription_tier TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled', 'paused')),
  max_residents INTEGER NOT NULL DEFAULT 25,
  max_properties INTEGER NOT NULL DEFAULT 1,
  current_resident_count INTEGER NOT NULL DEFAULT 0,
  current_property_count INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  trial_start_date TIMESTAMPTZ DEFAULT now(),
  trial_end_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  features_enabled JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. CREATE SUBSCRIPTION PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_annual NUMERIC(10,2) NOT NULL,
  max_residents INTEGER NOT NULL,
  max_properties INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_annual TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. CREATE USER ORGANIZATIONS MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'coordinator', 'support_worker', 'resident')),
  is_primary BOOLEAN DEFAULT false,
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- ============================================================================
-- 4. CREATE SUBSCRIPTION USAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  resident_count INTEGER DEFAULT 0,
  property_count INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  features_used JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. CREATE PAYMENT TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  description TEXT,
  invoice_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. CREATE SUBSCRIPTION INVOICES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  amount_due NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  billing_period_start TIMESTAMPTZ NOT NULL,
  billing_period_end TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  invoice_pdf_url TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. ADD TENANT_ID TO EXISTING TABLES
-- ============================================================================

-- Add tenant_id to properties
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE properties ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);
  END IF;
END $$;

-- Add tenant_id to residents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'residents' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE residents ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_residents_tenant_id ON residents(tenant_id);
  END IF;
END $$;

-- Add tenant_id to support_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'support_plans' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE support_plans ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_support_plans_tenant_id ON support_plans(tenant_id);
  END IF;
END $$;

-- Add tenant_id to incidents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE incidents ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON incidents(tenant_id);
  END IF;
END $$;

-- Add tenant_id to financial_records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_records' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE financial_records ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_financial_records_tenant_id ON financial_records(tenant_id);
  END IF;
END $$;

-- Add tenant_id to staff_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_members' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE staff_members ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_staff_members_tenant_id ON staff_members(tenant_id);
  END IF;
END $$;

-- Add tenant_id to activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE activities ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
  END IF;
END $$;

-- Add tenant_id to progress_tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'progress_tracking' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE progress_tracking ADD COLUMN tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_progress_tracking_tenant_id ON progress_tracking(tenant_id);
  END IF;
END $$;

-- ============================================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription_status ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON user_organizations(role);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_org_id ON subscription_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_org_id ON payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_org_id ON subscription_invoices(organization_id);

-- ============================================================================
-- 9. INSERT DEFAULT SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_annual, max_residents, max_properties, features, sort_order)
VALUES 
  (
    'starter',
    'Starter Plan',
    'Perfect for small charities and pilot projects',
    199.00,
    169.00,
    25,
    1,
    '{
      "resident_management": true,
      "basic_reporting": true,
      "progress_tracking": true,
      "mobile_app": true,
      "email_support": true,
      "multi_property": false,
      "advanced_analytics": false,
      "crisis_intervention": false,
      "api_access": false,
      "white_label": false,
      "ai_analytics": false
    }'::jsonb,
    1
  ),
  (
    'professional',
    'Professional Plan',
    'For medium-sized housing organizations',
    499.00,
    429.00,
    100,
    5,
    '{
      "resident_management": true,
      "basic_reporting": true,
      "progress_tracking": true,
      "mobile_app": true,
      "email_support": true,
      "multi_property": true,
      "advanced_analytics": true,
      "crisis_intervention": true,
      "api_access": true,
      "white_label": true,
      "local_authority_integration": true,
      "gamified_tracking": true,
      "dedicated_support": true,
      "ai_analytics": false
    }'::jsonb,
    2
  ),
  (
    'enterprise',
    'Enterprise Plan',
    'For national providers and large institutions',
    1299.00,
    1099.00,
    999999,
    999,
    '{
      "resident_management": true,
      "basic_reporting": true,
      "progress_tracking": true,
      "mobile_app": true,
      "email_support": true,
      "multi_property": true,
      "advanced_analytics": true,
      "crisis_intervention": true,
      "api_access": true,
      "white_label": true,
      "local_authority_integration": true,
      "gamified_tracking": true,
      "dedicated_support": true,
      "ai_analytics": true,
      "custom_features": true,
      "on_premise": true,
      "priority_support": true,
      "sla_guarantee": true,
      "training_programs": true
    }'::jsonb,
    3
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 11. CREATE RLS POLICIES FOR ORGANIZATIONS
-- ============================================================================

-- Organizations: Users can view their own organization
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Organizations: Admins can update their organization
CREATE POLICY "Admins can update own organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Organizations: New organizations can be created by any authenticated user
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 12. CREATE RLS POLICIES FOR USER_ORGANIZATIONS
-- ============================================================================

-- User Organizations: Users can view their own memberships
CREATE POLICY "Users can view own organization memberships"
  ON user_organizations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- User Organizations: Admins can manage memberships in their org
CREATE POLICY "Admins can manage organization memberships"
  ON user_organizations FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ============================================================================
-- 13. CREATE RLS POLICIES FOR SUBSCRIPTION DATA
-- ============================================================================

-- Subscription plans are public (read-only)
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Usage data: Admins can view their org usage
CREATE POLICY "Admins can view organization usage"
  ON subscription_usage FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Payment transactions: Admins can view their org payments
CREATE POLICY "Admins can view organization payments"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Invoices: Admins can view their org invoices
CREATE POLICY "Admins can view organization invoices"
  ON subscription_invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- ============================================================================
-- 14. CREATE RLS POLICIES FOR TENANT DATA (EXISTING TABLES)
-- ============================================================================

-- Properties: Users can only view properties in their org
CREATE POLICY "Users can view organization properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage organization properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator')
      AND status = 'active'
    )
  );

-- Residents: Users can only view residents in their org
CREATE POLICY "Users can view organization residents"
  ON residents FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff can manage organization residents"
  ON residents FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Support Plans: Similar tenant isolation
CREATE POLICY "Users can view organization support plans"
  ON support_plans FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff can manage organization support plans"
  ON support_plans FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Incidents: Tenant isolation
CREATE POLICY "Users can view organization incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff can manage organization incidents"
  ON incidents FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Financial Records: Restricted to admin/manager
CREATE POLICY "Managers can view organization financial records"
  ON financial_records FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage organization financial records"
  ON financial_records FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager')
      AND status = 'active'
    )
  );

-- Staff Members: Tenant isolation
CREATE POLICY "Users can view organization staff"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Managers can manage organization staff"
  ON staff_members FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator')
      AND status = 'active'
    )
  );

-- Activities: Tenant isolation
CREATE POLICY "Users can view organization activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff can manage organization activities"
  ON activities FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Progress Tracking: Tenant isolation
CREATE POLICY "Users can view organization progress tracking"
  ON progress_tracking FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Staff can manage organization progress tracking"
  ON progress_tracking FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- ============================================================================
-- 15. CREATE FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- ============================================================================

-- Function to check if organization has reached resident limit
CREATE OR REPLACE FUNCTION check_resident_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT current_resident_count >= max_residents 
    FROM organizations 
    WHERE id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'Resident limit reached for this organization. Please upgrade your subscription.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce resident limit
DROP TRIGGER IF EXISTS enforce_resident_limit ON residents;
CREATE TRIGGER enforce_resident_limit
  BEFORE INSERT ON residents
  FOR EACH ROW
  EXECUTE FUNCTION check_resident_limit();

-- Function to update organization resident count
CREATE OR REPLACE FUNCTION update_organization_resident_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations 
    SET current_resident_count = current_resident_count + 1,
        updated_at = now()
    WHERE id = NEW.tenant_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations 
    SET current_resident_count = GREATEST(current_resident_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.tenant_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain resident count
DROP TRIGGER IF EXISTS maintain_resident_count ON residents;
CREATE TRIGGER maintain_resident_count
  AFTER INSERT OR DELETE ON residents
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_resident_count();

-- Function to update organization property count
CREATE OR REPLACE FUNCTION update_organization_property_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations 
    SET current_property_count = current_property_count + 1,
        updated_at = now()
    WHERE id = NEW.tenant_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations 
    SET current_property_count = GREATEST(current_property_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.tenant_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain property count
DROP TRIGGER IF EXISTS maintain_property_count ON properties;
CREATE TRIGGER maintain_property_count
  AFTER INSERT OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_property_count();
