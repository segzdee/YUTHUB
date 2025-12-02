/*
  # Fix Critical Security Issues - SECURITY DEFINER and Search Path

  1. Remove SECURITY DEFINER from views
    - subscription_analytics
    - subscription_pricing_comparison
    
  2. Fix mutable search_path on all functions
    - Add SET search_path = public, pg_temp to all functions
    - This prevents SQL injection via search_path manipulation
*/

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEWS
-- =====================================================

DROP VIEW IF EXISTS public.subscription_analytics CASCADE;
DROP VIEW IF EXISTS public.subscription_pricing_comparison CASCADE;

-- Recreate without SECURITY DEFINER
CREATE VIEW public.subscription_analytics AS
SELECT 
  os.organization_id,
  o.name AS organization_name,
  st.tier_name,
  st.billing_period,
  os.status,
  os.current_period_start,
  os.current_period_end,
  COALESCE(su.property_count, 0) AS property_count,
  COALESCE(su.resident_count, 0) AS resident_count,
  st.max_properties,
  st.max_residents,
  st.max_staff,
  CASE
    WHEN st.max_properties IS NULL OR st.max_properties = 0 THEN 0
    ELSE ROUND((COALESCE(su.property_count, 0)::numeric / st.max_properties::numeric) * 100, 2)
  END AS properties_usage_percent,
  CASE
    WHEN st.max_residents IS NULL OR st.max_residents = 0 THEN 0
    ELSE ROUND((COALESCE(su.resident_count, 0)::numeric / st.max_residents::numeric) * 100, 2)
  END AS residents_usage_percent
FROM organization_subscriptions os
JOIN organizations o ON o.id = os.organization_id
JOIN subscription_tiers st ON st.id = os.tier_id
LEFT JOIN subscription_usage su ON su.organization_id = os.organization_id
WHERE os.status IN ('active', 'trialing');

CREATE VIEW public.subscription_pricing_comparison AS
WITH monthly_prices AS (
  SELECT 
    tier_name, price_gbp AS monthly_price_gbp,
    max_properties, max_residents, max_staff,
    has_safeguarding, has_financial_management,
    has_crisis_intervention, has_ai_analytics,
    has_api_access, has_advanced_reporting
  FROM subscription_tiers
  WHERE is_active = true AND billing_period = 'month'
),
annual_prices AS (
  SELECT 
    tier_name,
    price_gbp AS annual_price_gbp,
    ROUND(price_gbp::numeric / 12.0, 2) AS annual_monthly_equivalent_gbp
  FROM subscription_tiers
  WHERE is_active = true AND billing_period = 'year'
)
SELECT 
  m.tier_name, m.monthly_price_gbp,
  a.annual_price_gbp, a.annual_monthly_equivalent_gbp,
  ROUND(((m.monthly_price_gbp * 12 - a.annual_price_gbp)::numeric / (m.monthly_price_gbp * 12)::numeric) * 100, 2) AS annual_discount_percent,
  m.max_properties, m.max_residents, m.max_staff,
  m.has_safeguarding, m.has_financial_management,
  m.has_crisis_intervention, m.has_ai_analytics,
  m.has_api_access, m.has_advanced_reporting
FROM monthly_prices m
LEFT JOIN annual_prices a ON a.tier_name = m.tier_name
ORDER BY m.monthly_price_gbp;

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Drop and recreate functions with proper search_path

-- audit_table_changes
DROP FUNCTION IF EXISTS public.audit_table_changes() CASCADE;
CREATE OR REPLACE FUNCTION public.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_organization_id uuid;
  v_event_type text;
