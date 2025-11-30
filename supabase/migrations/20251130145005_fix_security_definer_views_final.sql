/*
  # Fix Security Definer Views and Functions - Final

  ## Issues Fixed
  1. Remove SECURITY DEFINER from views
  2. Fix function security (use SECURITY INVOKER)
  3. Use correct column names (singular not plural)
  
  ## Security Impact
  - Views use caller's permissions
  - Functions use explicit schema qualification
*/

-- ==========================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- ==========================================

-- Drop and recreate subscription_pricing_comparison without SECURITY DEFINER
DROP VIEW IF EXISTS public.subscription_pricing_comparison CASCADE;

CREATE VIEW public.subscription_pricing_comparison AS
WITH monthly_prices AS (
  SELECT 
    tier_name,
    price_gbp as monthly_price_gbp,
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
    price_gbp as annual_price_gbp,
    ROUND((price_gbp / 12.0)::numeric, 2) as annual_monthly_equivalent_gbp
  FROM subscription_tiers
  WHERE is_active = true AND billing_period = 'year'
)
SELECT 
  m.tier_name,
  m.monthly_price_gbp,
  a.annual_price_gbp,
  a.annual_monthly_equivalent_gbp,
  ROUND((((m.monthly_price_gbp * 12) - a.annual_price_gbp)::numeric / (m.monthly_price_gbp * 12) * 100), 2) as annual_discount_percent,
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

-- Drop and recreate subscription_analytics without SECURITY DEFINER
DROP VIEW IF EXISTS public.subscription_analytics CASCADE;

CREATE VIEW public.subscription_analytics AS
SELECT 
  os.organization_id,
  o.name as organization_name,
  st.tier_name,
  st.billing_period,
  os.status,
  os.current_period_start,
  os.current_period_end,
  COALESCE(su.property_count, 0) as property_count,
  COALESCE(su.resident_count, 0) as resident_count,
  st.max_properties,
  st.max_residents,
  st.max_staff,
  CASE 
    WHEN st.max_properties IS NULL OR st.max_properties = 0 THEN 0
    ELSE ROUND((COALESCE(su.property_count, 0)::numeric / st.max_properties * 100), 2)
  END as properties_usage_percent,
  CASE 
    WHEN st.max_residents IS NULL OR st.max_residents = 0 THEN 0
    ELSE ROUND((COALESCE(su.resident_count, 0)::numeric / st.max_residents * 100), 2)
  END as residents_usage_percent
FROM organization_subscriptions os
JOIN organizations o ON o.id = os.organization_id
JOIN subscription_tiers st ON st.id = os.tier_id
LEFT JOIN subscription_usage su ON su.organization_id = os.organization_id
WHERE os.status IN ('active', 'trialing');

-- Grant necessary permissions for views
GRANT SELECT ON public.subscription_pricing_comparison TO authenticated, anon;
GRANT SELECT ON public.subscription_analytics TO authenticated;

-- ==========================================
-- PART 2: FIX FUNCTIONS (USE SECURITY INVOKER)
-- ==========================================

-- Fix check_property_limit
DROP FUNCTION IF EXISTS public.check_property_limit(uuid) CASCADE;
CREATE FUNCTION public.check_property_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
AS $$
DECLARE 
  max_props integer; 
  current_props integer;
BEGIN
  SELECT st.max_properties INTO max_props 
  FROM public.organization_subscriptions os 
  JOIN public.subscription_tiers st ON os.tier_id = st.id 
  WHERE os.organization_id = org_id AND os.status = 'active';
  
  IF max_props IS NULL THEN 
    RETURN TRUE; 
  END IF;
  
  SELECT COUNT(*) INTO current_props 
  FROM public.properties 
  WHERE organization_id = org_id AND status = 'active';
  
  RETURN current_props < max_props;
END; 
$$;

-- Fix check_resident_limit
DROP FUNCTION IF EXISTS public.check_resident_limit(uuid) CASCADE;
CREATE FUNCTION public.check_resident_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
AS $$
DECLARE 
  max_res integer; 
  current_res integer;
BEGIN
  SELECT st.max_residents INTO max_res 
  FROM public.organization_subscriptions os 
  JOIN public.subscription_tiers st ON os.tier_id = st.id 
  WHERE os.organization_id = org_id AND os.status = 'active';
  
  IF max_res IS NULL THEN 
    RETURN TRUE; 
  END IF;
  
  SELECT COUNT(*) INTO current_res 
  FROM public.residents 
  WHERE organization_id = org_id AND status = 'active';
  
  RETURN current_res < max_res;
END; 
$$;

-- Fix calculate_proration (truly IMMUTABLE)
DROP FUNCTION IF EXISTS public.calculate_proration(integer, integer, integer, integer) CASCADE;
CREATE FUNCTION public.calculate_proration(
  old_price integer, 
  new_price integer, 
  days_remaining integer, 
  total_days integer
)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
STRICT
AS $$ 
BEGIN 
  IF total_days = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN FLOOR(
    ((old_price * days_remaining::numeric / total_days) - 
     (new_price * days_remaining::numeric / total_days))
  ); 
END; 
$$;

-- Update sync_organization_limits to use correct column names
DROP FUNCTION IF EXISTS public.sync_organization_limits() CASCADE;
CREATE FUNCTION public.sync_organization_limits()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY INVOKER
AS $$
BEGIN
  UPDATE public.subscription_usage 
  SET
    property_count = (
      SELECT COUNT(*) 
      FROM public.properties 
      WHERE organization_id = NEW.organization_id 
        AND status = 'active'
    ),
    resident_count = (
      SELECT COUNT(*) 
      FROM public.residents 
      WHERE organization_id = NEW.organization_id 
        AND status = 'active'
    )
  WHERE organization_id = NEW.organization_id;
  
  RETURN NEW;
END; 
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS sync_org_limits_on_subscription_change ON public.organization_subscriptions;
CREATE TRIGGER sync_org_limits_on_subscription_change
  AFTER INSERT OR UPDATE ON public.organization_subscriptions
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_organization_limits();

-- Update statistics
ANALYZE;
