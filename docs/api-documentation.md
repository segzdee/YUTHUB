# YUTHUB API Documentation

## Overview

The YUTHUB API provides comprehensive endpoints for managing youth housing operations, including property management, resident tracking, incident reporting, and financial operations.

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://www.yuthub.com/api`

## Authentication

All API endpoints require authentication using session-based authentication with Replit OIDC.

### Authentication Headers

```
Cookie: connect.sid=<session-id>
```

## Rate Limiting

- General API endpoints: 100 requests per 15 minutes
- Create operations: 5 requests per minute
- Report generation: 3 requests per 5 minutes
- Sensitive operations: 10 requests per 15 minutes

## Health Check Endpoints

### GET /health

Returns overall system health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600.5,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45
    },
    "memory": {
      "status": "healthy",
      "usage": 65.2,
      "limit": 536870912
    },
    "disk": {
      "status": "healthy"
    }
  }
}
```

### GET /health/ready

Readiness check for load balancers.

### GET /health/live

Liveness check for container orchestration.

## Authentication Endpoints

### GET /api/auth/user

Returns current authenticated user information.

**Response:**

```json
{
  "id": "user123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "staff",
  "department": "housing"
}
```

### POST /api/auth/setup-mfa

Setup Multi-Factor Authentication for user account.

**Request:**

```json
{
  "enabled": true
}
```

**Response:**

```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEHPK3PXP",
  "backupCodes": ["12345678", "87654321"]
}
```

## Properties Endpoints

### GET /api/properties

Retrieve all properties.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Sunrise House",
    "address": "123 Main St, City, State 12345",
    "propertyType": "shared_housing",
    "totalUnits": 20,
    "occupiedUnits": 15,
    "status": "active",
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/properties

Create a new property.

**Request:**

```json
{
  "name": "New Property",
  "address": "456 Oak Ave, City, State 12345",
  "propertyType": "studio_units",
  "totalUnits": 10,
  "status": "active"
}
```

**Response:**

```json
{
  "id": 2,
  "name": "New Property",
  "address": "456 Oak Ave, City, State 12345",
  "propertyType": "studio_units",
  "totalUnits": 10,
  "occupiedUnits": 0,
  "status": "active",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### PUT /api/properties/:id

Update an existing property.

### DELETE /api/properties/:id

Delete a property (admin only).

## Residents Endpoints

### GET /api/residents

Retrieve all residents.

**Query Parameters:**

- `propertyId`: Filter by property ID
- `status`: Filter by status (active, moved_out, at_risk)
- `riskLevel`: Filter by risk level (low, medium, high)

**Response:**

```json
[
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1995-05-15",
    "propertyId": 1,
    "unitNumber": "A101",
    "moveInDate": "2024-01-15",
    "keyWorkerId": "worker123",
    "independenceLevel": 3,
    "riskLevel": "low",
    "status": "active"
  }
]
```

### POST /api/residents

Create a new resident record.

**Request:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1996-03-20",
  "propertyId": 1,
  "unitNumber": "B205",
  "moveInDate": "2025-01-15",
  "keyWorkerId": "worker123"
}
```

## Incidents Endpoints

### GET /api/incidents

Retrieve all incidents.

**Query Parameters:**

- `propertyId`: Filter by property
- `residentId`: Filter by resident
- `status`: Filter by status
- `severity`: Filter by severity level
- `incidentType`: Filter by type

### POST /api/incidents

Create a new incident report.

**Request:**

```json
{
  "propertyId": 1,
  "residentId": 5,
  "incidentType": "behavioral",
  "severity": "medium",
  "title": "Noise Complaint",
  "description": "Resident reported excessive noise from neighboring unit."
}
```

### PUT /api/incidents/:id

Update incident status or details.

## Financial Records Endpoints

### GET /api/financial-records

Retrieve financial records.

**Query Parameters:**

- `propertyId`: Filter by property
- `residentId`: Filter by resident
- `recordType`: Filter by type (income, expense, rent, etc.)
- `status`: Filter by status

### POST /api/financial-records

Create a new financial record.

**Request:**

```json
{
  "propertyId": 1,
  "residentId": 5,
  "recordType": "rent",
  "category": "monthly_rent",
  "amount": 800.0,
  "description": "Monthly rent payment",
  "date": "2025-01-15",
  "dueDate": "2025-01-31"
}
```

## Dashboard Endpoints

### GET /api/dashboard/metrics

Retrieve dashboard metrics.

**Response:**

```json
{
  "totalProperties": 5,
  "currentResidents": 45,
  "occupancyRate": 85.5,
  "activeIncidents": 3,
  "pendingMaintenance": 7,
  "monthlyRevenue": 35000.0,
  "overduePayments": 2
}
```

## Reports Endpoints

### POST /api/reports/generate

Generate various reports.

**Request:**

```json
{
  "type": "occupancy",
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "properties": [1, 2, 3],
  "filters": {
    "includeVacant": true,
    "groupByProperty": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "received": "invalid-email"
    }
  ],
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 403 Forbidden

```json
{
  "error": "Insufficient permissions",
  "message": "You don't have permission to access this resource",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found",
  "message": "The requested resource could not be found",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal Server Error",
  "status": 500,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## WebSocket API

The YUTHUB API includes WebSocket support for real-time updates.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');
```

### Message Types

- `metric_change`: Dashboard metrics updated
- `incident_alert`: High-priority incident reported
- `maintenance_notification`: Maintenance request requires attention
- `notification`: General system notification

### Example Message

```json
{
  "type": "incident_alert",
  "data": {
    "incidentId": 123,
    "title": "Emergency Maintenance Required",
    "severity": "high",
    "message": "Heating system failure in Building A"
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

## Security

### Input Validation

- All input is validated using Zod schemas
- HTML/XSS sanitization applied to all string inputs
- SQL injection prevention through parameterized queries

### Rate Limiting

- Multiple rate limiting tiers based on endpoint sensitivity
- IP-based rate limiting with configurable windows
- Graceful degradation with proper error messages

### Authentication & Authorization

- Session-based authentication with secure cookies
- Role-based access control (RBAC)
- Multi-factor authentication support
- Account lockout protection

### Audit Logging

- All security events are logged
- Resource access tracking
- Failed authentication attempts monitoring
- Permission changes auditing

## Best Practices

### Request/Response

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Include appropriate headers
- Handle errors gracefully
- Implement retry logic for rate-limited requests

### Performance

- Use pagination for large datasets
- Implement caching where appropriate
- Monitor response times
- Optimize database queries

### Security

- Always use HTTPS in production
- Validate all inputs
- Follow principle of least privilege
- Regularly rotate secrets and tokens
