/*
  # Update Pricing and Add Annual Billing Support

  ## Updated Pricing
  - Starter: £199/mo (£2,029.80/year with 15% discount)
  - Professional: £499/mo (£5,100.60/year with 15% discount)  
  - Enterprise: £999/mo (£10,190.40/year with 15% discount)
*/

-- Step 1: Remove old constraint and add new one
ALTER TABLE public.subscription_tiers 
DROP CONSTRAINT IF EXISTS subscription_tiers_tier_name_key CASCADE;

ALTER TABLE public.subscription_tiers
DROP CONSTRAINT IF EXISTS subscription_tiers_tier_billing_unique;

ALTER TABLE public.subscription_tiers
ADD CONSTRAINT subscription_tiers_tier_billing_unique 
UNIQUE (tier_name, billing_period);

-- Step 2: Update monthly prices
UPDATE public.subscription_tiers
SET price_gbp = 19900, display_name = 'Starter', updated_at = now()
WHERE tier_name = 'starter' AND billing_period = 'month';

UPDATE public.subscription_tiers
SET price_gbp = 49900, display_name = 'Professional', updated_at = now()
WHERE tier_name = 'professional' AND billing_period = 'month';

UPDATE public.subscription_tiers
SET price_gbp = 99900, display_name = 'Enterprise', updated_at = now()
WHERE tier_name = 'enterprise' AND billing_period = 'month';

-- Step 3: Add annual tiers
DO $$
BEGIN
  -- Starter Annual: £2,029.80
  IF NOT EXISTS (
    SELECT 1 FROM subscription_tiers 
    WHERE tier_name = 'starter' AND billing_period = 'year'
  ) THEN
    INSERT INTO public.subscription_tiers (
      tier_name, display_name, price_gbp, billing_period,
      max_properties, max_residents, max_staff, max_storage_gb,
      has_safeguarding, has_financial_management, has_crisis_intervention,
      has_ai_analytics, has_api_access, has_advanced_reporting,
      has_custom_integrations, has_priority_support, has_dedicated_account_manager,
      trial_period_days, sort_order
    ) VALUES (
      'starter', 'Starter (Annual - Save 15%)', 202980, 'year',
      1, 10, 5, 10,
      false, false, false, false, false, false,
      false, false, false,
      14, 4
    );
  END IF;

  -- Professional Annual: £5,100.60
  IF NOT EXISTS (
    SELECT 1 FROM subscription_tiers 
    WHERE tier_name = 'professional' AND billing_period = 'year'
  ) THEN
    INSERT INTO public.subscription_tiers (
      tier_name, display_name, price_gbp, billing_period,
      max_properties, max_residents, max_staff, max_storage_gb,
      has_safeguarding, has_financial_management, has_crisis_intervention,
      has_ai_analytics, has_api_access, has_advanced_reporting,
      has_custom_integrations, has_priority_support, has_dedicated_account_manager,
      trial_period_days, sort_order
    ) VALUES (
      'professional', 'Professional (Annual - Save 15%)', 510060, 'year',
      5, 25, 15, 50,
      true, true, false, false, false, true,
      false, true, false,
      14, 5
    );
  END IF;

  -- Enterprise Annual: £10,190.40
  IF NOT EXISTS (
    SELECT 1 FROM subscription_tiers 
    WHERE tier_name = 'enterprise' AND billing_period = 'year'
  ) THEN
    INSERT INTO public.subscription_tiers (
      tier_name, display_name, price_gbp, billing_period,
      max_properties, max_residents, max_staff, max_storage_gb,
      has_safeguarding, has_financial_management, has_crisis_intervention,
      has_ai_analytics, has_api_access, has_advanced_reporting,
      has_custom_integrations, has_priority_support, has_dedicated_account_manager,
      trial_period_days, sort_order
    ) VALUES (
      'enterprise', 'Enterprise (Annual - Save 15%)', 1019040, 'year',
      NULL, NULL, NULL, NULL,
      true, true, true, true, true, true,
      true, true, true,
      14, 6
    );
  END IF;
END$$;

-- Step 4: Add columns to organization_subscriptions
ALTER TABLE public.organization_subscriptions 
ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'month';

ALTER TABLE public.organization_subscriptions 
ADD COLUMN IF NOT EXISTS annual_discount_percent decimal(5,2) DEFAULT 0;

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'billing_period_check'
  ) THEN
    ALTER TABLE public.organization_subscriptions
    ADD CONSTRAINT billing_period_check CHECK (billing_period IN ('month', 'year'));
  END IF;
END$$;

-- Step 5: Create helper functions
CREATE OR REPLACE FUNCTION calculate_annual_price(
  monthly_price_pence integer,
  discount_percent decimal DEFAULT 15.00
) RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN FLOOR((monthly_price_pence * 12 * (1 - discount_percent / 100.0))::numeric);
END;
$$;

-- Step 6: Drop and recreate view properly
DROP VIEW IF EXISTS public.subscription_pricing_comparison CASCADE;

CREATE VIEW public.subscription_pricing_comparison AS
SELECT 
  st.tier_name,
  st.billing_period,
  st.display_name,
  st.price_gbp,
  st.max_properties,
  st.max_residents,
  st.max_staff,
  st.max_storage_gb,
  st.has_safeguarding,
  st.has_financial_management,
  st.has_crisis_intervention,
  st.has_ai_analytics,
  st.has_api_access,
  st.trial_period_days,
  CASE 
    WHEN st.billing_period = 'year' THEN 15.00
    ELSE 0.00
  END as savings_percent
FROM subscription_tiers st
WHERE st.is_active = true
ORDER BY st.sort_order;

GRANT SELECT ON public.subscription_pricing_comparison TO authenticated;

ANALYZE public.subscription_tiers;
