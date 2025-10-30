/*
  # Fix RLS Performance and Security Issues

  ## Issues Addressed

  1. **RLS Performance Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents function re-evaluation for each row, improving query performance at scale

  2. **Remove Duplicate Policies**
     - Drop old "Authenticated users can..." policies that conflict with new multi-tenant policies
     - Keep only the new tenant-aware policies for proper isolation

  3. **Function Security**
     - Set search_path for all functions to prevent search path manipulation attacks

  4. **Note on Unused Indexes**
     - Indexes are newly created and will be used as data grows
     - They are critical for multi-tenant query performance

  ## Changes Made

  ### Organizations Table
  - Fixed: Users can view own organization
  - Fixed: Admins can update own organization

  ### User Organizations Table
  - Fixed: Users can view own organization memberships
  - Fixed: Admins can manage organization memberships

  ### Properties Table
  - Fixed: Users can view organization properties
  - Fixed: Managers can manage organization properties
  - Removed: Duplicate "Authenticated users" policies

  ### Residents Table
  - Fixed: Users can view organization residents
  - Fixed: Staff can manage organization residents
  - Removed: Duplicate "Authenticated users" policies

  ### Support Plans Table
  - Fixed: Users can view organization support plans
  - Fixed: Staff can manage organization support plans
  - Removed: Duplicate "Authenticated users" policies

  ### Incidents Table
  - Fixed: Users can view organization incidents
  - Fixed: Staff can manage organization incidents
  - Removed: Duplicate "Authenticated users" policies

  ### Financial Records Table
  - Fixed: Managers can view organization financial records
  - Fixed: Managers can manage organization financial records
  - Removed: Duplicate "Authenticated users" policies

  ### Staff Members Table
  - Fixed: Users can view organization staff
  - Fixed: Managers can manage organization staff
  - Removed: Duplicate "Authenticated users" policies

  ### Activities Table
  - Fixed: Users can view organization activities
  - Fixed: Staff can manage organization activities
  - Removed: Duplicate "Authenticated users" policies

  ### Progress Tracking Table
  - Fixed: Users can view organization progress tracking
  - Fixed: Staff can manage organization progress tracking
  - Removed: Duplicate "Authenticated users" policies

  ### Subscription Tables
  - Fixed: Admins can view organization usage
  - Fixed: Admins can view organization payments
  - Fixed: Admins can view organization invoices

  ### Users Table
  - Fixed: Users can read own profile
  - Fixed: Users can update own profile
*/

-- ============================================================================
-- STEP 1: DROP OLD DUPLICATE POLICIES
-- ============================================================================

-- Activities
DROP POLICY IF EXISTS "Authenticated users can manage activities" ON activities;
DROP POLICY IF EXISTS "Authenticated users can view activities" ON activities;

-- Financial Records
DROP POLICY IF EXISTS "Authenticated users can manage financial records" ON financial_records;
DROP POLICY IF EXISTS "Authenticated users can view financial records" ON financial_records;

-- Incidents
DROP POLICY IF EXISTS "Authenticated users can manage incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can view incidents" ON incidents;

-- Progress Tracking
DROP POLICY IF EXISTS "Authenticated users can manage progress tracking" ON progress_tracking;
DROP POLICY IF EXISTS "Authenticated users can view progress tracking" ON progress_tracking;

-- Properties
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can view properties" ON properties;

-- Residents
DROP POLICY IF EXISTS "Authenticated users can manage residents" ON residents;
DROP POLICY IF EXISTS "Authenticated users can view residents" ON residents;

-- Staff Members
DROP POLICY IF EXISTS "Authenticated users can manage staff" ON staff_members;
DROP POLICY IF EXISTS "Authenticated users can view staff" ON staff_members;

-- Support Plans
DROP POLICY IF EXISTS "Authenticated users can manage support plans" ON support_plans;
DROP POLICY IF EXISTS "Authenticated users can view support plans" ON support_plans;

-- ============================================================================
-- STEP 2: DROP AND RECREATE OPTIMIZED POLICIES
-- ============================================================================

-- Organizations Table
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins can update own organization" ON organizations;
CREATE POLICY "Admins can update own organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- User Organizations Table
DROP POLICY IF EXISTS "Users can view own organization memberships" ON user_organizations;
CREATE POLICY "Users can view own organization memberships"
  ON user_organizations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can manage organization memberships" ON user_organizations;
CREATE POLICY "Admins can manage organization memberships"
  ON user_organizations FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- Subscription Usage
DROP POLICY IF EXISTS "Admins can view organization usage" ON subscription_usage;
CREATE POLICY "Admins can view organization usage"
  ON subscription_usage FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- Payment Transactions
