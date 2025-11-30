/*
  # Seed Subscription Plans with Correct Pricing
  
  ## Overview
  Populates the subscription_plans table with the correct pricing structure
  for YUTHUB's three-tier subscription model.
  
  ## Pricing Structure
  - **Starter**: £199/month (£169 annual) - 1 property, 10 residents
  - **Professional**: £499/month (£424 annual) - 5 properties, 25 residents
  - **Enterprise**: £999/month (£849 annual) - Unlimited properties & residents
  
  ## Annual Discount
  All tiers include 15% discount for annual billing
*/

-- Clear existing plans if any
DELETE FROM subscription_plans;

-- Insert Starter Plan
INSERT INTO subscription_plans (
  name,
  display_name,
  description,
  price_monthly,
  price_annual,
  max_residents,
  max_properties,
  features,
  is_active,
  sort_order
) VALUES (
  'starter',
  'Starter',
  'Perfect for small charities and pilot programs',
  199,
  169,
  10,
  1,
  jsonb_build_object(
    'included', jsonb_build_array(
      'Basic resident management (10 residents max)',
      'Essential support worker tools',
      'Standard progress tracking',
      'Mobile app for residents',
      'Email support (business hours)',
      'Single property/location',
      'Basic reporting dashboard'
    ),
    'excluded', jsonb_build_array(
      'Multi-property management',
      'Advanced analytics',
      'Crisis intervention system',
      'Custom branding',
      'API access'
    )
  ),
  true,
  1
);

-- Insert Professional Plan
INSERT INTO subscription_plans (
  name,
  display_name,
  description,
  price_monthly,
  price_annual,
  max_residents,
  max_properties,
  features,
  is_active,
  sort_order
) VALUES (
  'professional',
  'Professional',
  'Ideal for medium housing associations and local authorities',
  499,
  424,
  25,
  5,
  jsonb_build_object(
    'included', jsonb_build_array(
      'Everything in Starter PLUS:',
      'Up to 25 residents',
      'Multi-property management (5 locations)',
      'Advanced analytics & outcome tracking',
      'Crisis intervention system',
      'Life skills progression with gamification',
      'Local authority system integration',
      'Custom branding/white-label',
      'Dedicated customer success manager',
      'API access',
      'Staff scheduling tools',
      'Financial management'
    ),
    'excluded', jsonb_build_array(
      'Unlimited residents',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment'
    )
  ),
  true,
  2
);

-- Insert Enterprise Plan
INSERT INTO subscription_plans (
  name,
  display_name,
  description,
  price_monthly,
  price_annual,
  max_residents,
  max_properties,
  features,
  is_active,
  sort_order
) VALUES (
  'enterprise',
  'Enterprise',
  'For large national providers and multi-program organizations',
  999,
  849,
  -1,  -- -1 represents unlimited
  -1,  -- -1 represents unlimited
  jsonb_build_object(
    'included', jsonb_build_array(
      'Everything in Professional PLUS:',
      'Unlimited residents & properties',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment options',
      'Advanced security (SSO, SAML, LDAP)',
      'Multi-tenancy support',
      'Machine learning insights',
      'Custom integrations',
      'Dedicated technical support (24/7)',
      'Quarterly business reviews',
      'Custom training programs',
      'SLA guarantees'
    ),
    'excluded', jsonb_build_array()
  ),
  true,
  3
);