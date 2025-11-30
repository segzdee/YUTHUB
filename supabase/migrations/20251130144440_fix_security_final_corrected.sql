/*
  # Fix Security Issues - Final Corrected

  ## Fixes
  1. Add missing RLS policies for discount_redemptions and stripe_webhook_events
  2. Fix function security with proper search paths
  3. Recreate dropped triggers
*/

-- Add missing RLS policies for discount_redemptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discount_redemptions' 
    AND policyname = 'Organization admins can view redemptions'
  ) THEN
    CREATE POLICY "Organization admins can view redemptions" 
    ON public.discount_redemptions FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM organization_subscriptions os 
      JOIN user_organizations uo ON uo.organization_id = os.organization_id 
      WHERE os.id = discount_redemptions.subscription_id 
      AND uo.user_id = (SELECT auth.uid()) 
      AND uo.role IN ('admin', 'platform_admin')
    ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discount_redemptions' 
    AND policyname = 'Platform admins can manage redemptions'
  ) THEN
    CREATE POLICY "Platform admins can manage redemptions" 
    ON public.discount_redemptions FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'platform_admin'
    ));
  END IF;
END$$;

-- Add missing RLS policies for stripe_webhook_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_webhook_events' 
    AND policyname = 'Platform admins can view webhook events'
  ) THEN
    CREATE POLICY "Platform admins can view webhook events" 
    ON public.stripe_webhook_events FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'platform_admin'
    ));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_webhook_events' 
    AND policyname = 'Platform admins can manage webhook events'
  ) THEN
    CREATE POLICY "Platform admins can manage webhook events" 
    ON public.stripe_webhook_events FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_organizations 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'platform_admin'
    ));
  END IF;
END$$;

-- Fix function security (drop with CASCADE and recreate)
DROP FUNCTION IF EXISTS public.calculate_vat(integer, decimal) CASCADE;
CREATE FUNCTION public.calculate_vat(amount_pence integer, vat_rate decimal DEFAULT 20.00)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$ 
BEGIN 
  RETURN FLOOR((amount_pence * vat_rate / 100.0)::numeric); 
END; 
$$;

DROP FUNCTION IF EXISTS public.check_property_limit(uuid) CASCADE;
CREATE FUNCTION public.check_property_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE 
  max_props integer; 
  current_props integer;
BEGIN
  SELECT st.max_properties INTO max_props 
  FROM organization_subscriptions os 
  JOIN subscription_tiers st ON os.tier_id = st.id 
  WHERE os.organization_id = org_id AND os.status = 'active';
  
  IF max_props IS NULL THEN 
    RETURN TRUE; 
  END IF;
  
  SELECT COUNT(*) INTO current_props 
  FROM properties 
  WHERE organization_id = org_id AND status = 'active';
  
  RETURN current_props < max_props;
END; 
$$;

DROP FUNCTION IF EXISTS public.check_resident_limit(uuid) CASCADE;
CREATE FUNCTION public.check_resident_limit(org_id uuid)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
DECLARE 
  max_res integer; 
  current_res integer;
BEGIN
  SELECT st.max_residents INTO max_res 
  FROM organization_subscriptions os 
  JOIN subscription_tiers st ON os.tier_id = st.id 
  WHERE os.organization_id = org_id AND os.status = 'active';
  
  IF max_res IS NULL THEN 
    RETURN TRUE; 
  END IF;
  
  SELECT COUNT(*) INTO current_res 
  FROM residents 
  WHERE organization_id = org_id AND status = 'active';
  
  RETURN current_res < max_res;
END; 
$$;

DROP FUNCTION IF EXISTS public.calculate_proration(integer, integer, integer, integer) CASCADE;
CREATE FUNCTION public.calculate_proration(old_price integer, new_price integer, days_remaining integer, total_days integer)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$ 
BEGIN 
  RETURN FLOOR(((old_price * days_remaining / total_days) - (new_price * days_remaining / total_days))::numeric); 
END; 
$$;

DROP FUNCTION IF EXISTS public.has_feature_access(uuid, text) CASCADE;
CREATE FUNCTION public.has_feature_access(org_id uuid, feature_name text)
RETURNS boolean 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
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
  FROM organization_subscriptions os
  JOIN subscription_tiers st ON os.tier_id = st.id
  WHERE os.organization_id = org_id 
    AND os.status IN ('active', 'trialing');
    
  RETURN COALESCE(has_access, false);
END; 
$$;

DROP FUNCTION IF EXISTS public.sync_organization_limits() CASCADE;
CREATE FUNCTION public.sync_organization_limits()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE subscription_usage 
  SET
    properties_count = (
      SELECT COUNT(*) 
      FROM properties 
      WHERE organization_id = NEW.organization_id 
        AND status = 'active'
    ),
    residents_count = (
      SELECT COUNT(*) 
      FROM residents 
      WHERE organization_id = NEW.organization_id 
        AND status = 'active'
    ),
    staff_count = (
      SELECT COUNT(*) 
      FROM staff_members 
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
  EXECUTE FUNCTION sync_organization_limits();

DROP FUNCTION IF EXISTS public.calculate_annual_price(integer, decimal) CASCADE;
CREATE FUNCTION public.calculate_annual_price(monthly_price_pence integer, discount_percent decimal DEFAULT 15.00)
RETURNS integer 
LANGUAGE plpgsql 
IMMUTABLE 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$ 
BEGIN 
  RETURN FLOOR((monthly_price_pence * 12 * (1 - discount_percent / 100.0))::numeric); 
END; 
$$;

DROP FUNCTION IF EXISTS public.get_tier_pricing(text, text) CASCADE;
CREATE FUNCTION public.get_tier_pricing(tier_name_param text, billing_period_param text DEFAULT 'month')
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
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    id, 
    subscription_tiers.tier_name, 
    subscription_tiers.price_gbp, 
    subscription_tiers.billing_period, 
    subscription_tiers.max_properties, 
    subscription_tiers.max_residents
  FROM subscription_tiers 
  WHERE subscription_tiers.tier_name = tier_name_param 
    AND subscription_tiers.billing_period = billing_period_param 
    AND is_active = true 
  LIMIT 1;
END; 
$$;

-- Update statistics
ANALYZE;