DROP POLICY IF EXISTS "Admins can view organization payments" ON payment_transactions;
CREATE POLICY "Admins can view organization payments"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- Subscription Invoices
DROP POLICY IF EXISTS "Admins can view organization invoices" ON subscription_invoices;
CREATE POLICY "Admins can view organization invoices"
  ON subscription_invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- Properties Table
DROP POLICY IF EXISTS "Users can view organization properties" ON properties;
CREATE POLICY "Users can view organization properties"
  ON properties FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage organization properties" ON properties;
CREATE POLICY "Managers can manage organization properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator')
      AND status = 'active'
    )
  );

-- Residents Table
DROP POLICY IF EXISTS "Users can view organization residents" ON residents;
CREATE POLICY "Users can view organization residents"
  ON residents FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff can manage organization residents" ON residents;
CREATE POLICY "Staff can manage organization residents"
  ON residents FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Support Plans Table
DROP POLICY IF EXISTS "Users can view organization support plans" ON support_plans;
CREATE POLICY "Users can view organization support plans"
  ON support_plans FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff can manage organization support plans" ON support_plans;
CREATE POLICY "Staff can manage organization support plans"
  ON support_plans FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Incidents Table
DROP POLICY IF EXISTS "Users can view organization incidents" ON incidents;
CREATE POLICY "Users can view organization incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff can manage organization incidents" ON incidents;
CREATE POLICY "Staff can manage organization incidents"
  ON incidents FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Financial Records Table
DROP POLICY IF EXISTS "Managers can view organization financial records" ON financial_records;
CREATE POLICY "Managers can view organization financial records"
  ON financial_records FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager')
      AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage organization financial records" ON financial_records;
CREATE POLICY "Managers can manage organization financial records"
  ON financial_records FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager')
      AND status = 'active'
    )
  );

-- Staff Members Table
DROP POLICY IF EXISTS "Users can view organization staff" ON staff_members;
CREATE POLICY "Users can view organization staff"
  ON staff_members FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can manage organization staff" ON staff_members;
CREATE POLICY "Managers can manage organization staff"
  ON staff_members FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator')
      AND status = 'active'
    )
  );

-- Activities Table
DROP POLICY IF EXISTS "Users can view organization activities" ON activities;
CREATE POLICY "Users can view organization activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff can manage organization activities" ON activities;
CREATE POLICY "Staff can manage organization activities"
  ON activities FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Progress Tracking Table
DROP POLICY IF EXISTS "Users can view organization progress tracking" ON progress_tracking;
CREATE POLICY "Users can view organization progress tracking"
  ON progress_tracking FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) AND status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff can manage organization progress tracking" ON progress_tracking;
CREATE POLICY "Staff can manage organization progress tracking"
  ON progress_tracking FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = (select auth.uid()) 
      AND role IN ('admin', 'manager', 'coordinator', 'support_worker')
      AND status = 'active'
    )
  );

-- Users Table (if RLS is enabled)
DO $$
BEGIN
  -- Check if RLS is enabled on users table
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND rowsecurity = true
  ) THEN
    -- Drop and recreate user policies
    DROP POLICY IF EXISTS "Users can read own profile" ON users;
    CREATE POLICY "Users can read own profile"
      ON users FOR SELECT
      TO authenticated
      USING (id = (select auth.uid())::text);

    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    CREATE POLICY "Users can update own profile"
      ON users FOR UPDATE
      TO authenticated
      USING (id = (select auth.uid())::text)
      WITH CHECK (id = (select auth.uid())::text);
  END IF;
END $$;

-- ============================================================================
-- STEP 3: FIX FUNCTION SECURITY - SET IMMUTABLE SEARCH PATH
-- ============================================================================

-- Fix check_resident_limit function
CREATE OR REPLACE FUNCTION check_resident_limit()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
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
$$;

-- Fix update_organization_resident_count function
CREATE OR REPLACE FUNCTION update_organization_resident_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
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
$$;

-- Fix update_organization_property_count function
CREATE OR REPLACE FUNCTION update_organization_property_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
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
$$;

-- ============================================================================
-- STEP 4: CREATE HELPER FUNCTION FOR BETTER PERFORMANCE
-- ============================================================================

-- Create a stable function to get current user's organization IDs
-- This can be cached within a query for better performance
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID)
RETURNS TABLE(organization_id UUID, role TEXT)
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT uo.organization_id, uo.role
  FROM user_organizations uo
  WHERE uo.user_id = p_user_id
    AND uo.status = 'active';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_organizations(UUID) TO authenticated;

-- ============================================================================
-- SUMMARY
-- ============================================================================

/*
  All RLS policies have been optimized with (select auth.uid()) pattern.
  This ensures auth.uid() is evaluated once per query rather than per row.
  
  Duplicate policies have been removed to eliminate conflicts.
  
  Functions now have immutable search_path for security.
  
  Helper function created for potential future optimization.
  
  Indexes are in place and will be utilized as the database grows.
*/
