# Demo Account Setup Instructions

## Prerequisites

To create demo accounts, you need the **Supabase Service Role Key** (with admin privileges).

---

## 🔑 Getting Your Service Role Key

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **rjvpfprlvjdrcgtegohv**

### Step 2: Get Service Role Key

1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** under Project Settings
3. Scroll to **Project API keys** section
4. Find **service_role** key (starts with `eyJhbGc...`)
5. Click the **Reveal** button
6. Copy the entire key

**⚠️ Important:** This key has admin privileges - keep it secure!

---

## 📝 Add to .env File

Add this line to your `.env` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**Your .env should have:**
```bash
VITE_SUPABASE_URL=https://rjvpfprlvjdrcgtegohv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← ADD THIS
```

---

## 🚀 Run Demo Account Creation

Once you've added the service role key:

```bash
npm run create:demo
```

**This will create:**
- ✅ 8 test accounts (admin, manager, staff, viewer, etc.)
- ✅ 4 organizations with different subscription tiers
- ✅ Sample data (properties, residents, staff)
- ✅ Subscriptions configured for each tier
- ✅ Usage tracking initialized

**Duration:** ~30 seconds

---

## 📋 What Gets Created

### Demo Accounts (8)

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| demo.admin@yuthub.com | Demo2025!Admin | Admin | Full access testing |
| demo.manager@yuthub.com | Demo2025!Manager | Manager | Management testing |
| demo.staff@yuthub.com | Demo2025!Staff | Staff | Staff access testing |
| demo.viewer@yuthub.com | Demo2025!Viewer | Viewer | Read-only testing |
| demo.starter@yuthub.com | Demo2025!Starter | Admin | Starter tier (limits) |
| demo.enterprise@yuthub.com | Demo2025!Enterprise | Admin | Enterprise (unlimited) |
| demo.trial@yuthub.com | Demo2025!Trial | Admin | Trial mode testing |
| platform.admin@yuthub.com | Platform2025!Admin | Platform Admin | Platform management |

### Organizations (4)

1. **Demo Housing Association** (Professional, Monthly)
   - 2 properties
   - 5 residents
   - 3 staff members

2. **Small Housing Charity** (Starter, Monthly)
   - Empty (test limits)

3. **Large Housing Network** (Enterprise, Annual)
   - Empty (unlimited)

4. **Trial Organization** (Trial mode)
   - Empty (trial flow)

### Sample Data

**Properties:**
- Main Street Hub (10 capacity, 5 occupied)
- Riverside House (6 capacity, 4 occupied)

**Residents:**
- James Wilson (22, Male)
- Emily Brown (21, Female)
- Mohammed Ahmed (23, Male)
- Sophie Taylor (20, Female)
- Daniel Garcia (22, Male)

**Staff:**
- Sarah Johnson (Support Worker)
- Michael Chen (Team Leader)
- Lisa Patel (Support Worker)

---

## ✅ After Creation

### Test Accounts

**Login and test:**

```
Full Admin Access:
Email: demo.admin@yuthub.com
Password: Demo2025!Admin
→ See 2 properties, 5 residents, Professional tier

Usage Limit Testing:
Email: demo.starter@yuthub.com
Password: Demo2025!Starter
→ 0/1 properties, 0/10 residents, hit limits

All Features:
Email: demo.enterprise@yuthub.com
Password: Demo2025!Enterprise
→ Unlimited, all features unlocked
```

### Verify Creation

Check in Supabase Dashboard:

1. **Authentication → Users**
   - Should see 8 demo users

2. **Table Editor → organizations**
   - Should see 4 organizations

3. **Table Editor → organization_subscriptions**
   - Should see 4 active subscriptions

4. **Table Editor → properties**
   - Should see 2 properties

5. **Table Editor → residents**
   - Should see 5 residents

---

## 🔧 Troubleshooting

### Issue: Service role key invalid

**Solution:**
1. Double-check you copied the entire key
2. Make sure it's the **service_role** key (not anon key)
3. No spaces or line breaks in the key
4. Key should start with `eyJhbGc...`

### Issue: Script fails with "User already exists"

**Behavior:** This is normal! Script updates existing accounts.
- ✅ Safe to run multiple times
- ✅ Updates subscriptions
- ✅ Refreshes sample data

### Issue: No sample data visible

**Solution:**
```bash
# Re-run the script
npm run create:demo
```

### Issue: Can't login with demo accounts

**Check:**
1. Service role key is correct in .env
2. Script completed successfully
3. Check auth.users table in Supabase
4. Verify email is demo.admin@yuthub.com (not admin@demo.com)

---

## 🔐 Security Note

**Never commit the service role key to git!**

- ✅ It's in .gitignore
- ✅ Only store in .env locally
- ✅ Use environment variables in production
- ❌ Don't share in public repos
- ❌ Don't expose in client-side code

---

## 📖 Full Documentation

See `/docs/DEMO_ACCOUNTS_GUIDE.md` for:
- Complete test scenarios
- Feature testing checklist
- Role-based access testing
- Subscription tier testing
- Troubleshooting guide

---

## 🎯 Quick Start

```bash
# 1. Add service role key to .env
echo "SUPABASE_SERVICE_ROLE_KEY=your_key_here" >> .env

# 2. Create demo accounts
npm run create:demo

# 3. Login and test
# Email: demo.admin@yuthub.com
# Password: Demo2025!Admin
```

**That's it! 🎉**

---

## Alternative: Manual Setup via Supabase Dashboard

If you prefer not to use the service role key, you can create accounts manually:

### 1. Create User (Authentication → Users → Add User)

```
Email: demo.admin@yuthub.com
Password: Demo2025!Admin
Auto Confirm: Yes
```

### 2. Create Organization (Table Editor → organizations)

```sql
INSERT INTO organizations (name, email, type, status)
VALUES ('Demo Housing Association', 'demo.admin@yuthub.com', 'housing_provider', 'active');
```

### 3. Link User to Org (Table Editor → user_organizations)

```sql
INSERT INTO user_organizations (user_id, organization_id, role, status)
VALUES ('user-id-from-auth', 'org-id-from-above', 'admin', 'active');
```

### 4. Create Subscription (Table Editor → organization_subscriptions)

```sql
INSERT INTO organization_subscriptions (
  organization_id, tier_id, status, billing_period
)
VALUES (
  'org-id-here',
  (SELECT id FROM subscription_tiers WHERE tier_name = 'professional' AND billing_period = 'month'),
  'active',
  'month'
);
```

**But the automated script is much easier! 😊**

---

**For questions or issues, see `/docs/DEMO_ACCOUNTS_GUIDE.md`**
