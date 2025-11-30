/*
  # Fix Security Issues - Drop Functions First

  ## Security Issues Fixed
  
  1. **Security Definer Views:** Already fixed in views
  2. **Function Search Path Issues:** Fix all mutable search paths
  
  ## Approach
  - Drop existing functions completely
  - Recreate with SET search_path = ''
  - Use explicit schema qualification
*/

-- Drop all functions that need to be recreated
DROP FUNCTION IF EXISTS public.has_feature_access(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_tier_pricing(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_vat(integer, decimal) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_annual_price(integer, decimal) CASCADE;
DROP FUNCTION IF EXISTS public.check_property_limit(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_resident_limit(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_proration(integer, integer, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.sync_organization_limits() CASCADE;

-- Recreate check_property_limit with fixed search_path
CREATE FUNCTION public.check_property_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
SET search_path = ''
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

-- Recreate check_resident_limit with fixed search_path
CREATE FUNCTION public.check_resident_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
SET search_path = ''
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

-- Recreate calculate_proration (IMMUTABLE)
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

-- Recreate sync_organization_limits with fixed search_path
CREATE FUNCTION public.sync_organization_limits()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = ''
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

-- Recreate has_feature_access with fixed search_path
CREATE FUNCTION public.has_feature_access(
  org_id uuid,
  feature_name text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  has_access boolean;
BEGIN
  SELECT 
    CASE feature_name
      WHEN 'safeguarding' THEN st.has_safeguarding
      WHEN 'financial_management' THEN st.has_financial_management
      WHEN 'crisis_intervention' THEN st.has_crisis_intervention
      WHEN 'ai_analytics' THEN st.has_ai_analytics
      WHEN 'api_access' THEN st.has_api_access
      WHEN 'advanced_reporting' THEN st.has_advanced_reporting
      ELSE false
    END INTO has_access
  FROM public.organization_subscriptions os
  JOIN public.subscription_tiers st ON st.id = os.tier_id
  WHERE os.organization_id = org_id 
    AND os.status IN ('active', 'trialing');
  
  RETURN COALESCE(has_access, false);
END;
$$;

-- Recreate get_tier_pricing with fixed search_path
CREATE FUNCTION public.get_tier_pricing(
  tier_name_param text,
  billing_period_param text DEFAULT 'month'
)
RETURNS TABLE (
  tier_name text,
  billing_period text,
  price_gbp numeric,
  max_properties integer,
  max_residents integer
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.tier_name,
    st.billing_period,
    st.price_gbp,
    st.max_properties,
    st.max_residents
  FROM public.subscription_tiers st
  WHERE st.tier_name = tier_name_param
    AND st.billing_period = billing_period_param
    AND st.is_active = true;
END;
$$;

-- Recreate calculate_vat (IMMUTABLE)
CREATE FUNCTION public.calculate_vat(
  amount_pence integer,
  vat_rate_percent decimal DEFAULT 20.0
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
BEGIN
  RETURN FLOOR((amount_pence * vat_rate_percent / 100.0)::numeric);
END;
$$;

-- Recreate calculate_annual_price (IMMUTABLE)
CREATE FUNCTION public.calculate_annual_price(
  monthly_price_pence integer,
  discount_percent decimal DEFAULT 15.00
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
STRICT
AS $$
BEGIN
  RETURN FLOOR((monthly_price_pence * 12 * (1 - discount_percent / 100.0))::numeric);
END;
$$;

-- Update statistics
ANALYZE public.subscription_tiers;
ANALYZE public.organization_subscriptions;
