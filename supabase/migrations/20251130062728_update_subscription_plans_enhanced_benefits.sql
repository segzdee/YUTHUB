/*
  # Update Subscription Plans with Enhanced Benefits
  
  ## Overview
  Updates all subscription plans with comprehensive benefit details and ensures
  all tiers are self-service subscriptions (no "Contact Sales" required).
  
  ## Changes
  - Enhanced feature lists for all tiers
  - All plans are now fully self-service subscribable
  - Detailed benefits highlighting key value propositions
*/

-- Update Starter Plan with enhanced benefits
UPDATE subscription_plans
SET 
  features = jsonb_build_object(
    'included', jsonb_build_array(
      'Up to 10 residents',
      '1 property location',
      'Resident intake & comprehensive profiles',
      'Support planning & progress tracking',
      'Digital documentation storage',
      'Task management & scheduling',
      'Mobile app for staff & residents',
      'Basic reporting dashboard',
      'Secure messaging',
      'Email support (business hours)',
      '14-day free trial included',
      'Community forum access'
    ),
    'excluded', jsonb_build_array(
      'Multi-property management',
      'Advanced analytics & AI insights',
      'Safeguarding & incident management',
      'Financial management module',
      'Crisis intervention system',
      'Custom branding & API access'
    )
  )
WHERE name = 'starter';

-- Update Professional Plan with enhanced benefits
UPDATE subscription_plans
SET 
  features = jsonb_build_object(
    'included', jsonb_build_array(
      'Everything in Starter, PLUS:',
      'Up to 25 residents',
      'Up to 5 properties/locations',
      'Safeguarding & incident reporting',
      'Risk assessment & management',
      'Financial management & budgeting',
      'Rent tracking & invoice management',
      'Crisis intervention & emergency alerts',
      'Independence skills tracking with gamification',
      'Advanced analytics & outcome measurement',
      'Custom reports & data exports',
      'Local authority system integration',
      'Custom branding & white-label options',
      'API access for third-party integrations',
      'Staff scheduling & shift management',
      'Priority email support',
      'Dedicated customer success manager',
      'Training & onboarding assistance'
    ),
    'excluded', jsonb_build_array(
      'Unlimited residents & properties',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment options',
      '24/7 phone support'
    )
  )
WHERE name = 'professional';

-- Update Enterprise Plan with enhanced benefits (all self-serve)
UPDATE subscription_plans
SET 
  features = jsonb_build_object(
    'included', jsonb_build_array(
      'Everything in Professional, PLUS:',
      'Unlimited residents & properties',
      'AI-powered predictive analytics & forecasting',
      'Machine learning insights for outcomes',
      'Custom feature development',
      'Priority feature requests',
      'On-premise deployment options',
      'Advanced security (SSO, SAML, LDAP)',
      'Multi-tenancy & organizational hierarchy',
      'Custom integrations with external systems',
      'Advanced data migration services',
      'White-glove implementation support',
      'Dedicated technical support (24/7)',
      'Direct hotline to engineering team',
      'Quarterly business reviews with executives',
      'Custom training programs for staff',
      'Dedicated account manager',
      'SLA guarantees (99.9% uptime)',
      'Priority bug fixes & feature releases',
      'Annual strategic planning sessions'
    ),
    'excluded', jsonb_build_array()
  )
WHERE name = 'enterprise';