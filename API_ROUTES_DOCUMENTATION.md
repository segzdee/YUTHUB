# YUTHUB API Routes Documentation

## Overview

Complete REST API documentation for the YUTHUB Housing Platform with authentication, organization isolation, and role-based access control.

**Base URL**: `/api`
**Authentication**: Bearer token (JWT) required for all routes except registration and login
**Organization Isolation**: All data requests are automatically scoped to the user's organization

---

## Authentication

All API routes (except `/auth/register` and `/auth/login`) require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Routes (`/api/auth`)

### POST /api/auth/register
Create organization + admin user

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Example Housing Association",
  "organizationType": "housing_association"
}
```

**Response:** `201 Created`
```json
{
  "user": { "id": "uuid", "email": "...", ... },
  "session": { "access_token": "...", "refresh_token": "..." },
  "organization": { "id": "uuid", "name": "...", ... }
}
```

---

### POST /api/auth/login
Email/password authentication

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": { ... },
  "session": { "access_token": "...", "refresh_token": "..." },
  "organization": { ... },
  "role": "admin"
}
```

---

### POST /api/auth/logout
Invalidate current session

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/refresh
Refresh access token

**Request Body:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "session": { "access_token": "...", "refresh_token": "..." },
  "user": { ... }
}
```

---

### POST /api/auth/forgot-password
Send password reset email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

### POST /api/auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successfully",
  "user": { ... }
}
```

---

