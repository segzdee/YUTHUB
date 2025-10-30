import Stripe from 'stripe';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil' as any,
});

export interface CreateSubscriptionParams {
  organizationId: string;
  planName: 'starter' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  customerEmail: string;
  customerName: string;
}

export interface UpdateSubscriptionParams {
  organizationId: string;
  newPlanName: 'starter' | 'professional' | 'enterprise';
  billingCycle?: 'monthly' | 'annual';
}

export async function createStripeCustomer(
  organizationId: string,
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId,
      ...metadata,
    },
  });

  await db.execute(sql`
    UPDATE organizations
    SET stripe_customer_id = ${customer.id},
        updated_at = now()
    WHERE id = ${organizationId}
  `);

  return customer;
}

export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<Stripe.Subscription> {
  const { organizationId, planName, billingCycle, customerEmail, customerName } = params;

  const planResult = await db.execute(sql`
    SELECT
      ${billingCycle === 'monthly' ? sql`stripe_price_id_monthly` : sql`stripe_price_id_annual`} as price_id,
      max_residents,
      max_properties,
      features
    FROM subscription_plans
    WHERE name = ${planName} AND is_active = true
    LIMIT 1
  `);

  if (!planResult.rows || planResult.rows.length === 0) {
    throw new Error(`Plan ${planName} not found`);
  }

  const plan = planResult.rows[0] as any;
  const priceId = plan.price_id as string;

  if (!priceId) {
    throw new Error(`Stripe price ID not configured for ${planName} (${billingCycle})`);
  }

  const orgResult = await db.execute(sql`
    SELECT stripe_customer_id
    FROM organizations
    WHERE id = ${organizationId}
    LIMIT 1
  `);

  let customerId = (orgResult.rows?.[0] as any)?.stripe_customer_id as string;

  if (!customerId) {
    const customer = await createStripeCustomer(
      organizationId,
      customerEmail,
      customerName
    );
    customerId = customer.id;
  }

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      organizationId,
      planName,
      billingCycle,
    },
  });

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_tier = ${planName},
      subscription_status = 'active',
      stripe_subscription_id = ${subscription.id},
      billing_cycle = ${billingCycle},
      subscription_start_date = now(),
      max_residents = ${plan.max_residents},
      max_properties = ${plan.max_properties},
      features_enabled = ${JSON.stringify(plan.features)},
      updated_at = now()
    WHERE id = ${organizationId}
  `);

  return subscription;
}

export async function updateSubscription(
  params: UpdateSubscriptionParams
): Promise<Stripe.Subscription> {
  const { organizationId, newPlanName, billingCycle } = params;

  const orgResult = await db.execute(sql`
    SELECT stripe_subscription_id, billing_cycle
    FROM organizations
    WHERE id = ${organizationId}
    LIMIT 1
  `);

  const org = orgResult.rows?.[0] as any;
  if (!org || !org.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  const currentBillingCycle = billingCycle || (org.billing_cycle as string) || 'monthly';

  const planResult = await db.execute(sql`
    SELECT
      ${currentBillingCycle === 'monthly' ? sql`stripe_price_id_monthly` : sql`stripe_price_id_annual`} as price_id,
      max_residents,
      max_properties,
      features
    FROM subscription_plans
    WHERE name = ${newPlanName} AND is_active = true
    LIMIT 1
  `);

  if (!planResult.rows || planResult.rows.length === 0) {
    throw new Error(`Plan ${newPlanName} not found`);
  }

  const plan = planResult.rows[0] as any;
  const priceId = plan.price_id as string;

  const subscription = await stripe.subscriptions.retrieve(org.stripe_subscription_id as string);

  const updatedSubscription = await stripe.subscriptions.update(
    org.stripe_subscription_id as string,
    {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'always_invoice',
      metadata: {
        organizationId,
        planName: newPlanName,
        billingCycle: currentBillingCycle,
      },
    }
  );

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_tier = ${newPlanName},
      billing_cycle = ${currentBillingCycle},
      max_residents = ${plan.max_residents},
      max_properties = ${plan.max_properties},
      features_enabled = ${JSON.stringify(plan.features)},
      updated_at = now()
    WHERE id = ${organizationId}
  `);

  return updatedSubscription;
}

