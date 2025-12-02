import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser, getUserOrganization, requireRole } from '../middleware/auth.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

router.use(authenticateUser);
router.use(getUserOrganization);

// GET /api/billing/subscription - Current subscription details
router.get('/subscription', async (req, res) => {
  try {
    const { organizationId } = req;

    const { data, error } = await supabase
      .from('organizations')
      .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, trial_ends_at')
      .eq('id', organizationId)
      .single();

    if (error) throw error;

    res.json({ subscription: data });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/billing/create-checkout - Create Stripe checkout session
router.post('/create-checkout', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }
    const { organizationId } = req;
    const { priceId, successUrl, cancelUrl } = req.body;

    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id, name, display_name')
      .eq('id', organizationId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { organization_id: organizationId },
        name: org?.display_name || org?.name,
      });
      customerId = customer.id;

      await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organizationId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organization_id: organizationId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/billing/create-portal - Create Stripe portal session
router.post('/create-portal', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured' });
    }
    const { organizationId } = req;
    const { returnUrl } = req.body;

    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (!org?.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// GET /api/billing/invoices - Invoice history
router.get('/invoices', async (req, res) => {
  try {
    if (!stripe) {
      return res.json({ invoices: [] });
    }
    const { organizationId } = req;

    const { data: org } = await supabase
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (!org?.stripe_customer_id) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: org.stripe_customer_id,
      limit: 100,
    });

    res.json({ invoices: invoices.data });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/billing/usage - Current usage metrics
router.get('/usage', async (req, res) => {
  try {
    const { organizationId } = req;

    const [residents, properties, staff] = await Promise.all([
      supabase
        .from('residents')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_deleted', false),
      supabase
        .from('properties')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_deleted', false),
      supabase
        .from('user_organizations')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('status', 'active'),
    ]);

    res.json({
      usage: {
        residents: residents.count || 0,
        properties: properties.count || 0,
        staff: staff.count || 0,
      },
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

export default router;
