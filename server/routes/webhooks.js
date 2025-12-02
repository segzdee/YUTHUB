import express from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabase.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook handler with signature verification
 * Handles: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.deleted
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    console.error('Stripe not configured');
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful checkout - activate subscription
 */
async function handleCheckoutCompleted(session) {
  console.log('Processing checkout.session.completed:', session.id);

  const organizationId = session.metadata?.organization_id;
  if (!organizationId) {
    console.error('No organization_id in session metadata');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update organization with subscription details
  const { error } = await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      subscription_tier: mapStripePriceToTier(subscription.items.data[0].price.id),
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId);

  if (error) {
    console.error('Failed to update organization:', error);
    return;
  }

  // Log subscription activation
  await supabase.from('team_activity_log').insert({
    organization_id: organizationId,
    user_id: '00000000-0000-0000-0000-000000000000',
    action: 'subscription_activated',
    entity_type: 'subscription',
    description: `Subscription activated via Stripe`,
  });

  console.log(`Subscription activated for organization ${organizationId}`);
}

/**
 * Handle successful invoice payment - log payment
 */
async function handleInvoicePaid(invoice) {
  console.log('Processing invoice.paid:', invoice.id);

  const customerId = invoice.customer;

  // Find organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Ensure subscription is marked as active
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  // Log payment
  await supabase.from('team_activity_log').insert({
    organization_id: org.id,
    user_id: '00000000-0000-0000-0000-000000000000',
    action: 'payment_received',
    entity_type: 'billing',
    description: `Payment received: ${invoice.currency.toUpperCase()} ${(invoice.amount_paid / 100).toFixed(2)}`,
  });

  console.log(`Payment logged for organization ${org.id}`);
}

/**
 * Handle failed payment - flag account and send notification
 */
async function handlePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed:', invoice.id);

  const customerId = invoice.customer;

  // Find organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, contact_email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Flag account with payment issue
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  // Log payment failure
  await supabase.from('team_activity_log').insert({
    organization_id: org.id,
    user_id: '00000000-0000-0000-0000-000000000000',
    action: 'payment_failed',
    entity_type: 'billing',
    description: `Payment failed for invoice ${invoice.id}`,
  });

  // TODO: Send dunning email to org.contact_email
  console.log(`Payment failure logged for organization ${org.id}`);
  console.log(`TODO: Send dunning email to ${org.contact_email}`);
}

/**
 * Handle subscription cancellation - downgrade to free tier
 */
async function handleSubscriptionDeleted(subscription) {
  console.log('Processing customer.subscription.deleted:', subscription.id);

  const customerId = subscription.customer;

  // Find organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Downgrade to free tier
  await supabase
    .from('organizations')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  // Log cancellation
  await supabase.from('team_activity_log').insert({
    organization_id: org.id,
    user_id: '00000000-0000-0000-0000-000000000000',
    action: 'subscription_canceled',
    entity_type: 'subscription',
    description: `Subscription canceled, downgraded to free tier`,
  });

  console.log(`Subscription canceled for organization ${org.id}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  console.log('Processing customer.subscription.updated:', subscription.id);

  const customerId = subscription.customer;

  // Find organization by Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!org) {
    console.error('Organization not found for customer:', customerId);
    return;
  }

  // Update subscription details
  await supabase
    .from('organizations')
    .update({
      subscription_status: subscription.status,
      subscription_tier: mapStripePriceToTier(subscription.items.data[0].price.id),
      updated_at: new Date().toISOString(),
    })
    .eq('id', org.id);

  console.log(`Subscription updated for organization ${org.id}`);
}

/**
 * Map Stripe price ID to subscription tier
 */
function mapStripePriceToTier(priceId) {
  // TODO: Map your actual Stripe price IDs to tiers
  const priceMap = {
    'price_starter': 'starter',
    'price_professional': 'professional',
    'price_enterprise': 'enterprise',
  };

  return priceMap[priceId] || 'professional';
}

export default router;