### GET /api/auth/me
Get current user profile

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": { "id": "uuid", "email": "...", ... },
  "organization": { "id": "uuid", "name": "...", ... },
  "role": "admin"
}
```

---

## 2. Dashboard Routes (`/api/dashboard`)

### GET /api/dashboard/metrics
Dashboard KPIs

**Query Parameters:** None

**Response:** `200 OK`
```json
{
  "residents": {
    "active": 45,
    "total": 50
  },
  "properties": {
    "total": 5,
    "totalBeds": 120,
    "occupiedBeds": 98,
    "occupancyRate": 82
  },
  "incidents": {
    "total": 12,
    "critical": 2
  }
}
```

---

### GET /api/dashboard/activity
Recent activity feed

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response:** `200 OK`
```json
{
  "activities": [
    {
      "id": "uuid",
      "action": "create",
      "entity_type": "resident",
      "entity_id": "uuid",
      "description": "Created resident: John Smith",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

---

### GET /api/dashboard/alerts
Active alerts and notifications

**Response:** `200 OK`
```json
{
  "criticalIncidents": [...],
  "upcomingReviews": [...],
  "overdueActions": [...]
}
```

---

## 3. Residents Routes (`/api/residents`)

### GET /api/residents
List residents with pagination and filtering

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (active, inactive, moved_on)
- `search` (optional): Search by name or email
- `propertyId` (optional): Filter by property
- `sortBy` (optional): Sort field (default: created_at)
- `sortOrder` (optional): asc or desc (default: desc)

**Response:** `200 OK`
```json
{
  "residents": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/residents/:id
Get resident details

**Response:** `200 OK`
```json
{
  "resident": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "properties": { ... },
    "rooms": { ... },
    "support_plans": [...],
    "incidents": [...]
  }
}
```

---

### POST /api/residents
Create resident (intake)

**Permissions:** owner, admin, manager

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "date_of_birth": "2005-01-15",
  "email": "john@example.com",
  "phone": "+44 7700 900000",
  "property_id": "uuid",
  "room_id": "uuid",
  "status": "active"
}
```

**Response:** `201 Created`
```json
{
  "resident": { ... }
}
```

---

### PATCH /api/residents/:id
Update resident

**Permissions:** owner, admin, manager, staff

**Request Body:** Partial resident object

**Response:** `200 OK`
```json
{
  "resident": { ... }
}
```

---

### DELETE /api/residents/:id
Soft delete resident

**Permissions:** owner, admin, manager

**Response:** `200 OK`
```json
{
  "message": "Resident deleted successfully"
}
```

---

### GET /api/residents/:id/support-plans
Get resident's support plans

**Response:** `200 OK`
```json
{
  "plans": [...]
}
```

---

### GET /api/residents/:id/incidents
Get resident's incidents

**Response:** `200 OK`
```json
{
  "incidents": [...]
}
```

---

### GET /api/residents/:id/progress
Get progress history

**Response:** `200 OK`
```json
{
  "progress": [...]
}
```

---

## 4. Support Plans Routes (`/api/support-plans`)

### GET /api/support-plans
List all support plans

**Query Parameters:**
- `residentId` (optional): Filter by resident
- `status` (optional): Filter by status

**Response:** `200 OK`
```json
{
  "plans": [...]
}
```

---

### GET /api/support-plans/:id
Get plan details with goals

**Response:** `200 OK`
```json
{
  "plan": {
    "id": "uuid",
    "plan_name": "Independent Living Skills",
    "residents": { ... },
    "support_plan_goals": [...]
  }
}
```

---

### POST /api/support-plans
Create support plan

**Permissions:** owner, admin, manager, staff

**Request Body:**
```json
{
  "resident_id": "uuid",
  "plan_name": "Independent Living Skills",
  "start_date": "2024-01-01",
  "review_date": "2024-04-01",
  "status": "active"
}
```

**Response:** `201 Created`

---

### PATCH /api/support-plans/:id
Update plan

**Permissions:** owner, admin, manager, staff

**Request Body:** Partial plan object

**Response:** `200 OK`

---

### POST /api/support-plans/:id/goals
Add goal to plan

**Permissions:** owner, admin, manager, staff

**Request Body:**
```json
{
  "goal_description": "Learn to cook 3 meals independently",
  "target_date": "2024-03-01",
  "category": "life_skills",
  "status": "in_progress"
}
```

**Response:** `201 Created`

---

### PATCH /api/support-plans/:id/goals/:goalId
Update goal progress

**Permissions:** owner, admin, manager, staff

**Request Body:** Partial goal object

**Response:** `200 OK`

---

## 5. Properties Routes (`/api/properties`)

### GET /api/properties
List properties with occupancy

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": "uuid",
      "property_name": "Main House",
      "total_beds": 24,
      "occupied_beds": 20,
      "address_line1": "123 Example Street",
      "city": "London",
      "postcode": "SW1A 1AA"
    }
  ]
}
```

---

### GET /api/properties/:id
Get property details

**Response:** `200 OK`

---

### POST /api/properties
Create property

**Permissions:** owner, admin, manager

**Response:** `201 Created`

---

### PATCH /api/properties/:id
Update property

**Permissions:** owner, admin, manager

**Response:** `200 OK`

---

### DELETE /api/properties/:id
Archive property

**Permissions:** owner, admin

**Response:** `200 OK`

---

### GET /api/properties/:id/rooms
Get rooms in property

**Response:** `200 OK`

---

### POST /api/properties/:id/rooms
Add room

**Permissions:** owner, admin, manager

**Response:** `201 Created`

---

### PATCH /api/properties/:id/rooms/:roomId
Update room

**Permissions:** owner, admin, manager

**Response:** `200 OK`

---

## 6. Compliance Routes (`/api/compliance`)

### GET /api/compliance/safeguarding
List safeguarding concerns

**Response:** `200 OK`
```json
{
  "concerns": [...]
}
```

---

### POST /api/compliance/safeguarding
Create concern

**Permissions:** owner, admin, manager, staff

**Request Body:**
```json
{
  "resident_id": "uuid",
  "concern_type": "welfare",
  "description": "...",
  "severity": "medium",
  "reported_date": "2024-01-01"
}
```

**Response:** `201 Created`

---

### PATCH /api/compliance/safeguarding/:id
Update concern

**Permissions:** owner, admin, manager

**Response:** `200 OK`

---

### GET /api/compliance/incidents
List incidents

**Query Parameters:**
- `severity` (optional): low, medium, high, critical
- `status` (optional): reported, investigating, resolved, escalated
- `residentId` (optional): Filter by resident

**Response:** `200 OK`
```json
{
  "incidents": [...]
}
```

---

### POST /api/compliance/incidents
Report incident

**Permissions:** owner, admin, manager, staff

**Request Body:**
```json
{
  "resident_id": "uuid",
  "title": "Incident title",
  "description": "...",
  "incident_date": "2024-01-01T10:00:00Z",
  "severity": "medium",
  "category": "behavioral"
}
```

**Response:** `201 Created`

---

### PATCH /api/compliance/incidents/:id
Update incident

**Permissions:** owner, admin, manager, staff

**Response:** `200 OK`

---

### POST /api/compliance/incidents/:id/escalate
Escalate incident

**Permissions:** owner, admin, manager

**Request Body:**
```json
{
  "escalation_reason": "Requires immediate attention"
}
```

**Response:** `200 OK`

---

## 7. Reports Routes (`/api/reports`)

### GET /api/reports/occupancy
Occupancy report

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "report": [
    {
      "property_id": "uuid",
      "property_name": "Main House",
      "total_beds": 24,
      "occupied_beds": 20,
      "occupancy_rate": "83.33",
      "rooms": [...]
    }
  ]
}
```

---

### GET /api/reports/outcomes
Outcomes report

**Response:** `200 OK`
```json
{
  "outcomes": [...]
}
```

---

