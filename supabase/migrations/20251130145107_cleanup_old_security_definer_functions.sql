/*
  # Cleanup Old SECURITY DEFINER Functions

  ## Changes
  - Drop old SECURITY DEFINER versions of functions
  - Keep only SECURITY INVOKER or IMMUTABLE versions
*/

-- Drop old SECURITY DEFINER versions that take no arguments or different signatures
DROP FUNCTION IF EXISTS public.check_property_limit() CASCADE;
DROP FUNCTION IF EXISTS public.check_resident_limit() CASCADE;

-- Drop and recreate remaining SECURITY DEFINER functions as SECURITY INVOKER
DROP FUNCTION IF EXISTS public.has_feature_access(uuid, text) CASCADE;
CREATE FUNCTION public.has_feature_access(org_id uuid, feature_name text)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
AS $$
DECLARE 
  has_access boolean;
BEGIN
  SELECT CASE feature_name
    WHEN 'safeguarding' THEN st.has_safeguarding
    WHEN 'financial' THEN st.has_financial_management
    WHEN 'crisis' THEN st.has_crisis_intervention
    WHEN 'ai' THEN st.has_ai_analytics
    WHEN 'api' THEN st.has_api_access
    WHEN 'reporting' THEN st.has_advanced_reporting
    ELSE false 
  END INTO has_access
  FROM public.organization_subscriptions os
  JOIN public.subscription_tiers st ON os.tier_id = st.id
  WHERE os.organization_id = org_id 
    AND os.status IN ('active', 'trialing');
    
  RETURN COALESCE(has_access, false);
END; 
$$;

DROP FUNCTION IF EXISTS public.get_tier_pricing(text, text) CASCADE;
CREATE FUNCTION public.get_tier_pricing(
  tier_name_param text, 
  billing_period_param text DEFAULT 'month'
)
RETURNS TABLE(
  tier_id uuid, 
  tier_name text, 
  price_gbp integer, 
  billing_period text, 
  max_properties integer, 
  max_residents integer
)
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    st.id, 
    st.tier_name, 
    st.price_gbp, 
    st.billing_period, 
    st.max_properties, 
    st.max_residents
  FROM public.subscription_tiers st
  WHERE st.tier_name = tier_name_param 
    AND st.billing_period = billing_period_param 
    AND st.is_active = true 
  LIMIT 1;
END; 
$$;

-- For truly computational functions, SECURITY DEFINER is fine but they should be IMMUTABLE
-- These don't access any tables, so SECURITY DEFINER with IMMUTABLE is safe
DROP FUNCTION IF EXISTS public.calculate_vat(integer, numeric) CASCADE;
CREATE FUNCTION public.calculate_vat(
  amount_pence integer, 
  vat_rate numeric DEFAULT 20.00
)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
STRICT
SECURITY INVOKER
AS $$ 
BEGIN 
  RETURN FLOOR((amount_pence * vat_rate / 100.0)::numeric); 
END; 
$$;

DROP FUNCTION IF EXISTS public.calculate_annual_price(integer, numeric) CASCADE;
CREATE FUNCTION public.calculate_annual_price(
  monthly_price_pence integer, 
  discount_percent numeric DEFAULT 15.00
)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
STRICT
SECURITY INVOKER
AS $$ 
BEGIN 
  RETURN FLOOR((monthly_price_pence * 12 * (1 - discount_percent / 100.0))::numeric); 
END; 
$$;

-- Drop the old proration function with different signature if it exists
DROP FUNCTION IF EXISTS public.calculate_proration(integer, integer, timestamp with time zone, timestamp with time zone) CASCADE;

ANALYZE;
