/*
  # Fix Performance and Security Issues

  ## Overview
  Addresses critical database performance and security issues:
  - Missing foreign key indexes (22 indexes)
  - RLS policy optimization (subquery conversion)
  - Unused index cleanup (50+ indexes)
  - Multiple permissive policies consolidation
  - Function search path security

  ## Impact
  - Dramatically improved query performance
  - Reduced per-row RLS evaluation overhead
  - Improved write performance (fewer unused indexes)
  - Enhanced security posture
*/

-- =====================================================
-- PART 1: ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_assessments_assessor_id ON public.assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_assessments_reviewer_id ON public.assessments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_documents_incident_id ON public.documents(incident_id);
CREATE INDEX IF NOT EXISTS idx_documents_support_plan_id ON public.documents(support_plan_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_financial_records_recorded_by_id ON public.financial_records(recorded_by_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_related_placement_id ON public.financial_records(related_placement_id);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to_id ON public.incidents(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by_id ON public.incidents(reported_by_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_to_id ON public.maintenance_requests(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_requested_by_id ON public.maintenance_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_room_id ON public.maintenance_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_organization_id ON public.payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_placements_key_worker_id ON public.placements(key_worker_id);
CREATE INDEX IF NOT EXISTS idx_placements_room_id ON public.placements(room_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_support_plan_id ON public.progress_notes(support_plan_id);
CREATE INDEX IF NOT EXISTS idx_residents_current_room_id ON public.residents(current_room_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_organization_id ON public.subscription_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_organization_id ON public.subscription_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_created_by_id ON public.support_plans(created_by_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_reviewed_by_id ON public.support_plans(reviewed_by_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON public.user_organizations(organization_id);

-- =====================================================
-- PART 2: REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.idx_properties_organization_id;
DROP INDEX IF EXISTS public.idx_properties_status;
DROP INDEX IF EXISTS public.idx_properties_manager_id;
DROP INDEX IF EXISTS public.idx_rooms_property_id;
DROP INDEX IF EXISTS public.idx_rooms_current_resident_id;
DROP INDEX IF EXISTS public.idx_rooms_is_available;
DROP INDEX IF EXISTS public.idx_staff_organization_id;
DROP INDEX IF EXISTS public.idx_staff_user_id;
DROP INDEX IF EXISTS public.idx_staff_email;
DROP INDEX IF EXISTS public.idx_staff_employment_status;
DROP INDEX IF EXISTS public.idx_residents_organization_id;
DROP INDEX IF EXISTS public.idx_residents_reference_number;
DROP INDEX IF EXISTS public.idx_residents_current_property_id;
DROP INDEX IF EXISTS public.idx_residents_key_worker_id;
DROP INDEX IF EXISTS public.idx_residents_status;
DROP INDEX IF EXISTS public.idx_placements_organization_id;
DROP INDEX IF EXISTS public.idx_placements_resident_id;
DROP INDEX IF EXISTS public.idx_placements_property_id;
DROP INDEX IF EXISTS public.idx_placements_status;
DROP INDEX IF EXISTS public.idx_support_plans_organization_id;
DROP INDEX IF EXISTS public.idx_support_plans_resident_id;
DROP INDEX IF EXISTS public.idx_support_plans_status;
DROP INDEX IF EXISTS public.idx_support_plans_review_date;
DROP INDEX IF EXISTS public.idx_progress_notes_organization_id;
DROP INDEX IF EXISTS public.idx_progress_notes_resident_id;
DROP INDEX IF EXISTS public.idx_progress_notes_author_id;
DROP INDEX IF EXISTS public.idx_progress_notes_note_date;
DROP INDEX IF EXISTS public.idx_assessments_organization_id;
DROP INDEX IF EXISTS public.idx_assessments_resident_id;
DROP INDEX IF EXISTS public.idx_assessments_assessment_date;
DROP INDEX IF EXISTS public.idx_assessments_status;
DROP INDEX IF EXISTS public.idx_incidents_organization_id;
DROP INDEX IF EXISTS public.idx_incidents_resident_id;
DROP INDEX IF EXISTS public.idx_incidents_property_id;
DROP INDEX IF EXISTS public.idx_incidents_incident_date;
DROP INDEX IF EXISTS public.idx_incidents_status;
DROP INDEX IF EXISTS public.idx_incidents_severity;
DROP INDEX IF EXISTS public.idx_maintenance_organization_id;
DROP INDEX IF EXISTS public.idx_maintenance_property_id;
DROP INDEX IF EXISTS public.idx_maintenance_status;
DROP INDEX IF EXISTS public.idx_maintenance_priority;
DROP INDEX IF EXISTS public.idx_financial_organization_id;
DROP INDEX IF EXISTS public.idx_financial_resident_id;
DROP INDEX IF EXISTS public.idx_financial_transaction_date;
DROP INDEX IF EXISTS public.idx_financial_status;
DROP INDEX IF EXISTS public.idx_documents_organization_id;
DROP INDEX IF EXISTS public.idx_documents_resident_id;
DROP INDEX IF EXISTS public.idx_documents_property_id;
DROP INDEX IF EXISTS public.idx_documents_staff_id;
DROP INDEX IF EXISTS public.idx_documents_document_type;

-- =====================================================
-- PART 3: FIX TRIGGER FUNCTION SEARCH PATH
-- =====================================================

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'organizations', 'properties', 'rooms', 'staff_members', 'residents',
      'placements', 'support_plans', 'progress_notes', 'assessments',
      'incidents', 'maintenance_requests', 'financial_records', 'documents',
      'subscription_plans', 'subscription_usage', 'payment_transactions',
      'subscription_invoices', 'user_organizations'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END$$;

-- =====================================================
-- PART 4: FIX MULTIPLE PERMISSIVE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Organization admins can view organization memberships" ON public.user_organizations;

CREATE POLICY "Users can view relevant memberships"
  ON public.user_organizations FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization admins can update memberships" ON public.user_organizations;
DROP POLICY IF EXISTS "Users can accept their own invitations" ON public.user_organizations;

CREATE POLICY "Users can update relevant memberships"
  ON public.user_organizations FOR UPDATE TO authenticated
  USING (
    (user_id = (SELECT auth.uid()) AND status = 'invited') OR
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'owner')
    )
  );

-- =====================================================
-- PART 5: OPTIMIZE RLS POLICIES WITH SUBQUERIES
-- =====================================================

-- Organizations
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organizations.id
      AND uo.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Platform admins can create organizations" ON public.organizations;
CREATE POLICY "Platform admins can create organizations"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'platform_admin');

DROP POLICY IF EXISTS "Organization admins can update their organization" ON public.organizations;
CREATE POLICY "Organization admins can update their organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = organizations.id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "Platform admins can delete organizations" ON public.organizations;
CREATE POLICY "Platform admins can delete organizations"
  ON public.organizations FOR DELETE TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'platform_admin');

-- Subscription plans
DROP POLICY IF EXISTS "Platform admins can insert subscription plans" ON public.subscription_plans;
CREATE POLICY "Platform admins can insert subscription plans"
  ON public.subscription_plans FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'role') = 'platform_admin');

DROP POLICY IF EXISTS "Platform admins can update subscription plans" ON public.subscription_plans;
CREATE POLICY "Platform admins can update subscription plans"
  ON public.subscription_plans FOR UPDATE TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'platform_admin');

DROP POLICY IF EXISTS "Platform admins can delete subscription plans" ON public.subscription_plans;
CREATE POLICY "Platform admins can delete subscription plans"
  ON public.subscription_plans FOR DELETE TO authenticated
  USING ((SELECT auth.jwt()->>'role') = 'platform_admin');

-- Properties
DROP POLICY IF EXISTS "Organization members can view properties" ON public.properties;
CREATE POLICY "Organization members can view properties"
  ON public.properties FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = properties.organization_id
      AND uo.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Organization staff can create properties" ON public.properties;
CREATE POLICY "Organization staff can create properties"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = properties.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'manager', 'staff', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization managers can update properties" ON public.properties;
CREATE POLICY "Organization managers can update properties"
  ON public.properties FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = properties.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'manager', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization admins can delete properties" ON public.properties;
CREATE POLICY "Organization admins can delete properties"
  ON public.properties FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = properties.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'owner')
    )
  );

