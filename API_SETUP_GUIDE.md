# YUTHUB API Server - Setup & Configuration Guide

## 🚀 Quick Start

The application now has a **fully functional backend API server** with authentication, CRUD operations, and WebSocket support.

### Starting the Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Start production server
npm start
```

The server will start on **http://localhost:5000** with the following services:
- **REST API**: http://localhost:5000/api
- **WebSocket**: ws://localhost:5000/ws
- **Frontend**: http://localhost:5000 (after build)

---

## 📋 What's Been Implemented

### ✅ Priority 1 - Critical Features (COMPLETED)

1. **Express API Server** - Full-featured Node.js/Express backend
2. **Authentication Endpoints** - Complete auth system with Supabase
3. **Session Management** - Token-based authentication
4. **CRUD Endpoints** - Residents, Properties, and more
5. **Stripe Configuration** - Optional payment processing setup
6. **WebSocket Server** - Real-time updates support
7. **Security Middleware** - Rate limiting, CORS, Helmet

---

## 🔐 Authentication System

### Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "My Organization"
}
```

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/user
Authorization: Bearer <your-token>
```

#### Sign Out
```http
POST /api/auth/signout
Authorization: Bearer <your-token>
```

#### Password Reset
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

---

## 📊 Data Endpoints

### Residents API

All resident endpoints require authentication.

```http
# Get all residents
GET /api/residents
Authorization: Bearer <your-token>

# Get single resident
GET /api/residents/:id
Authorization: Bearer <your-token>

# Create resident
POST /api/residents
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "date_of_birth": "2005-06-15",
  "gender": "female",
  "contact_email": "jane@example.com",
  "status": "active"
}

# Update resident
PUT /api/residents/:id
Authorization: Bearer <your-token>
Content-Type: application/json

# Delete resident
DELETE /api/residents/:id
Authorization: Bearer <your-token>
```

### Properties API

```http
# Get all properties
GET /api/properties
Authorization: Bearer <your-token>

# Get single property
GET /api/properties/:id
Authorization: Bearer <your-token>

# Create property
POST /api/properties
Authorization: Bearer <your-token>

# Update property
PUT /api/properties/:id
Authorization: Bearer <your-token>

# Delete property
DELETE /api/properties/:id
Authorization: Bearer <your-token>
```

---

## 💳 Stripe Payment Integration (Optional)

Stripe is **disabled by default**. To enable:

### 1. Get Stripe API Keys

Visit https://dashboard.stripe.com/apikeys and get your keys.

### 2. Update .env File

```env
ENABLE_STRIPE_PAYMENTS=true
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 3. Restart Server

```bash
npm start
```

### Stripe Endpoints

```http
# Get subscription plans
GET /api/stripe/plans

# Get current subscription
GET /api/stripe/subscription
Authorization: Bearer <your-token>

# Create checkout session
POST /api/stripe/create-checkout
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "planId": "professional",
  "billingCycle": "monthly"
}
```

---

## 🔌 WebSocket Connection

### Client Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

// Authenticate
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'residents'
}));
```

### Message Types

- `welcome` - Initial connection message
- `authenticated` - Authentication successful
- `subscribed` - Successfully subscribed to channel
- `heartbeat` - Keep-alive ping
- `error` - Error messages

---

## 🔒 Security Features

### Implemented

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ JWT token authentication
- ✅ Row Level Security (RLS) via Supabase
- ✅ Organization-based data isolation
- ✅ Input validation
- ✅ Error handling middleware

### Environment Variables

```env
# Required
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Recommended
PORT=5000
NODE_ENV=production
APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

---

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-02T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "features": {
    "websockets": true,
    "stripe": false
  }
}
```

### Test Authentication

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Org"
  }'

# Sign in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## 🐛 Troubleshooting

### Server won't start

1. Check if port 5000 is available:
   ```bash
   lsof -i :5000
   ```

2. Verify environment variables:
   ```bash
   cat .env
   ```

3. Check Supabase connection:
   ```bash
   curl https://rjvpfprlvjdrcgtegohv.supabase.co
   ```

### Authentication fails

1. Verify Supabase keys are correct
2. Check if user exists in Supabase dashboard
3. Ensure RLS policies are enabled

### API returns 403 Forbidden

- User needs to be associated with an organization
- Check `user_organizations` table in Supabase

### WebSocket won't connect

1. Ensure `ENABLE_WEBSOCKETS=true` in .env
2. Check WebSocket path: `ws://localhost:5000/ws`
3. Authenticate before subscribing

---

## 📦 Project Structure

```
project/
├── server/
│   ├── config/
│   │   └── supabase.js       # Supabase client setup
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── security.js        # Security middleware
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── residents.js       # Residents CRUD
│   │   ├── properties.js      # Properties CRUD
│   │   ├── stripe.js          # Payment endpoints
│   │   └── index.js           # Route aggregator
│   ├── websocket.js           # WebSocket server
│   └── index.js               # Main server file
├── client/                     # React frontend
├── .env                        # Environment config
└── server.js                   # Server entry point
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
APP_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## ✅ Implementation Status

| Feature | Status |
|---------|--------|
| Express API Server | ✅ Complete |
| Authentication | ✅ Complete |
| Residents CRUD | ✅ Complete |
| Properties CRUD | ✅ Complete |
| WebSocket Server | ✅ Complete |
| Rate Limiting | ✅ Complete |
| Security Headers | ✅ Complete |
| Stripe Integration | ⚠️ Optional (Disabled by default) |
| Email Service | ⚠️ Optional (Not configured) |
| File Uploads | ⏳ Pending |
| Additional CRUD | ⏳ Can be added as needed |

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Verify environment configuration
4. Check Supabase dashboard for data/RLS issues

---

## 🎉 Success!

Your backend API server is now fully operational with:
- ✅ Complete authentication system
- ✅ CRUD operations for residents and properties
- ✅ Real-time WebSocket connections
- ✅ Production-ready security
- ✅ Optional Stripe payment processing

The application is now **functional and ready for use**!