export async function cancelSubscription(
  organizationId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  const orgResult = await db.execute(sql`
    SELECT stripe_subscription_id
    FROM organizations
    WHERE id = ${organizationId}
    LIMIT 1
  `);

  const org = orgResult.rows?.[0] as any;
  if (!org || !org.stripe_subscription_id) {
    throw new Error('No active subscription found');
  }

  const subscription = await stripe.subscriptions.update(
    org.stripe_subscription_id as string,
    {
      cancel_at_period_end: !immediately,
      ...(immediately && { cancel_at: Math.floor(Date.now() / 1000) }),
    }
  );

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_status = ${immediately ? 'cancelled' : 'active'},
      ${immediately ? sql`subscription_end_date = now(),` : sql``}
      updated_at = now()
    WHERE id = ${organizationId}
  `);

  return subscription;
}

export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) return;

  const status = subscription.status === 'active' ? 'active' : 'past_due';

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_status = ${status},
      stripe_subscription_id = ${subscription.id},
      subscription_end_date = to_timestamp(${(subscription as any).current_period_end}),
      updated_at = now()
    WHERE id = ${organizationId}
  `);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const organizationId = subscription.metadata.organizationId;
  if (!organizationId) return;

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_status = 'cancelled',
      subscription_end_date = now(),
      updated_at = now()
    WHERE id = ${organizationId}
  `);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const orgResult = await db.execute(sql`
    SELECT id
    FROM organizations
    WHERE stripe_customer_id = ${customerId}
    LIMIT 1
  `);

  const organizationId = (orgResult.rows?.[0] as any)?.id as string;
  if (!organizationId) return;

  await db.execute(sql`
    INSERT INTO payment_transactions (
      organization_id,
      stripe_payment_intent_id,
      amount,
      currency,
      status,
      description,
      paid_at,
      created_at,
      updated_at
    ) VALUES (
      ${organizationId},
      ${(invoice as any).payment_intent as string},
      ${(invoice.amount_paid / 100).toFixed(2)},
      ${invoice.currency.toUpperCase()},
      'succeeded',
      ${'Subscription payment'},
      to_timestamp(${invoice.status_transitions.paid_at || Math.floor(Date.now() / 1000)}),
      now(),
      now()
    )
    ON CONFLICT (stripe_payment_intent_id) DO NOTHING
  `);

  await db.execute(sql`
    INSERT INTO subscription_invoices (
      organization_id,
      stripe_invoice_id,
      invoice_number,
      status,
      amount_due,
      amount_paid,
      currency,
      billing_period_start,
      billing_period_end,
      paid_at,
      invoice_pdf_url,
      created_at,
      updated_at
    ) VALUES (
      ${organizationId},
      ${invoice.id},
      ${invoice.number || `INV-${Date.now()}`},
      'paid',
      ${(invoice.amount_due / 100).toFixed(2)},
      ${(invoice.amount_paid / 100).toFixed(2)},
      ${invoice.currency.toUpperCase()},
      to_timestamp(${invoice.period_start}),
      to_timestamp(${invoice.period_end}),
      to_timestamp(${invoice.status_transitions.paid_at || Math.floor(Date.now() / 1000)}),
      ${invoice.invoice_pdf || null},
      now(),
      now()
    )
    ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      status = 'paid',
      amount_paid = ${(invoice.amount_paid / 100).toFixed(2)},
      paid_at = to_timestamp(${invoice.status_transitions.paid_at || Math.floor(Date.now() / 1000)}),
      updated_at = now()
  `);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const orgResult = await db.execute(sql`
    SELECT id
    FROM organizations
    WHERE stripe_customer_id = ${customerId}
    LIMIT 1
  `);

  const organizationId = (orgResult.rows?.[0] as any)?.id as string;
  if (!organizationId) return;

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_status = 'past_due',
      updated_at = now()
    WHERE id = ${organizationId}
  `);

  await db.execute(sql`
    INSERT INTO payment_transactions (
      organization_id,
      stripe_payment_intent_id,
      amount,
      currency,
      status,
      description,
      created_at,
      updated_at
    ) VALUES (
      ${organizationId},
      ${(invoice as any).payment_intent as string},
      ${(invoice.amount_due / 100).toFixed(2)},
      ${invoice.currency.toUpperCase()},
      'failed',
      ${'Payment failed'},
      now(),
      now()
    )
    ON CONFLICT (stripe_payment_intent_id) DO UPDATE SET
      status = 'failed',
      updated_at = now()
  `);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const organizationId = session.metadata?.organizationId;
  if (!organizationId) return;

  await db.execute(sql`
    UPDATE organizations
    SET
      subscription_status = 'active',
      updated_at = now()
    WHERE id = ${organizationId}
  `);
}

export default {
  stripe,
  createStripeCustomer,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  handleWebhookEvent,
};
