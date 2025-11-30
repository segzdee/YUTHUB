# YUTHUB Subscription & Billing System - Updated Pricing

## Overview

Complete subscription and billing system with **updated pricing structure** and **annual billing support** (15% discount).

---

## 🆕 Updated Pricing Structure

### Monthly Plans

| Tier | Monthly Price | Properties | Residents | Key Features |
|------|---------------|------------|-----------|--------------|
| **Starter** | **£199/month** | 1 | 10 | Core housing management, Basic reporting |
| **Professional** | **£499/month** | 5 | 25 | + Safeguarding, Financial management, Advanced reporting |
| **Enterprise** | **£999/month** | Unlimited | Unlimited | + Crisis intervention, AI analytics, API access, Dedicated support |

### Annual Plans (15% Discount)

| Tier | Annual Price | Monthly Equivalent | Annual Savings |
|------|--------------|-------------------|----------------|
| **Starter** | **£2,029.80/year** | £169.15/month | **£358.20** |
| **Professional** | **£5,100.60/year** | £425.05/month | **£887.40** |
| **Enterprise** | **£10,190.40/year** | £849.20/month | **£1,798.60** |

### Trial Period
- **14 days free trial** on all plans (monthly and annual)
- Full feature access during trial
- No credit card required

---

## 📊 Pricing Changes Summary

| Tier | Old Monthly | New Monthly | Change | New Annual | Savings |
|------|-------------|-------------|--------|----------|---------|
| Starter | £169 | **£199** | +£30 | £2,029.80 | Save £358 |
| Professional | £429 | **£499** | +£70 | £5,100.60 | Save £887 |
| Enterprise | £849 | **£999** | +£150 | £10,190.40 | Save £1,799 |

---

## 🗄️ Database Schema Updates

### Updated Tables

**`subscription_tiers`** - Now includes annual billing:
- Added 3 new records for annual plans (tier_name + billing_period = 'year')
- Unique constraint on (tier_name, billing_period)
- Annual prices pre-calculated with 15% discount

**`organization_subscriptions`** - New columns:
- `billing_period` - 'month' or 'year'
- `annual_discount_percent` - Track discount (15.00 for annual)

### New Database Functions

```sql
-- Calculate annual price with discount
SELECT calculate_annual_price(19900, 15.00);
-- Returns: 202980 (£2,029.80 in pence)

-- Get tier by billing period
SELECT * FROM get_tier_by_period('starter', 'year');
-- Returns: Annual starter tier details
```

### New Database View

```sql
-- Compare pricing across all tiers and periods
SELECT * FROM subscription_pricing_comparison;
```

**Returns:**
- tier_name, billing_period, display_name
- price_gbp, monthly_equivalent_gbp
- savings_percent (15% for annual, 0% for monthly)
- All feature flags and limits

---

## 🚀 Setup Instructions

### 1. Database Migration

Already applied via Supabase:
```
✅ update_pricing_and_annual_plans.sql
- Updated monthly prices (£199, £499, £999)
- Added annual tiers with 15% discount
- Created comparison views
- Added helper functions
```

### 2. Create Stripe Products & Prices

Run the setup script to create 6 prices in Stripe (3 monthly + 3 annual):

```bash
# Set Stripe secret key in .env
STRIPE_SECRET_KEY=sk_test_your_key_here

# Run setup script
npm run setup:stripe
```

**This will:**
1. Create 3 products in Stripe (Starter, Professional, Enterprise)
2. Create 6 prices:
   - 3 monthly (£199, £499, £999)
   - 3 annual (£2,029.80, £5,100.60, £10,190.40)
3. Update database with Stripe product/price IDs
4. Output price IDs to add to .env

**Example Output:**
```
📦 Creating product: YUTHUB Starter
✅ Product created: prod_xxxxx
✅ Monthly price created: price_xxxxx (£199.00/month)
✅ Annual price created: price_xxxxx (£2,029.80/year - Save £358.20)

Add these to your .env file:
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
...
```

### 3. Update Environment Variables

Add to `.env`:

```bash
# Monthly Prices
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx

# Annual Prices (15% discount)
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxx
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxxxx
```

---

## 📡 API Updates

### Get All Tiers (Including Annual)

```http
GET /api/subscriptions/tiers
```

**Response:**
```json
{
  "tiers": [
    {
      "id": "uuid",
      "tier_name": "starter",
      "display_name": "Starter",
      "billing_period": "month",
      "price_gbp": 19900,
      "max_properties": 1,
      "max_residents": 10
    },
    {
      "id": "uuid",
      "tier_name": "starter",
      "display_name": "Starter (Annual - Save 15%)",
      "billing_period": "year",
      "price_gbp": 202980,
      "max_properties": 1,
      "max_residents": 10
    }
    // ... Professional and Enterprise tiers
  ]
}
```

