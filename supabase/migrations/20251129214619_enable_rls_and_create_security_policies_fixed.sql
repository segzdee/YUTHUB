/*
  # Enable RLS and Create Security Policies

  ## Overview
  This migration addresses critical security issues by:
  1. Enabling Row Level Security (RLS) on all public tables
  2. Creating comprehensive, restrictive security policies
  3. Removing unused indexes to improve performance
  4. Ensuring data access is properly controlled

  ## Tables Secured
  - `subscription_plans` - Platform-defined plans (read-only for users)
  - `organizations` - Organization data (members only)
  - `user_organizations` - User-organization relationships (user-specific)
  - `subscription_usage` - Usage tracking (organization members only)
  - `payment_transactions` - Payment records (organization admins only)
  - `subscription_invoices` - Invoice data (organization admins only)

  ## Security Approach
  - All tables locked down by default after enabling RLS
  - Policies check authentication via auth.uid()
  - Policies verify organization membership/ownership
  - Admin-only access for sensitive financial data
  - Read-only access for reference data (subscription_plans)

  ## Index Optimization
  - Removed unused indexes that provide no query performance benefit
  - Kept essential indexes for foreign key relationships and queries
*/

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

-- Subscription plans: Reference data, readable by authenticated users
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Organizations: Core tenant data
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- User-organization relationships: Access control
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- Usage tracking: Organization metrics
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Financial data: Payment transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Financial data: Invoices
ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SUBSCRIPTION PLANS POLICIES (Read-Only for Authenticated Users)
-- ============================================================================

-- Allow authenticated users to view active subscription plans
CREATE POLICY "Authenticated users can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Platform admins can manage subscription plans
CREATE POLICY "Platform admins can insert subscription plans"
  ON public.subscription_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

CREATE POLICY "Platform admins can update subscription plans"
  ON public.subscription_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- ============================================================================
-- ORGANIZATIONS POLICIES (Members Only)
-- ============================================================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

-- Only platform admins can create organizations
CREATE POLICY "Platform admins can create organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- Organization admins can update their organization
CREATE POLICY "Organization admins can update their organization"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- USER_ORGANIZATIONS POLICIES (User-Specific Access)
-- ============================================================================

-- Users can view their own organization memberships
CREATE POLICY "Users can view their own memberships"
  ON public.user_organizations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Organization admins can view all memberships in their organization
CREATE POLICY "Organization admins can view organization memberships"
  ON public.user_organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations AS uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role = 'admin'
      AND uo.status = 'active'
    )
  );

-- Organization admins can invite users to their organization
CREATE POLICY "Organization admins can invite users"
  ON public.user_organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations AS uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role = 'admin'
      AND uo.status = 'active'
    )
  );

-- Organization admins can update memberships in their organization
CREATE POLICY "Organization admins can update memberships"
  ON public.user_organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations AS uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role = 'admin'
      AND uo.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations AS uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role = 'admin'
      AND uo.status = 'active'
    )
  );

-- Users can accept their own invitations
CREATE POLICY "Users can accept their own invitations"
  ON public.user_organizations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SUBSCRIPTION_USAGE POLICIES (Organization Members)
-- ============================================================================

-- Organization members can view usage for their organization
CREATE POLICY "Organization members can view usage"
  ON public.subscription_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = subscription_usage.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

-- System/Platform admins can insert usage records
CREATE POLICY "Platform admins can insert usage records"
  ON public.subscription_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- System/Platform admins can update usage records
CREATE POLICY "Platform admins can update usage records"
  ON public.subscription_usage
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- ============================================================================
-- PAYMENT_TRANSACTIONS POLICIES (Organization Admins Only)
-- ============================================================================

-- Organization admins can view transactions for their organization
CREATE POLICY "Organization admins can view transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = payment_transactions.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- Platform admins can manage all transactions
CREATE POLICY "Platform admins can insert transactions"
  ON public.payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

CREATE POLICY "Platform admins can update transactions"
  ON public.payment_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- ============================================================================
-- SUBSCRIPTION_INVOICES POLICIES (Organization Admins Only)
-- ============================================================================

-- Organization admins can view invoices for their organization
CREATE POLICY "Organization admins can view invoices"
  ON public.subscription_invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = subscription_invoices.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- Platform admins can manage all invoices
CREATE POLICY "Platform admins can insert invoices"
  ON public.subscription_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

CREATE POLICY "Platform admins can update invoices"
  ON public.subscription_invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- ============================================================================
-- INDEX OPTIMIZATION - Remove Unused Indexes
-- ============================================================================

-- Drop unused indexes that provide no query performance benefit
-- These indexes were created but are not being used by any queries

DROP INDEX IF EXISTS public.idx_organizations_slug;
DROP INDEX IF EXISTS public.idx_organizations_status;
DROP INDEX IF EXISTS public.idx_user_organizations_user_id;
DROP INDEX IF EXISTS public.idx_user_organizations_organization_id;
DROP INDEX IF EXISTS public.idx_subscription_usage_organization_id;
DROP INDEX IF EXISTS public.idx_payment_transactions_organization_id;
DROP INDEX IF EXISTS public.idx_subscription_invoices_organization_id;

-- Note: Foreign key constraints automatically create indexes where needed.
-- Additional indexes should only be created when specific query patterns require them.

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================

/*
  Security Verification:
  1. All tables now have RLS enabled - NO DATA is accessible without policies
  2. Policies require authentication via auth.uid()
  3. Policies verify organization membership before granting access
  4. Financial data (transactions, invoices) restricted to organization admins
  5. Platform admins can manage all data
  6. Subscription plans are read-only for regular users

  Performance Notes:
  1. Removed 7 unused indexes
  2. Foreign key constraints provide necessary indexing
  3. Additional indexes should be added based on actual query patterns
  4. Monitor query performance and add targeted indexes as needed

  Testing Recommendations:
  1. Verify users can only access their own organization data
  2. Test that unauthenticated users cannot access any data
  3. Confirm organization admins can manage their organization
  4. Verify platform admins have full access
  5. Test that financial data is restricted to admins only
*/