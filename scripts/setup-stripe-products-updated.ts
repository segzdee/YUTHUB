import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is required');
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Supabase credentials are required');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Setup Stripe products and prices for YUTHUB - Updated Pricing
 */
async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products with updated pricing...\n');

  const tiers = [
    {
      name: 'starter',
      displayName: 'YUTHUB Starter',
      monthlyPrice: 19900, // £199.00
      annualPrice: 202980, // £2,029.80 (15% off)
      description: 'Perfect for small organizations managing 1 property with up to 10 residents',
      features: [
        '1 property/location',
        '10 residents maximum',
        '5 staff members',
        '10GB storage',
        'Core housing management',
        'Basic reporting',
        'Email support'
      ]
    },
    {
      name: 'professional',
      displayName: 'YUTHUB Professional',
      monthlyPrice: 49900, // £499.00
      annualPrice: 510060, // £5,100.60 (15% off)
      description: 'Ideal for growing organizations managing multiple properties',
      features: [
        '5 properties/locations',
        '25 residents maximum',
        '15 staff members',
        '50GB storage',
        'Safeguarding module',
        'Financial management',
        'Advanced reporting',
        'Priority support'
      ]
    },
    {
      name: 'enterprise',
      displayName: 'YUTHUB Enterprise',
      monthlyPrice: 99900, // £999.00
      annualPrice: 1019040, // £10,190.40 (15% off)
      description: 'Complete solution for large organizations with unlimited capacity',
      features: [
        'Unlimited properties',
        'Unlimited residents',
        'Unlimited staff',
        'Unlimited storage',
        'All features included',
        'Crisis intervention module',
        'AI-powered analytics',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        '24/7 priority support'
      ]
    }
  ];

  const createdProducts: Record<string, {
    productId: string;
    monthlyPriceId: string;
    annualPriceId: string;
  }> = {};

  for (const tier of tiers) {
    console.log(`📦 Creating product: ${tier.displayName}`);

    // Create product
    const product = await stripe.products.create({
      name: tier.displayName,
      description: tier.description,
      metadata: {
        tier: tier.name,
        platform: 'yuthub'
      }
    });

    console.log(`✅ Product created: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.monthlyPrice,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        usage_type: 'licensed'
      },
      metadata: {
        tier: tier.name,
        billing_period: 'month'
      }
    });

    console.log(`✅ Monthly price created: ${monthlyPrice.id} (£${(tier.monthlyPrice / 100).toFixed(2)}/month)`);

    // Create annual price
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.annualPrice,
      currency: 'gbp',
      recurring: {
        interval: 'year',
        usage_type: 'licensed'
      },
      metadata: {
        tier: tier.name,
        billing_period: 'year',
        discount_percent: '15'
      }
    });

    const annualSavings = (tier.monthlyPrice * 12 - tier.annualPrice) / 100;
    console.log(`✅ Annual price created: ${annualPrice.id} (£${(tier.annualPrice / 100).toFixed(2)}/year - Save £${annualSavings.toFixed(2)})`);

    createdProducts[tier.name] = {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      annualPriceId: annualPrice.id
    };

    // Update database with Stripe IDs for monthly
    const { error: monthlyError } = await supabase
      .from('subscription_tiers')
      .update({
        stripe_product_id: product.id,
        stripe_price_id: monthlyPrice.id
      })
      .eq('tier_name', tier.name)
      .eq('billing_period', 'month');

    if (monthlyError) {
      console.error(`❌ Failed to update monthly database for ${tier.name}:`, monthlyError);
    } else {
      console.log(`✅ Database updated for ${tier.name} (monthly)`);
    }

    // Update database with Stripe IDs for annual
    const { error: annualError } = await supabase
      .from('subscription_tiers')
      .update({
        stripe_product_id: product.id,
        stripe_price_id: annualPrice.id
      })
      .eq('tier_name', tier.name)
      .eq('billing_period', 'year');

    if (annualError) {
      console.error(`❌ Failed to update annual database for ${tier.name}:`, annualError);
    } else {
      console.log(`✅ Database updated for ${tier.name} (annual)\n`);
    }
  }

  // Print environment variables to add to .env
  console.log('\n📝 Add these to your .env file:\n');
  console.log(`STRIPE_PRICE_STARTER_MONTHLY=${createdProducts.starter.monthlyPriceId}`);
  console.log(`STRIPE_PRICE_STARTER_ANNUAL=${createdProducts.starter.annualPriceId}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL_MONTHLY=${createdProducts.professional.monthlyPriceId}`);
  console.log(`STRIPE_PRICE_PROFESSIONAL_ANNUAL=${createdProducts.professional.annualPriceId}`);
  console.log(`STRIPE_PRICE_ENTERPRISE_MONTHLY=${createdProducts.enterprise.monthlyPriceId}`);
  console.log(`STRIPE_PRICE_ENTERPRISE_ANNUAL=${createdProducts.enterprise.annualPriceId}`);

  console.log('\n✅ Stripe setup complete!');
  console.log('\n💰 Updated Pricing Summary:');
  console.log('┌──────────────┬─────────────┬──────────────┬──────────────┐');
  console.log('│ Tier         │ Monthly     │ Annual       │ Annual Save  │');
  console.log('├──────────────┼─────────────┼──────────────┼──────────────┤');
  console.log('│ Starter      │ £199.00     │ £2,029.80    │ £358.20      │');
  console.log('│ Professional │ £499.00     │ £5,100.60    │ £887.40      │');
  console.log('│ Enterprise   │ £999.00     │ £10,190.40   │ £1,798.60    │');
  console.log('└──────────────┴─────────────┴──────────────┴──────────────┘');

  console.log('\n📌 Next steps:');
  console.log('1. Add the Stripe price IDs to your .env file');
  console.log('2. Set up webhook endpoint in Stripe Dashboard');
  console.log('3. Configure webhook URL: https://your-domain.com/api/webhooks/stripe');
  console.log('4. Add webhook secret to STRIPE_WEBHOOK_SECRET in .env');
  console.log('\nWebhook events to enable:');
  console.log('  - customer.subscription.created');
  console.log('  - customer.subscription.updated');
  console.log('  - customer.subscription.deleted');
  console.log('  - customer.subscription.trial_will_end');
  console.log('  - invoice.payment_succeeded');
  console.log('  - invoice.payment_failed');
  console.log('  - invoice.finalized');
  console.log('  - payment_intent.succeeded');
  console.log('  - payment_intent.payment_failed');
}

// Run setup
setupStripeProducts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