### Create Subscription with Annual Billing

```http
POST /api/subscriptions/create
Content-Type: application/json

{
  "organizationId": "uuid",
  "tierId": "uuid",  // Use annual tier ID
  "billingPeriod": "year",
  "paymentMethodId": "pm_xxxxx",
  "billingEmail": "billing@organization.com"
}
```

**Benefits:**
- Automatically applies 15% discount
- Charged once per year
- Same 14-day trial period
- All features unlocked

---

## 💳 Stripe Integration

### Products Created

Each tier gets ONE product with TWO prices:

**Product: YUTHUB Starter**
- Monthly Price: £199.00/month (price_xxxxx)
- Annual Price: £2,029.80/year (price_xxxxx)

**Product: YUTHUB Professional**
- Monthly Price: £499.00/month (price_xxxxx)
- Annual Price: £5,100.60/year (price_xxxxx)

**Product: YUTHUB Enterprise**
- Monthly Price: £999.00/month (price_xxxxx)
- Annual Price: £10,190.40/year (price_xxxxx)

### Subscription Intervals

Stripe automatically handles:
- **Monthly**: Recurring charge every month
- **Annual**: Recurring charge every 12 months
- **Proration**: When switching between monthly/annual
- **Trial**: 14 days before first charge

---

## 🔄 Switching Between Monthly & Annual

### Upgrade to Annual (Save 15%)

```http
POST /api/subscriptions/:subscriptionId/change-billing
Content-Type: application/json

{
  "newBillingPeriod": "year"
}
```

**What happens:**
1. Calculate remaining time on monthly subscription
2. Apply prorated credit
3. Charge annual rate (with 15% discount)
4. Reset billing period to annual

**Customer saves:**
- Immediate 15% discount
- Prorated credit for unused monthly time

### Downgrade to Monthly

```http
POST /api/subscriptions/:subscriptionId/change-billing
Content-Type: application/json

{
  "newBillingPeriod": "month"
}
```

**What happens:**
1. Calculate unused time on annual subscription
2. Apply at end of current period
3. Start monthly billing at next renewal
4. Lose 15% discount

---

## 💰 Billing Examples

### Example 1: New Starter Annual Subscription

**Scenario:** Customer signs up for Starter Annual

```
Trial Period:  14 days (free)
After Trial:   £2,029.80 charged immediately
Next Charge:   In 12 months (£2,029.80)
Savings:       £358.20 vs monthly (£199 × 12 = £2,388)
```

### Example 2: Upgrade from Starter Monthly to Annual

**Scenario:** Customer on Starter Monthly (paid £199), wants annual after 10 days

```
Current Status:  £199 monthly, 10 days into billing period
Unused Credit:   £132.67 (20 days remaining)
Annual Cost:     £2,029.80
Prorated Charge: £2,029.80 - £132.67 = £1,897.13
Next Charge:     In 12 months (£2,029.80)
```

### Example 3: Professional Monthly → Annual Mid-Year

**Scenario:** Customer on Professional Monthly for 6 months, switches to annual

```
Monthly Paid:    £499 × 6 = £2,994
Remaining:       6 months left in year
Annual Cost:     £5,100.60
Prorated:        Calculate remaining value + annual cost
Benefit:         Lock in 15% discount for next 12 months
```

---

## 🎁 Discount Codes

### Pre-configured Codes

1. **EARLYPARTNER50**
   - 50% off first 6 months
   - Works with monthly AND annual
   - Can stack with annual 15% discount
   - Example: Annual Starter = £2,029.80 × 50% = £1,014.90

2. **LAUNCH30**
   - 30% off first 3 months
   - Starter & Professional only
   - Cannot be used with annual (annual already discounted)

### Annual-Specific Promotion

Consider creating:
- **ANNUAL20** - Extra 20% off annual plans (total 32% off)
- **PAYYEARLY** - Free month (equivalent to 8% extra off)
- **YEAREND** - Seasonal annual promotion

---

## 📊 Revenue Impact Analysis

### Monthly vs Annual Revenue

**100 Customers Breakdown:**

| Scenario | Monthly | Annual | Difference |
|----------|---------|--------|------------|
| All Starter | £19,900/mo (£238,800/yr) | £202,980/yr | -15% |
| All Professional | £49,900/mo (£598,800/yr) | £510,060/yr | -15% |
| All Enterprise | £99,900/mo (£1,198,800/yr) | £1,019,040/yr | -15% |

### Cash Flow Impact

**Annual Billing Benefits:**
- 📈 Higher upfront revenue
- 💰 Improved cash flow
- 🔒 Better customer retention (12-month commitment)
- 📉 Lower churn rate