### GET /api/reports/incidents
Incidents summary

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "summary": {
    "total": 45,
    "by_severity": { "low": 20, "medium": 15, "high": 8, "critical": 2 },
    "by_status": { "reported": 5, "investigating": 10, "resolved": 25, "escalated": 5 }
  },
  "incidents": [...]
}
```

---

### GET /api/reports/financials
Financial report

**Response:** `200 OK`
```json
{
  "financials": [...]
}
```

---

### POST /api/reports/generate
Generate custom report

**Request Body:**
```json
{
  "reportType": "custom",
  "parameters": { ... }
}
```

**Response:** `200 OK`

---

## 8. Billing Routes (`/api/billing`)

### GET /api/billing/subscription
Current subscription details

**Response:** `200 OK`
```json
{
  "subscription": {
    "subscription_tier": "professional",
    "subscription_status": "active",
    "stripe_customer_id": "cus_...",
    "stripe_subscription_id": "sub_...",
    "trial_ends_at": "2024-02-01T00:00:00Z"
  }
}
```

---

### POST /api/billing/create-checkout
Create Stripe checkout session

**Permissions:** owner, admin

**Request Body:**
```json
{
  "priceId": "price_...",
  "successUrl": "https://app.example.com/success",
  "cancelUrl": "https://app.example.com/cancel"
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### POST /api/billing/create-portal
Create Stripe portal session

**Permissions:** owner, admin

**Request Body:**
```json
{
  "returnUrl": "https://app.example.com/billing"
}
```

**Response:** `200 OK`
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

### GET /api/billing/invoices
Invoice history

**Response:** `200 OK`
```json
{
  "invoices": [...]
}
```

---

### GET /api/billing/usage
Current usage metrics

**Response:** `200 OK`
```json
{
  "usage": {
    "residents": 45,
    "properties": 5,
    "staff": 12
  }
}
```

---

## 9. Users Routes (`/api/users`)

### GET /api/users
List organization users

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "user_metadata": { "name": "John Doe" },
      "role": "staff",
      "status": "active",
      "joined_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/users/invite
Invite team member

**Permissions:** owner, admin

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "staff"
}
```

**Response:** `201 Created`

---

### PATCH /api/users/:id
Update user

**Permissions:** owner, admin

**Request Body:** User updates

**Response:** `200 OK`

---

### PATCH /api/users/:id/role
Change user role

**Permissions:** owner, admin

**Request Body:**
```json
{
  "role": "manager"
}
```

**Response:** `200 OK`

---

### DELETE /api/users/:id
Deactivate user

**Permissions:** owner, admin

**Response:** `200 OK`
```json
{
  "message": "User deactivated successfully"
}
```

---

## 10. Organizations Routes (`/api/organizations`)

### GET /api/organizations/current
Get current organization

**Response:** `200 OK`
```json
{
  "organization": {
    "id": "uuid",
    "name": "Example Housing Association",
    "display_name": "Example Housing",
    "organization_type": "housing_association",
    "subscription_tier": "professional",
    "subscription_status": "active",
    ...
  }
}
```

---

### PATCH /api/organizations/:id
Update organization settings

**Permissions:** owner, admin

**Request Body:** Organization updates

**Response:** `200 OK`

---

## Role-Based Access Control

### Role Hierarchy

1. **owner** - Full access to everything
2. **admin** - Full access except billing and organization deletion
3. **manager** - Can manage residents, properties, and staff members
4. **staff** - Can view and update residents, create incidents and support plans
5. **viewer** - Read-only access to most data

### Permission Matrix

| Route | Owner | Admin | Manager | Staff | Viewer |
|-------|-------|-------|---------|-------|--------|
| Create Resident | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Resident | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Resident | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Residents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Billing | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Report Incidents | ✅ | ✅ | ✅ | ✅ | ❌ |
| Escalate Incidents | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes

- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions or wrong organization
- `404 Not Found` - Resource does not exist
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- Authentication endpoints: 10 requests per minute
- All other endpoints: 100 requests per minute per user

---

## Organization Isolation

All data queries automatically filter by the user's organization. This is enforced at the middleware level using `getUserOrganization()` middleware which:

1. Extracts user ID from JWT token
2. Looks up user's active organization
3. Attaches `organizationId` to the request object
4. All database queries use this `organizationId` for filtering

**Security**: Users can ONLY access data from their own organization. Cross-organization data access is prevented at the API level.

---

## Best Practices

1. **Always include error handling** in your client code
2. **Store tokens securely** (use httpOnly cookies in production)
3. **Refresh tokens** before they expire
4. **Implement pagination** for list endpoints
5. **Use filters** to reduce data transfer
6. **Validate input** on the client side before sending requests
7. **Handle 401 errors** by redirecting to login

---

## Example Usage (JavaScript/Fetch)

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { session } = await loginResponse.json();

// Store token
localStorage.setItem('access_token', session.access_token);

// Authenticated request
const residentsResponse = await fetch('/api/residents?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
const { residents, pagination } = await residentsResponse.json();
```

---

**API Version**: 1.0.0
**Last Updated**: December 2, 2024
**Status**: Production Ready
