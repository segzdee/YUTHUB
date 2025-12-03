/*
  # Fix Security Definer Issues

  ## Critical Security Fixes
  
  1. **Remove SECURITY DEFINER from Views**
     - Drop and recreate `subscription_analytics` view without SECURITY DEFINER
     - Drop and recreate `subscription_pricing_comparison` view without SECURITY DEFINER
     - Views don't need SECURITY DEFINER as they only read data users already have access to via RLS
  
  2. **Fix Function Search Path**
     - Recreate `create_audit_log` function with explicit `SET search_path = public, auth`
     - Prevents search_path injection attacks
     - Maintains SECURITY DEFINER (needed for audit logging) but with secure search_path
  
  ## Security Impact
  
  - **High**: SECURITY DEFINER views can bypass RLS policies (security risk)
  - **High**: Mutable search_path in SECURITY DEFINER functions allows privilege escalation
  - **Solution**: Remove unnecessary SECURITY DEFINER, secure required functions
*/

-- =====================================================
-- 1. FIX SECURITY DEFINER VIEWS
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS public.subscription_analytics CASCADE;
DROP VIEW IF EXISTS public.subscription_pricing_comparison CASCADE;

-- Recreate subscription_analytics view WITHOUT SECURITY DEFINER
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

-- Recreate subscription_pricing_comparison view WITHOUT SECURITY DEFINER
CREATE VIEW public.subscription_pricing_comparison AS
WITH monthly_prices AS (
  SELECT 
    tier_name,
    price_gbp AS monthly_price_gbp,
    max_properties,
    max_residents,
    max_staff,
    has_safeguarding,
    has_financial_management,
    has_crisis_intervention,
    has_ai_analytics,
    has_api_access,
    has_advanced_reporting
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
  m.tier_name,
  m.monthly_price_gbp,
  a.annual_price_gbp,
  a.annual_monthly_equivalent_gbp,
  ROUND((((m.monthly_price_gbp * 12) - a.annual_price_gbp)::numeric / 
         (m.monthly_price_gbp * 12)::numeric) * 100, 2) AS annual_discount_percent,
  m.max_properties,
  m.max_residents,
  m.max_staff,
  m.has_safeguarding,
  m.has_financial_management,
  m.has_crisis_intervention,
  m.has_ai_analytics,
  m.has_api_access,
  m.has_advanced_reporting
FROM monthly_prices m
LEFT JOIN annual_prices a ON a.tier_name = m.tier_name
ORDER BY m.monthly_price_gbp;

-- Grant SELECT on views (no RLS on views, they inherit from base tables)
GRANT SELECT ON public.subscription_analytics TO authenticated;
GRANT SELECT ON public.subscription_pricing_comparison TO authenticated;
GRANT SELECT ON public.subscription_pricing_comparison TO anon;

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATH
-- =====================================================

-- Recreate create_audit_log function with secure search_path
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE 
  org_id uuid;
  changed_fields_array text[];
BEGIN
  IF TG_OP = 'DELETE' THEN
    org_id := OLD.organization_id;
    INSERT INTO public.audit_logs (
      organization_id, 
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values
    )
    VALUES (
      org_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    org_id := NEW.organization_id;
    
    -- Calculate changed fields
    SELECT array_agg(key) INTO changed_fields_array
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key;
    
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      changed_fields
    )
    VALUES (
      org_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      changed_fields_array
    );
    
  ELSE
    -- INSERT
    org_id := NEW.organization_id;
    INSERT INTO public.audit_logs (
      organization_id,
      user_id,
      action,
      table_name,
      record_id,
      new_values
    )
    VALUES (
      org_id,
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
      'INSERT',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add comment explaining why SECURITY DEFINER is needed
COMMENT ON FUNCTION public.create_audit_log() IS 
'Audit logging function - SECURITY DEFINER required to write audit logs regardless of user permissions. search_path is explicitly set to prevent injection attacks.';
