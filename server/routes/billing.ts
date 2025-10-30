import express, { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import stripeService from '../services/stripeService';
import { requireActiveSubscription, requireRole } from '../middleware/subscriptionMiddleware';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil' as any,
});

router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      await stripeService.handleWebhookEvent(event);

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
);

router.post(
  '/subscriptions/create',
  requireRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { planName, billingCycle, customerEmail, customerName } = req.body;
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const subscription = await stripeService.createSubscription({
        organizationId,
        planName,
        billingCycle,
        customerEmail,
        customerName,
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent
          ? ((subscription.latest_invoice as any).payment_intent as any).client_secret
          : null,
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/subscriptions/upgrade',
  requireRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { newPlanName, billingCycle } = req.body;
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const subscription = await stripeService.updateSubscription({
        organizationId,
        newPlanName,
        billingCycle,
      });

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
      });
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      res.status(500).json({
        error: 'Failed to upgrade subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.post(
  '/subscriptions/cancel',
  requireRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { immediately } = req.body;
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const subscription = await stripeService.cancelSubscription(
        organizationId,
        immediately
      );

      res.json({
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({
        error: 'Failed to cancel subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/subscription',
  requireActiveSubscription,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const result = await db.execute(sql`
        SELECT
          o.subscription_tier,
          o.subscription_status,
          o.billing_cycle,
          o.max_residents,
          o.max_properties,
          o.current_resident_count,
          o.current_property_count,
          o.features_enabled,
          o.subscription_start_date,
          o.subscription_end_date,
          o.trial_end_date,
          sp.display_name as plan_name,
          sp.price_monthly,
          sp.price_annual
        FROM organizations o
        LEFT JOIN subscription_plans sp ON sp.name = o.subscription_tier
        WHERE o.id = ${organizationId}
        LIMIT 1
      `);

      if (!result.rows || result.rows.length === 0) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({
        error: 'Failed to fetch subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/plans',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await db.execute(sql`
        SELECT
          name,
          display_name,
          description,
          price_monthly,
          price_annual,
          max_residents,
          max_properties,
          features,
          sort_order
        FROM subscription_plans
        WHERE is_active = true
        ORDER BY sort_order ASC
      `);

      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({
        error: 'Failed to fetch plans',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/invoices',
  requireRole(['admin']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const result = await db.execute(sql`
        SELECT
          invoice_number,
          status,
          amount_due,
          amount_paid,
          currency,
          billing_period_start,
          billing_period_end,
          due_date,
          paid_at,
          invoice_pdf_url,
          created_at
        FROM subscription_invoices
        WHERE organization_id = ${organizationId}
        ORDER BY created_at DESC
        LIMIT 50
      `);

      res.json(result.rows || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        error: 'Failed to fetch invoices',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get(
  '/usage',
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = req.organizationId;

      if (!organizationId) {
        res.status(400).json({ error: 'Organization not found' });
        return;
      }

      const result = await db.execute(sql`
        SELECT
          current_resident_count,
          max_residents,
          current_property_count,
          max_properties,
          subscription_tier,
          features_enabled
        FROM organizations
        WHERE id = ${organizationId}
        LIMIT 1
      `);

      if (!result.rows || result.rows.length === 0) {
        res.status(404).json({ error: 'Organization not found' });
        return;
      }

      const org = result.rows[0];

      res.json({
        residents: {
          current: org.current_resident_count,
          max: org.max_residents,
          percentage: Math.round(((org.current_resident_count as number) / (org.max_residents as number)) * 100),
        },
        properties: {
          current: org.current_property_count,
          max: org.max_properties,
          percentage: Math.round(((org.current_property_count as number) / (org.max_properties as number)) * 100),
        },
        tier: org.subscription_tier,
        features: org.features_enabled,
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
      res.status(500).json({
        error: 'Failed to fetch usage',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