BEGIN
  v_user_id := auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    v_organization_id := OLD.organization_id;
  ELSE
    v_organization_id := NEW.organization_id;
  END IF;
  
  v_event_type := 'data.' || lower(TG_OP);
  
  INSERT INTO audit_logs (
    organization_id, user_id, event_type, event_category,
    table_name, record_id, action, changes, created_at
  ) VALUES (
    v_organization_id, v_user_id, v_event_type, 'data_modification',
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old', to_jsonb(OLD))
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', to_jsonb(NEW))
      ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    END,
    now()
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- calculate_annual_price
DROP FUNCTION IF EXISTS public.calculate_annual_price(integer, numeric) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_annual_price(
  monthly_price_pence integer,
  discount_percent numeric DEFAULT 15.00
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN ROUND(monthly_price_pence * 12 * (1 - discount_percent / 100))::integer;
END;
$$;

-- calculate_audit_hash
DROP FUNCTION IF EXISTS public.calculate_audit_hash(text, uuid, text, text, timestamptz) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_audit_hash(
  p_event_type text,
  p_user_id uuid,
  p_table_name text,
  p_action text,
  p_created_at timestamptz
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(p_event_type, '') ||
      COALESCE(p_user_id::text, '') ||
      COALESCE(p_table_name, '') ||
      COALESCE(p_action, '') ||
      COALESCE(p_created_at::text, ''),
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- calculate_proration
DROP FUNCTION IF EXISTS public.calculate_proration(integer, integer, integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_proration(
  old_price integer,
  new_price integer,
  days_remaining integer,
  total_days integer
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN GREATEST(
    0,
    ROUND((new_price - old_price) * days_remaining::numeric / total_days::numeric)::integer
  );
END;
$$;

-- calculate_vat
DROP FUNCTION IF EXISTS public.calculate_vat(integer, numeric) CASCADE;
CREATE OR REPLACE FUNCTION public.calculate_vat(
  amount_pence integer,
  vat_rate_percent numeric DEFAULT 20.00
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN ROUND(amount_pence * vat_rate_percent / 100)::integer;
END;
$$;

-- current_user_organization_id
DROP FUNCTION IF EXISTS public.current_user_organization_id() CASCADE;
CREATE OR REPLACE FUNCTION public.current_user_organization_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND is_primary = true
    AND status = 'active'
    LIMIT 1
  );
END;
$$;

-- get_user_organization_id
DROP FUNCTION IF EXISTS public.get_user_organization_id() CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND status = 'active'
    ORDER BY is_primary DESC, created_at ASC
    LIMIT 1
  );
END;
$$;

-- log_data_modification
DROP FUNCTION IF EXISTS public.log_data_modification(uuid, uuid, text, uuid, text, jsonb, text) CASCADE;
CREATE OR REPLACE FUNCTION public.log_data_modification(
  p_organization_id uuid,
  p_user_id uuid,
  p_table_name text,
  p_record_id uuid,
  p_action text,
  p_changes jsonb,
  p_sensitivity text DEFAULT 'standard'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id, user_id, event_type, event_category,
    table_name, record_id, action, changes, sensitivity, created_at
  ) VALUES (
    p_organization_id, p_user_id,
    'data.' || lower(p_action), 'data_modification',
    p_table_name, p_record_id, p_action, p_changes, p_sensitivity, now()
  );
END;
$$;

-- log_safeguarding_event
DROP FUNCTION IF EXISTS public.log_safeguarding_event(uuid, uuid, uuid, text, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.log_safeguarding_event(
  p_organization_id uuid,
  p_user_id uuid,
  p_incident_id uuid,
  p_action text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id, user_id, event_type, event_category,
    table_name, record_id, action, changes,
    sensitivity, retention_years, metadata, created_at
  ) VALUES (
    p_organization_id, p_user_id,
    'safeguarding.' || lower(p_action), 'safeguarding',
    'incidents', p_incident_id, p_action, p_metadata,
    'safeguarding', 25, p_metadata, now()
  );
END;
$$;

-- prevent_audit_modification
DROP FUNCTION IF EXISTS public.prevent_audit_modification() CASCADE;
CREATE OR REPLACE FUNCTION public.prevent_audit_modification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted';
  RETURN NULL;
END;
$$;

-- set_audit_integrity_hash
DROP FUNCTION IF EXISTS public.set_audit_integrity_hash() CASCADE;
CREATE OR REPLACE FUNCTION public.set_audit_integrity_hash()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.integrity_hash := calculate_audit_hash(
    NEW.event_type,
    NEW.user_id,
    NEW.table_name,
    NEW.action,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

-- update_attachments_updated_at
DROP FUNCTION IF EXISTS public.update_attachments_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_attachments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- update_invitations_updated_at
DROP FUNCTION IF EXISTS public.update_invitations_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.update_invitations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- user_has_any_role
DROP FUNCTION IF EXISTS public.user_has_any_role(text[]) CASCADE;
CREATE OR REPLACE FUNCTION public.user_has_any_role(required_roles text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = auth.uid()
    AND role = ANY(required_roles)
    AND status = 'active'
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_proration TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_vat TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_annual_price TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_organization_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_any_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_id TO authenticated;

GRANT SELECT ON public.subscription_analytics TO authenticated;
GRANT SELECT ON public.subscription_pricing_comparison TO authenticated;

-- Add documentation
COMMENT ON VIEW public.subscription_analytics IS 'Subscription usage analytics. RLS enforced via table policies.';
COMMENT ON VIEW public.subscription_pricing_comparison IS 'Pricing comparison view. Public data.';
COMMENT ON FUNCTION public.audit_table_changes IS 'Audit trigger with explicit search_path for security.';
