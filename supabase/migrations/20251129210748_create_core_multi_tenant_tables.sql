/*
  # Create Core Multi-Tenant Tables
  
  Creates the foundational multi-tenant architecture for YUTHUB Housing Platform.
  
  ## Tables Created:
  1. organizations - Core tenant/organization management
  2. subscription_plans - Available subscription tiers
  3. user_organizations - User-to-organization mapping with roles
  4. subscription_usage - Usage tracking for billing
  5. payment_transactions - Payment history
  6. subscription_invoices - Invoice management
  
  ## Security:
  - RLS will be enabled in subsequent migration
  - All tables include created_at/updated_at timestamps
  - Foreign keys for referential integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations Table
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

-- Subscription Plans Table
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

-- User Organizations Mapping
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

-- Subscription Usage Tracking
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

-- Payment Transactions
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

-- Subscription Invoices
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_organization_id ON subscription_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_organization_id ON payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_organization_id ON subscription_invoices(organization_id);
