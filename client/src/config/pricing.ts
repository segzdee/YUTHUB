/**
 * Pricing Configuration
 * Centralized source of truth for subscription tiers and features
 */

export type SubscriptionTier = 'trial' | 'starter' | 'professional' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  maxResidents: number;
  maxProperties: number;
  features: string[];
  moduleAccess: {
    housing: boolean;
    support: boolean;
    safeguarding: boolean;
    finance: boolean;
    independence: boolean;
    crisis: boolean;
  };
  highlights: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  trial: {
    id: 'trial',
    name: 'Trial',
    description: '14-day free trial',
    monthlyPrice: 0,
    annualPrice: 0,
    maxResidents: 25,
    maxProperties: 1,
    features: [
      'Up to 25 residents',
      '1 property',
      'Basic resident management',
      'Essential worker tools',
      'Progress tracking',
      'Mobile app access',
      'Email support (business hours)',
      'Community access',
    ],
    moduleAccess: {
      housing: true,
      support: true,
      safeguarding: false,
      finance: false,
      independence: false,
      crisis: false,
    },
    highlights: ['14-day free trial', 'No credit card required'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For small charities and pilot projects',
    monthlyPrice: 199,
    annualPrice: 169,
    maxResidents: 25,
    maxProperties: 1,
    features: [
      'Up to 25 residents',
      '1 property location',
      'Basic resident management',
      'Essential support worker tools',
      'Standard progress tracking',
      'Mobile app for residents',
      'Email support (business hours)',
      'Simple analytics dashboard',
      'Community access',
    ],
    moduleAccess: {
      housing: true,
      support: true,
      safeguarding: false,
      finance: false,
      independence: false,
      crisis: false,
    },
    highlights: ['£169/month (annual)', '£199/month (monthly)', 'Save 15% on annual'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For growing housing organizations',
    monthlyPrice: 499,
    annualPrice: 429,
    maxResidents: 100,
    maxProperties: 5,
    features: [
      'Up to 100 residents',
      'Up to 5 properties/locations',
      'Everything in Starter, plus:',
      'Multi-property management',
      'Advanced analytics and reporting',
      'Crisis intervention system',
      'Life skills progress tracking with gamification',
      'Local authority system integration',
      'Custom branding/white-label options',
      'API access for integrations',
      'Staff scheduling tools',
      'Financial management module',
      'Priority email support',
      'Dedicated customer success manager',
    ],
    moduleAccess: {
      housing: true,
      support: true,
      safeguarding: true,
      finance: true,
      independence: true,
      crisis: true,
    },
    highlights: ['£429/month (annual)', '£499/month (monthly)', 'Save 14% on annual'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For national providers and large institutions',
    monthlyPrice: 1299,
    annualPrice: 1099,
    maxResidents: -1, // unlimited
    maxProperties: -1, // unlimited
    features: [
      'Unlimited residents and properties',
      'Everything in Professional, plus:',
      'AI-powered predictive analytics',
      'Custom feature development',
      'On-premise deployment options',
      'Advanced security (SSO, SAML, LDAP)',
      'Multi-tenancy support',
      'Machine learning insights',
      'Custom integrations with external systems',
      'Dedicated technical support (24/7)',
      'Quarterly business reviews',
      'Custom training programs',
      'SLA guarantees',
    ],
    moduleAccess: {
      housing: true,
      support: true,
      safeguarding: true,
      finance: true,
      independence: true,
      crisis: true,
    },
    highlights: ['£1,099/month (annual)', '£1,299/month (monthly)', 'Save 15% on annual'],
  },
};

export const ROLE_PERMISSIONS = {
  admin: {
    description: 'Full control over organization, billing, and staff management',
    permissions: ['manage_staff', 'manage_billing', 'manage_organization', 'view_all_data'],
  },
  manager: {
    description: 'Oversees housing, staff activities, incidents, and reporting',
    permissions: ['manage_housing', 'manage_staff_activities', 'view_incidents', 'generate_reports'],
  },
  support_worker: {
    description: 'Works with assigned residents and creates support plans',
    permissions: ['manage_assigned_residents', 'create_support_plans', 'log_outcomes'],
  },
  resident: {
    description: 'Self-service portal for plans, goals, and communication',
    permissions: ['view_own_plans', 'track_goals', 'access_communication'],
  },
};

export const MODULE_DESCRIPTIONS = {
  housing: {
    title: 'Housing Management',
    description: 'Complete property and accommodation management system',
    features: [
      'Property inventory tracking',
      'Maintenance scheduling',
      'Occupancy management',
      'Lease document management',
      'Compliance reporting',
    ],
  },
  support: {
    title: 'Support Planning',
    description: 'Integrated support and care planning tools',
    features: [
      'Individual support plans',
      'Goal tracking',
      'Progress monitoring',
      'Team collaboration',
      'Activity logging',
    ],
  },
  safeguarding: {
    title: 'Safeguarding',
    description: 'Comprehensive safeguarding and risk management',
    features: [
      'Incident reporting',
      'Risk assessment',
      'Alert systems',
      'Compliance tracking',
      'Document management',
    ],
  },
  finance: {
    title: 'Financial Management',
    description: 'Budget and financial tracking tools',
    features: [
      'Budget management',
      'Expense tracking',
      'Invoice management',
      'Financial reporting',
      'Cost analysis',
    ],
  },
  independence: {
    title: 'Independence Pathways',
    description: 'Track progression toward independent living',
    features: [
      'Milestone tracking',
      'Skills assessment',
      'Independence levels',
      'Transition planning',
      'Progress reports',
    ],
  },
  crisis: {
    title: 'Crisis Management',
    description: 'Emergency response and crisis coordination',
    features: [
      'Emergency alerts',
      'Response protocols',
      'Team coordination',
      'Communication tools',
      'Escalation workflows',
    ],
  },
};