-- Residents
DROP POLICY IF EXISTS "Organization staff can view residents" ON public.residents;
CREATE POLICY "Organization staff can view residents"
  ON public.residents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = residents.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'manager', 'staff', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization staff can create residents" ON public.residents;
CREATE POLICY "Organization staff can create residents"
  ON public.residents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = residents.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'manager', 'staff', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization staff can update residents" ON public.residents;
CREATE POLICY "Organization staff can update residents"
  ON public.residents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = residents.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'manager', 'staff', 'owner')
    )
  );

DROP POLICY IF EXISTS "Organization admins can delete residents" ON public.residents;
CREATE POLICY "Organization admins can delete residents"
  ON public.residents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations uo
      WHERE uo.organization_id = residents.organization_id
      AND uo.user_id = (SELECT auth.uid())
      AND uo.role IN ('admin', 'owner')
    )
  );

-- Analyze tables
ANALYZE public.assessments;
ANALYZE public.documents;
ANALYZE public.financial_records;
ANALYZE public.incidents;
ANALYZE public.maintenance_requests;
ANALYZE public.payment_transactions;
ANALYZE public.placements;
ANALYZE public.progress_notes;
ANALYZE public.residents;
ANALYZE public.subscription_invoices;
ANALYZE public.subscription_usage;
ANALYZE public.support_plans;
ANALYZE public.user_organizations;
ANALYZE public.organizations;
ANALYZE public.properties;