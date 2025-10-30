# Subscription Middleware Usage Guide

This guide explains how to protect routes with subscription tier and feature checks.

## Available Middleware

### 1. `loadSubscriptionInfo`
Automatically loads subscription information for authenticated users. Add this to your Express app early in the middleware chain:

```typescript
app.use(loadSubscriptionInfo);
```

This adds the following to `req`:
- `req.subscription` - Full subscription info
- `req.organizationId` - User's organization ID
- `req.userRole` - User's role in the organization

### 2. `requireActiveSubscription`
Ensures the user has an active, paid subscription:

```typescript
app.get('/api/premium-feature',
  isAuthenticated,
  requireActiveSubscription,
  async (req, res) => {
    // Your route handler
  }
);
```

### 3. `requireFeature(featureName)`
Checks if a specific feature is enabled in the user's plan:

```typescript
app.get('/api/analytics/advanced',
  isAuthenticated,
  requireFeature('advanced_analytics'),
  async (req, res) => {
    // Only accessible if advanced_analytics feature is enabled
  }
);
```

### 4. `requireTier(minTier)`
Ensures the user is on a minimum subscription tier:

```typescript
app.post('/api/properties',
  isAuthenticated,
  requireTier('professional'), // Requires Professional or Enterprise
  async (req, res) => {
    // Your route handler
  }
);
```

### 5. `checkResidentLimit`
Prevents adding residents if limit is reached:

```typescript
app.post('/api/residents',
  isAuthenticated,
  checkResidentLimit,
  async (req, res) => {
    // Add resident logic - will only execute if under limit
  }
);
```

### 6. `checkPropertyLimit`
Prevents adding properties if limit is reached:

```typescript
app.post('/api/properties',
  isAuthenticated,
  checkPropertyLimit,
  async (req, res) => {
    // Add property logic - will only execute if under limit
  }
);
```

### 7. `requireRole(roles)`
Checks user has required role(s):

```typescript
app.delete('/api/organization/settings',
  isAuthenticated,
  requireRole('admin'),
  async (req, res) => {
    // Only admins can access
  }
);

app.get('/api/reports',
  isAuthenticated,
  requireRole(['admin', 'manager']),
  async (req, res) => {
    // Admins and managers can access
  }
);
```

## Example Route Patterns

### Creating Resources with Limits

```typescript
// Add a new resident - check limit and require active subscription
app.post('/api/residents',
  isAuthenticated,
  requireActiveSubscription,
  checkResidentLimit,
  async (req, res) => {
    const { organizationId } = req;
    const newResident = await db.insert(residents).values({
      ...req.body,
      tenant_id: organizationId,
    });
    res.json(newResident);
  }
);

// Add a new property - check limit and require Professional tier
app.post('/api/properties',
  isAuthenticated,
  requireTier('professional'),
  checkPropertyLimit,
  async (req, res) => {
    const { organizationId } = req;
    const newProperty = await db.insert(properties).values({
      ...req.body,
      tenant_id: organizationId,
    });
    res.json(newProperty);
  }
);
```

### Feature-Gated Endpoints

```typescript
// Advanced analytics - only for Professional+
app.get('/api/analytics/trends',
  isAuthenticated,
  requireFeature('advanced_analytics'),
  async (req, res) => {
    // Return advanced analytics
  }
);

// AI insights - only for Enterprise
app.get('/api/ai/insights',
  isAuthenticated,
  requireFeature('ai_analytics'),
  async (req, res) => {
    // Return AI-powered insights
  }
);

// Crisis intervention tools - Professional+
app.post('/api/crisis/alert',
  isAuthenticated,
  requireFeature('crisis_intervention'),
  async (req, res) => {
    // Handle crisis alert
  }
);

// API access - Professional+
app.get('/api/v1/export',
  isAuthenticated,
  requireFeature('api_access'),
  async (req, res) => {
    // Export data via API
  }
);
```

### Combining Multiple Checks

```typescript
// Multi-property management - requires Professional tier AND multi_property feature
app.get('/api/properties/bulk-manage',
  isAuthenticated,
  requireTier('professional'),
  requireFeature('multi_property'),
  async (req, res) => {
    // Bulk property management
  }
);

// Admin-only billing page - requires admin role AND active subscription
app.get('/api/billing/invoices',
  isAuthenticated,
  requireActiveSubscription,
  requireRole('admin'),
  async (req, res) => {
    // Return invoices
  }
);
```

## Accessing Subscription Data in Routes

Inside route handlers, you can access subscription information:

```typescript
app.get('/api/dashboard',
  isAuthenticated,
  requireActiveSubscription,
  async (req, res) => {
    const { subscription, organizationId, userRole } = req;

    // Check tier
    if (subscription.subscriptionTier === 'enterprise') {
      // Show enterprise features
    }

    // Check feature
    if (subscription.features.advanced_analytics) {
      // Include advanced analytics
    }

    // Check limits
    const residentUsage = {
      current: subscription.limits.currentResidents,
      max: subscription.limits.maxResidents,
      percentage: (subscription.limits.currentResidents / subscription.limits.maxResidents) * 100,
    };

    res.json({
      organizationId,
      userRole,
      tier: subscription.subscriptionTier,
      status: subscription.subscriptionStatus,
      residentUsage,
      // ... other dashboard data
    });
  }
);
```

## Error Responses

When a subscription check fails, the middleware returns standardized error responses:

### Inactive Subscription
```json
{
  "error": "Subscription inactive",
  "message": "Your subscription is not active. Please update your payment method or renew your subscription.",
  "subscriptionStatus": "past_due"
}
```

### Feature Not Available
```json
{
  "error": "Feature not available",
  "message": "This feature is not available in your current plan (starter). Please upgrade to access it.",
  "featureName": "advanced_analytics",
  "currentTier": "starter",
  "requiredUpgrade": true
}
```

### Insufficient Tier
```json
{
  "error": "Insufficient subscription tier",
  "message": "This feature requires professional plan or higher. You are currently on starter plan.",
  "currentTier": "starter",
  "requiredTier": "professional",
  "requiredUpgrade": true
}
```

### Limit Reached
```json
{
  "error": "Resident limit reached",
  "message": "You have reached your resident limit (25). Please upgrade your plan to add more residents.",
  "currentCount": 25,
  "maxAllowed": 25,
  "requiredUpgrade": true
}
```

## Feature Names Reference

Available features to check with `requireFeature()`:

### Starter Plan
- `resident_management`
- `basic_reporting`
- `progress_tracking`
- `mobile_app`
- `email_support`

### Professional Plan (includes all Starter features)
- `multi_property`
- `advanced_analytics`
- `crisis_intervention`
- `api_access`
- `white_label`
- `local_authority_integration`
- `gamified_tracking`
- `dedicated_support`

### Enterprise Plan (includes all Professional features)
- `ai_analytics`
- `custom_features`
- `on_premise`
- `priority_support`
- `sla_guarantee`
- `training_programs`