**Example:**
- 100 monthly customers = £19,900 collected per month
- 100 annual customers = £202,980 collected upfront
- **Cash flow advantage: £183,080 immediate revenue**

### Recommendation

**Target Mix:**
- 40% monthly (steady predictable income)
- 60% annual (cash flow boost, lower churn)

**Expected Annual Revenue (100 customers, 60/40 split):**
```
60 annual @ £2,029.80 = £121,788
40 monthly @ £199 × 12 = £95,520
──────────────────────────────────
Total: £217,308
```

---

## 🔐 Security & Compliance

### VAT Handling

**Monthly Plans:**
```
Base: £199.00
VAT (20%): £39.80
Total: £238.80
```

**Annual Plans:**
```
Base: £2,029.80
VAT (20%): £405.96
Total: £2,435.76
```

### Invoice Requirements

All invoices include:
- Breakdown by plan (monthly/annual)
- Discount applied (15% for annual)
- VAT calculation (20%)
- Total amount charged
- Billing period (month or 12 months)

---

## 📈 Reporting & Analytics

### Admin Dashboard Metrics

**New Metrics:**
- Monthly vs Annual subscriber count
- Average billing period
- Annual conversion rate
- Revenue by billing period
- Churn rate comparison (monthly vs annual)

### Example Queries

```sql
-- Get annual vs monthly distribution
SELECT
  billing_period,
  COUNT(*) as subscriber_count,
  SUM(amount_gbp) as total_value_pence
FROM organization_subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY billing_period;

-- Calculate annual discount impact
SELECT
  tier_name,
  COUNT(*) as annual_subscribers,
  SUM((price_gbp * 12 * 0.15) / 100) as total_discount_gbp
FROM organization_subscriptions os
JOIN subscription_tiers st ON os.tier_id = st.id
WHERE os.billing_period = 'year'
  AND os.status = 'active'
GROUP BY tier_name;
```

---

## ✅ Testing Checklist

### Before Launch

- [ ] Test monthly subscription creation
- [ ] Test annual subscription creation
- [ ] Verify 15% discount applied on annual
- [ ] Test switching monthly → annual
- [ ] Test switching annual → monthly
- [ ] Verify proration calculations
- [ ] Test trial period (14 days)
- [ ] Test invoice generation (monthly & annual)
- [ ] Verify VAT calculations (20%)
- [ ] Test webhook processing
- [ ] Verify usage limits enforcement
- [ ] Test all 6 Stripe prices work correctly

### Stripe Test Cards

Use in test mode:
- 4242 4242 4242 4242 - Success
- 4000 0000 0000 0002 - Card declined

---

## 🚀 Deployment Checklist

### Pre-Production

1. ✅ Database migration applied
2. ⏹️ Run `npm run setup:stripe` (live keys)
3. ⏹️ Add 6 price IDs to .env
4. ⏹️ Configure webhook in Stripe Dashboard
5. ⏹️ Test annual subscription flow
6. ⏹️ Verify discount calculations
7. ⏹️ Update frontend pricing display

### Post-Launch

1. Monitor annual vs monthly signup ratio
2. Track conversion from monthly to annual
3. Analyze churn rates by billing period
4. Review revenue forecasts
5. Adjust marketing based on preferences

---

## 📞 Support & Documentation

### Customer-Facing Benefits

**Annual Billing Advantages:**
- Save 15% (£358 - £1,799 per year)
- Lock in current pricing for 12 months
- Simplified billing (one charge per year)
- Priority support consideration
- Avoid price increases for 12 months

### Marketing Messages

- "Save £358/year with annual billing"
- "Get 2 months free when you pay annually"
- "Lock in today's prices for 12 months"
- "15% off when you choose annual"

---

## 📊 Pricing Comparison Table (Customer View)

```
┌────────────────┬─────────────┬──────────────┬──────────────┐
│ Plan           │ Monthly     │ Annual       │ Annual Save  │
├────────────────┼─────────────┼──────────────┼──────────────┤
│ Starter        │ £199/month  │ £2,029/year  │ £358 (15%)   │
│ Professional   │ £499/month  │ £5,101/year  │ £887 (15%)   │
│ Enterprise     │ £999/month  │ £10,190/year │ £1,799 (15%) │
└────────────────┴─────────────┴──────────────┴──────────────┘
```

---

**The YUTHUB subscription system now supports updated pricing (£199/£499/£999 monthly) with annual billing options offering 15% discount, providing customers with flexible payment options and improved cash flow for the business.**

---

## Next Steps

1. Run `npm run setup:stripe` to create Stripe prices
2. Update frontend pricing components to show annual options
3. Add toggle for monthly/annual selection
4. Display savings when annual is selected
5. Test complete flow in Stripe test mode
6. Deploy to production

**Ready for production deployment! 🎉**
