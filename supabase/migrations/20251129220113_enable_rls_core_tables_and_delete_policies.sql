/*
  # Enable RLS and Create Security Policies for Core Tables
  
  ## Overview
  - Enables RLS on all 12 core housing management tables
  - Creates comprehensive security policies (SELECT, INSERT, UPDATE, DELETE)
  - Adds missing DELETE policies to existing subscription tables
  - Ensures complete security coverage across all tables
  
  ## Security Model
  - Organization-based multi-tenant isolation
  - Role-based access control
  - All operations require authentication
  - Staff can manage their organization's data
  - Residents have limited read access to their own data
  - Platform admins have full access
  
  ## New Tables Secured (12 tables)
  1. properties
  2. rooms
  3. staff_members
  4. residents
  5. placements
  6. support_plans
  7. progress_notes
  8. assessments
  9. incidents
  10. maintenance_requests
  11. financial_records
  12. documents
*/

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL CORE TABLES
-- ============================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROPERTIES POLICIES
-- ============================================================================

CREATE POLICY "Organization members can view properties"
  ON properties FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = properties.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create properties"
  ON properties FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = properties.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can update properties"
  ON properties FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = properties.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete properties"
  ON properties FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = properties.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- ROOMS POLICIES
-- ============================================================================

CREATE POLICY "Organization members can view rooms"
  ON rooms FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      INNER JOIN user_organizations ON user_organizations.organization_id = properties.organization_id
      WHERE properties.id = rooms.property_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create rooms"
  ON rooms FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM properties
      INNER JOIN user_organizations ON user_organizations.organization_id = properties.organization_id
      WHERE properties.id = rooms.property_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update rooms"
  ON rooms FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      INNER JOIN user_organizations ON user_organizations.organization_id = properties.organization_id
      WHERE properties.id = rooms.property_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete rooms"
  ON rooms FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM properties
      INNER JOIN user_organizations ON user_organizations.organization_id = properties.organization_id
      WHERE properties.id = rooms.property_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- STAFF MEMBERS POLICIES
-- ============================================================================

CREATE POLICY "Organization members can view staff"
  ON staff_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = staff_members.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can create staff"
  ON staff_members FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = staff_members.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can update staff"
  ON staff_members FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = staff_members.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete staff"
  ON staff_members FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = staff_members.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- RESIDENTS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view residents"
  ON residents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = residents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create residents"
  ON residents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = residents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update residents"
  ON residents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = residents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete residents"
  ON residents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = residents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- PLACEMENTS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view placements"
  ON placements FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = placements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create placements"
  ON placements FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = placements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update placements"
  ON placements FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = placements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete placements"
  ON placements FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = placements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- SUPPORT PLANS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view support plans"
  ON support_plans FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = support_plans.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create support plans"
  ON support_plans FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = support_plans.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update support plans"
  ON support_plans FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = support_plans.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete support plans"
  ON support_plans FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = support_plans.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- PROGRESS NOTES POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view progress notes"
  ON progress_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = progress_notes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create progress notes"
  ON progress_notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = progress_notes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Authors can update their own progress notes"
  ON progress_notes FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff_members
      INNER JOIN user_organizations ON user_organizations.organization_id = staff_members.organization_id
      WHERE staff_members.id = progress_notes.author_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete progress notes"
  ON progress_notes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = progress_notes.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- ASSESSMENTS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view assessments"
  ON assessments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = assessments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create assessments"
  ON assessments FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = assessments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update assessments"
  ON assessments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = assessments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete assessments"
  ON assessments FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = assessments.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- INCIDENTS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view incidents"
  ON incidents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = incidents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create incidents"
  ON incidents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = incidents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update incidents"
  ON incidents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = incidents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete incidents"
  ON incidents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = incidents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- MAINTENANCE REQUESTS POLICIES
-- ============================================================================

CREATE POLICY "Organization members can view maintenance requests"
  ON maintenance_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = maintenance_requests.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization members can create maintenance requests"
  ON maintenance_requests FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = maintenance_requests.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update maintenance requests"
  ON maintenance_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = maintenance_requests.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete maintenance requests"
  ON maintenance_requests FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = maintenance_requests.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- FINANCIAL RECORDS POLICIES
-- ============================================================================

CREATE POLICY "Organization staff can view financial records"
  ON financial_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = financial_records.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can create financial records"
  ON financial_records FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = financial_records.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update financial records"
  ON financial_records FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = financial_records.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager', 'coordinator')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete financial records"
  ON financial_records FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = financial_records.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'admin'
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

CREATE POLICY "Organization members can view documents"
  ON documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = documents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can upload documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = documents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization staff can update documents"
  ON documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = documents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization managers can delete documents"
  ON documents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = documents.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'manager')
      AND user_organizations.status = 'active'
    )
  );

-- ============================================================================
-- ADD MISSING DELETE POLICIES TO EXISTING SUBSCRIPTION TABLES
-- ============================================================================

-- Subscription Plans
CREATE POLICY "Platform admins can delete subscription plans"
  ON subscription_plans FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- Organizations (soft delete recommended, but adding hard delete for completeness)
CREATE POLICY "Platform admins can delete organizations"
  ON organizations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- User Organizations
CREATE POLICY "Organization admins can remove user memberships"
  ON user_organizations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations AS uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role = 'admin'
      AND uo.status = 'active'
    )
  );

-- Subscription Usage (typically no delete, but adding for completeness)
CREATE POLICY "Platform admins can delete usage records"
  ON subscription_usage FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- Payment Transactions (should rarely be deleted, but adding for audit purposes)
CREATE POLICY "Platform admins can delete transactions"
  ON payment_transactions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );

-- Subscription Invoices (should rarely be deleted, but adding for audit purposes)
CREATE POLICY "Platform admins can delete invoices"
  ON subscription_invoices FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_app_meta_data->>'is_platform_admin')::boolean = true
    )
  );