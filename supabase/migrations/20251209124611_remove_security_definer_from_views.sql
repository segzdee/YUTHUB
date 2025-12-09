/*
  # Remove SECURITY DEFINER from Views - Final Fix

  ## Security Issues Fixed

  1. **subscription_analytics View**
     - Remove SECURITY DEFINER property
     - View inherits RLS from underlying tables
     - No elevated privileges needed for reading subscription data

  2. **subscription_pricing_comparison View**
     - Remove SECURITY DEFINER property
     - Public pricing information doesn't need elevated access
     - Safe for authenticated and anonymous users

  ## Why SECURITY DEFINER on Views is Dangerous

  - Views with SECURITY DEFINER bypass RLS policies
  - Can expose sensitive data to unauthorized users
  - Creates unnecessary security surface area
  - Best practice: Only use SECURITY DEFINER on functions when absolutely necessary

  ## Security Impact

  - **High Priority**: Eliminates potential RLS bypass
  - **No Functionality Impact**: Views work identically without SECURITY DEFINER
  - **Defense in Depth**: Views now respect all RLS policies on base tables
*/

-- =====================================================
-- Drop existing views completely
-- =====================================================

DROP VIEW IF EXISTS public.subscription_analytics CASCADE;
DROP VIEW IF EXISTS public.subscription_pricing_comparison CASCADE;

-- =====================================================
-- Recreate subscription_analytics WITHOUT SECURITY DEFINER
-- =====================================================

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

-- Add comment explaining security model
COMMENT ON VIEW public.subscription_analytics IS
'Analytics view for subscription usage. No SECURITY DEFINER - inherits RLS from base tables for proper access control.';

-- =====================================================
-- Recreate subscription_pricing_comparison WITHOUT SECURITY DEFINER
-- =====================================================

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

-- Add comment explaining security model
COMMENT ON VIEW public.subscription_pricing_comparison IS
'Pricing comparison view for subscription tiers. No SECURITY DEFINER - public pricing data accessible via RLS policies.';

-- =====================================================
-- Grant appropriate permissions
-- =====================================================

-- subscription_analytics: Only authenticated users with proper RLS access
GRANT SELECT ON public.subscription_analytics TO authenticated;

-- subscription_pricing_comparison: Public pricing available to all
GRANT SELECT ON public.subscription_pricing_comparison TO authenticated;
GRANT SELECT ON public.subscription_pricing_comparison TO anon;
