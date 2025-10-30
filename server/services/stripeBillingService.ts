/**
 * Stripe Billing Service
 * Handles subscription management and billing operations
 */

import Stripe from 'stripe';
import { db } from '../db';
import { organizations } from '@shared/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export class StripeBillingService {
  static async createStripeCustomer(
    organizationId: number,
    organizationName: string,
    email: string
  ) {
    try {
      const customer = await stripe.customers.create({
        name: organizationName,
        email,
        metadata: {
          organizationId: organizationId.toString(),
        },
      });

      await db
        .update(organizations)
        .set({ stripeCustomerId: customer.id })
        .where(eq(organizations.id, organizationId));

      console.log(`✅ Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  static async createSubscription(
    organizationId: number,
    stripeCustomerId: string,
    priceId: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        metadata: {
          organizationId: organizationId.toString(),
        },
      });

      console.log(`✅ Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    const organizationId = parseInt(subscription.metadata?.organizationId || '0');
    if (!organizationId) return;

    try {
      await db
        .update(organizations)
        .set({
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(subscription.current_period_start * 1000),
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(organizations.id, organizationId));

      console.log(`✅ Subscription activated for org ${organizationId}`);
    } catch (error) {
      console.error('Error handling subscription creation:', error);
    }
  }

  static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const organizationId = parseInt(subscription.metadata?.organizationId || '0');
    if (!organizationId) return;

    try {
      const status = subscription.status === 'active' ? 'active' : 'past_due';

      await db
        .update(organizations)
        .set({
          subscriptionStatus: status,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(organizations.id, organizationId));

      console.log(`✅ Subscription updated for org ${organizationId}`);
    } catch (error) {
      console.error('Error handling subscription update:', error);
    }
  }

  static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const organizationId = parseInt(subscription.metadata?.organizationId || '0');
    if (!organizationId) return;

    try {
      await db
        .update(organizations)
        .set({
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null,
        })
        .where(eq(organizations.id, organizationId));

      console.log(`✅ Subscription cancelled for org ${organizationId}`);
    } catch (error) {
      console.error('Error handling subscription deletion:', error);
    }
  }

  static verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    return stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }
}

export default StripeBillingService;
