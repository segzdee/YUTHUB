# 🚀 Next Steps - Backend Infrastructure Setup

## Immediate Actions Required

### 1. Install New Dependencies

```bash
npm install socket.io socket.io-client node-cron
```

**New packages added**:
- `socket.io@^4.8.1` - WebSocket server
- `socket.io-client@^4.8.1` - WebSocket client for React
- `node-cron@^3.0.3` - Background job scheduler

---

### 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Webhook Secret (get from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL for CORS and redirects
VITE_APP_URL=http://localhost:5000
```

---

### 3. Configure Stripe Webhook Endpoint

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

---

### 4. Test the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# You should see:
# ✅ WebSocket server initialized
# ✅ Scheduled jobs initialized successfully
# ✅ Server running on port 5000
```

---

### 5. Test WebSocket Connection

**In browser console:**

```javascript
// Test connection
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token_here' }
});

socket.on('connected', (data) => {
  console.log('WebSocket connected:', data);
});

socket.on('resident:created', (event) => {
  console.log('Resident created event:', event);
});
```

---

### 6. Test Stripe Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

---

### 7. Verify Background Jobs

Background jobs will run automatically on schedule:

- **Daily 9:00 AM**: Check overdue reviews and expiring documents
- **Hourly**: Auto-escalate incidents, refresh metrics
- **Weekly Monday 6:00 AM**: Generate usage snapshots
- **Monthly 1st**: Cleanup old audit logs

**Check logs:**

```bash
# Watch for cron job execution
tail -f logs/server.log | grep CRON
```

---

### 8. Test API with Validation

```bash
# Test validation error
curl -X POST http://localhost:5000/api/residents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "",
    "last_name": "Smith",
    "date_of_birth": "invalid-date"
  }'

# Expected response:
# {
#   "success": false,
#   "error": {
#     "code": "VALIDATION_ERROR",
#     "message": "Validation failed",
#     "details": [
#       { "field": "first_name", "message": "First name is required" },
#       { "field": "date_of_birth", "message": "Invalid date format (YYYY-MM-DD)" }
#     ]
#   }
# }
```

---

### 9. Monitor Audit Logs

```sql
-- Query recent audit logs
SELECT * FROM audit_logs
WHERE organization_id = 'your-org-id'
ORDER BY created_at DESC
LIMIT 10;

-- Check specific table changes
SELECT * FROM audit_logs
WHERE table_name = 'residents'
AND action = 'UPDATE'
ORDER BY created_at DESC;
```

---

### 10. Enable Browser Notifications (Frontend)

In your main App component:

```typescript
import { requestNotificationPermission } from '@/hooks/useWebSocket';

// Request permission on mount
useEffect(() => {
  requestNotificationPermission();
}, []);

// Use WebSocket hook
const { connected } = useWebSocket();
```

---

## Troubleshooting

### Issue: Socket.IO not connecting

**Solution**:
1. Check JWT token is valid
2. Verify CORS settings in `server/websocket.js`
3. Check browser console for errors
4. Ensure firewall allows WebSocket connections

---

### Issue: Webhooks failing signature verification

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
2. Use raw body parser: `express.raw({ type: 'application/json' })`
3. Check Stripe CLI is forwarding correctly
4. Verify webhook secret matches Stripe dashboard

---

### Issue: Background jobs not running

**Solution**:
1. Check server logs for cron initialization
2. Verify timezone is set correctly (`Europe/London`)
3. Check for errors in job functions
4. Ensure node-cron is installed

---

### Issue: RLS policies blocking queries

**Solution**:
1. Verify user has active organization
2. Check user's role has required permissions
3. Query `user_organizations` table to verify status
4. Check RLS helper functions are working

---

## Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set (`.env`)
- [ ] Stripe webhook endpoint configured
- [ ] Server starts without errors
- [ ] WebSocket connects successfully
- [ ] Background jobs initialize
- [ ] Validation middleware working
- [ ] Audit logs being created
- [ ] RLS policies enforcing permissions
- [ ] Real-time events emitting
- [ ] Browser notifications working

---

## Production Deployment

### Additional Steps for Production:

1. **Set production environment variables**
2. **Configure SSL/TLS for WebSocket**
3. **Set up log rotation** for audit logs
4. **Configure rate limiting** for webhooks
5. **Set up monitoring** for background jobs
6. **Configure backup** for audit logs
7. **Test failover** for WebSocket connections
8. **Monitor webhook delivery** in Stripe
9. **Set up alerts** for failed jobs
10. **Review and tune** RLS policy performance

---

## Support & Documentation

- **API Documentation**: `API_ROUTES_DOCUMENTATION.md`
- **Backend Infrastructure**: `BACKEND_INFRASTRUCTURE_COMPLETE.md`
- **RLS & Audit**: Database migration applied
- **WebSocket Events**: See `server/websocket.js`
- **Background Jobs**: See `server/jobs/scheduler.js`
- **Validation Schemas**: See `server/validators/schemas.js`

---

**Status**: Ready for testing after `npm install`
**Last Updated**: December 2, 2024
