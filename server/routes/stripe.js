import express from 'express';
import { authenticateUser, getUserOrganization } from '../middleware/auth.js';

const router = express.Router();

// Check if Stripe is enabled
const isStripeEnabled = process.env.ENABLE_STRIPE_PAYMENTS === 'true' &&
                        process.env.STRIPE_SECRET_KEY;

if (!isStripeEnabled) {
  console.log('⚠️  Stripe payments are disabled. Set ENABLE_STRIPE_PAYMENTS=true and add STRIPE_SECRET_KEY to enable.');
}

// Middleware to check if Stripe is enabled
const requireStripe = (req, res, next) => {
  if (!isStripeEnabled) {
    return res.status(503).json({
      error: 'Payment processing unavailable',
      message: 'Stripe payments are not configured. Please contact support.',
    });
  }
  next();
};

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    // Return static plans (these match the database seed data)
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for small charities and pilot programs',
        monthlyPrice: 169,
        annualPrice: 2028,
        maxResidents: 10,
        maxProperties: 1,
        features: [
          'Up to 10 residents',
          '1 property location',
          'Resident intake & profiles',
          'Support planning & tracking',
          'Digital documentation',
          'Mobile app access',
          'Basic reporting',
          'Email support',
          '14-day free trial',
        ],
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Ideal for medium housing associations',
        monthlyPrice: 424,
        annualPrice: 5088,
        maxResidents: 25,
        maxProperties: 5,
        features: [
          'Everything in Starter',
          'Up to 25 residents',
          '5 properties',
          'Safeguarding & incidents',
          'Financial management',
          'Crisis intervention',
          'Advanced analytics',
          'Custom branding & API',
          'Priority support',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large national providers',
        monthlyPrice: 849,
        annualPrice: 10188,
        maxResidents: null,
        maxProperties: null,
        features: [
          'Everything in Professional',
          'Unlimited residents & properties',
          'AI-powered analytics',
          'Custom development',
          'On-premise deployment',
          'Advanced security (SSO)',
          'Multi-tenancy support',
          '24/7 dedicated support',
          'SLA guarantees',
        ],
      },
    ];

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create checkout session (requires Stripe)
router.post('/create-checkout', authenticateUser, getUserOrganization, requireStripe, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;

    // This would normally create a Stripe checkout session
    // For now, return a mock response
    res.status(501).json({
      error: 'Not Implemented',
      message: 'Stripe checkout is not yet configured. Please configure Stripe keys in .env file.',
      setupInstructions: 'https://bolt.new/setup/stripe',
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook handler (requires Stripe)
router.post('/webhook', requireStripe, express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // This would normally handle Stripe webhooks
    res.status(501).json({
      error: 'Not Implemented',
      message: 'Stripe webhooks not configured',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get subscription status
router.get('/subscription', authenticateUser, getUserOrganization, async (req, res) => {
  try {
    const { supabase } = await import('../config/supabase.js');

    const { data, error } = await supabase
      .from('organizations')
      .select('subscription_tier, subscription_status, max_residents, max_properties')
      .eq('id', req.organizationId)
      .single();

    if (error) throw error;

    res.json({
      tier: data.subscription_tier || 'trial',
      status: data.subscription_status || 'active',
      maxResidents: data.max_residents,
      maxProperties: data.max_properties,
      stripeEnabled: isStripeEnabled,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
