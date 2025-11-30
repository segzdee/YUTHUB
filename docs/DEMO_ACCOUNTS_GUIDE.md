# YUTHUB Demo Accounts - Quick Reference Guide

## Overview

Comprehensive demo accounts for testing authentication, authorization, features, and subscription tiers in the YUTHUB platform.

---

## 🚀 Quick Setup

### Create Demo Accounts

```bash
npm run create:demo
```

**This creates:**
- 8 test accounts with different roles and permissions
- 4 organizations with different subscription tiers
- Sample data (properties, residents, staff)
- Complete subscription setup for each tier

**Duration:** ~30 seconds

---

## 📋 Demo Account Credentials

### Admin & Management Accounts

| Email | Password | Role | Organization | Access Level |
|-------|----------|------|--------------|--------------|
| **demo.admin@yuthub.com** | Demo2025!Admin | Admin | Demo Housing Association | Full admin access |
| **demo.manager@yuthub.com** | Demo2025!Manager | Manager | Demo Housing Association | Manage residents & staff |
| **platform.admin@yuthub.com** | Platform2025!Admin | Platform Admin | YUTHUB Platform | Full system access |

### Staff & Limited Access

| Email | Password | Role | Organization | Access Level |
|-------|----------|------|--------------|--------------|
| **demo.staff@yuthub.com** | Demo2025!Staff | Staff | Demo Housing Association | Limited permissions |
| **demo.viewer@yuthub.com** | Demo2025!Viewer | Viewer | Demo Housing Association | Read-only access |

### Subscription Tier Testing

| Email | Password | Tier | Billing | Organization |
|-------|----------|------|---------|--------------|
| **demo.starter@yuthub.com** | Demo2025!Starter | Starter | Monthly | Small Housing Charity |
| **demo.enterprise@yuthub.com** | Demo2025!Enterprise | Enterprise | Annual | Large Housing Network |
| **demo.trial@yuthub.com** | Demo2025!Trial | Professional | Trial | Trial Organization |

---

## 🔐 Password Pattern

All demo accounts follow this pattern:
```
Demo2025!<Role>
```

Examples:
- Admin: `Demo2025!Admin`
- Manager: `Demo2025!Manager`
- Starter: `Demo2025!Starter`
- Platform Admin: `Platform2025!Admin`

---

## 🎯 Testing Scenarios

### 1. Authentication Testing

#### Basic Login
```
Email: demo.admin@yuthub.com
Password: Demo2025!Admin
Expected: Successful login, redirect to dashboard
```

#### Role-Based Access
```
Email: demo.viewer@yuthub.com
Password: Demo2025!Viewer
Expected: Limited UI, no edit/delete buttons
```

#### Platform Admin Access
```
Email: platform.admin@yuthub.com
Password: Platform2025!Admin
Expected: Access to platform admin panel
```

### 2. Authorization Testing

#### Permission Levels

| Action | Viewer | Staff | Manager | Admin | Platform Admin |
|--------|--------|-------|---------|-------|----------------|
| View residents | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add resident | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit resident | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete resident | ❌ | ❌ | ❌ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export data | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage staff | ❌ | ❌ | ✅ | ✅ | ✅ |
| Billing access | ❌ | ❌ | ❌ | ✅ | ✅ |
| Platform settings | ❌ | ❌ | ❌ | ❌ | ✅ |

### 3. Subscription Tier Testing

#### Starter Plan (demo.starter@yuthub.com)

**Limits:**
- 1 property maximum
- 10 residents maximum
- 5 staff maximum
- 10GB storage

**Features:**
- ✅ Core housing management
- ✅ Basic reporting
- ❌ Safeguarding module (blocked)
- ❌ Financial management (blocked)
- ❌ Crisis intervention (blocked)
- ❌ AI analytics (blocked)
- ❌ API access (blocked)

**Test:**
1. Login as demo.starter@yuthub.com
2. Try to create 2nd property → Should show limit error
3. Try to access Safeguarding → Should show upgrade prompt
4. View usage dashboard → Should show 1/1 properties used

#### Professional Plan (demo.admin@yuthub.com)

**Limits:**
- 5 properties maximum
- 25 residents maximum
- 15 staff maximum
- 50GB storage

**Features:**
- ✅ Core housing management
- ✅ Safeguarding module
- ✅ Financial management
- ✅ Advanced reporting
- ✅ Priority support
- ❌ Crisis intervention (blocked)
- ❌ AI analytics (blocked)
- ❌ API access (blocked)

**Test:**
1. Login as demo.admin@yuthub.com
2. Access Safeguarding module → Should work
3. Try to access AI Analytics → Should show upgrade prompt
4. View usage: 2/5 properties, 5/25 residents

#### Enterprise Plan (demo.enterprise@yuthub.com)

**Limits:**
- Unlimited everything

**Features:**
- ✅ All features unlocked
- ✅ Crisis intervention module
- ✅ AI-powered analytics
- ✅ API access
- ✅ Custom integrations
- ✅ Dedicated account manager

**Test:**
1. Login as demo.enterprise@yuthub.com
2. All modules accessible
3. No usage limit warnings
4. API documentation available

### 4. Trial Mode Testing

#### Trial Account (demo.trial@yuthub.com)

**Status:** In trial period (14 days remaining)

**Test:**
1. Login as demo.trial@yuthub.com
2. Should see trial banner with countdown
3. All Professional features accessible
4. Prompt to add payment method
5. Trial expires in 14 days → Subscription required

---

## 📊 Sample Data Included

### Organizations

1. **Demo Housing Association** (Professional, Monthly)
   - 2 properties
   - 5 residents
   - 3 staff members

2. **Small Housing Charity** (Starter, Monthly)
   - Empty (test creation limits)

3. **Large Housing Network** (Enterprise, Annual)
   - Empty (unlimited testing)

4. **Trial Organization** (Trial mode)
   - Empty (trial flow testing)

### Properties (Demo Housing Association)

1. **Main Street Hub**
   - Address: 123 Main Street, Manchester M1 1AA
   - Type: Supported Living
   - Capacity: 10
   - Current Occupancy: 5/10

2. **Riverside House**
   - Address: 45 River Road, Manchester M2 2BB
   - Type: Shared House
   - Capacity: 6
   - Current Occupancy: 4/6

### Residents (Demo Housing Association)

1. **James Wilson** (Male, 22)
   - Property: Main Street Hub
   - Move-in: Jan 2024
   - Status: Active

2. **Emily Brown** (Female, 21)
   - Property: Main Street Hub
   - Move-in: Feb 2024
   - Status: Active

3. **Mohammed Ahmed** (Male, 23)
   - Property: Main Street Hub
   - Move-in: Sep 2023
   - Status: Active

4. **Sophie Taylor** (Female, 20)
   - Property: Riverside House
   - Move-in: Mar 2024
   - Status: Active

5. **Daniel Garcia** (Male, 22)
   - Property: Riverside House
   - Move-in: Jan 2024
   - Status: Active

### Staff Members (Demo Housing Association)

1. **Sarah Johnson**
   - Role: Support Worker
   - Type: Full-time
   - Since: Jun 2023

2. **Michael Chen**
   - Role: Team Leader
   - Type: Full-time
   - Since: Mar 2022

3. **Lisa Patel**
   - Role: Support Worker
   - Type: Part-time
   - Since: Jan 2024

---

## 🧪 Test Cases

### Test Case 1: Login & Dashboard

**Account:** demo.admin@yuthub.com

**Steps:**
1. Navigate to login page
2. Enter email: demo.admin@yuthub.com
3. Enter password: Demo2025!Admin
4. Click "Sign In"

**Expected Result:**
- ✅ Successful authentication
- ✅ Redirect to dashboard
- ✅ See welcome message with user name
- ✅ See 2 properties listed
- ✅ See 5 residents count
- ✅ See subscription badge: Professional

### Test Case 2: Usage Limit Enforcement

**Account:** demo.starter@yuthub.com

**Steps:**
1. Login as demo.starter@yuthub.com
2. Navigate to Properties
3. Try to create new property

**Expected Result:**
- ❌ Error message: "Property limit reached"
- ❌ Current usage: 0/1 properties
- ✅ Upgrade prompt displayed
- ✅ Link to pricing page

### Test Case 3: Feature Gating

**Account:** demo.admin@yuthub.com

**Steps:**
1. Login as demo.admin@yuthub.com
2. Navigate to Safeguarding → Should work
3. Navigate to AI Analytics → Should be blocked

**Expected Result:**
- ✅ Safeguarding module accessible
- ❌ AI Analytics shows upgrade modal
- ✅ Modal shows "Enterprise" required
- ✅ Pricing comparison table

### Test Case 4: Multi-Tenant Isolation

**Test A:**
1. Login as demo.admin@yuthub.com
2. Note resident names (James, Emily, Mohammed, etc.)
3. Logout

**Test B:**
1. Login as demo.starter@yuthub.com
2. Navigate to Residents

**Expected Result:**
- ❌ Cannot see residents from other organization
- ✅ Empty residents list
- ✅ Only see own organization data

### Test Case 5: Role-Based Access

**Account:** demo.viewer@yuthub.com

**Steps:**
1. Login as demo.viewer@yuthub.com
2. Navigate to Residents page
3. Try to click "Add Resident" button

**Expected Result:**
- ✅ Can view resident list
- ❌ No "Add Resident" button visible
- ❌ No edit icons on resident cards
- ❌ No delete options
- ✅ Read-only mode

### Test Case 6: Trial Expiration Flow

**Account:** demo.trial@yuthub.com

**Steps:**
1. Login as demo.trial@yuthub.com
2. View trial banner
3. Click "Add Payment Method"

**Expected Result:**
- ✅ Trial banner shows "14 days remaining"
- ✅ All features accessible during trial
- ✅ Payment form displayed
- ✅ Can add card details
- ✅ Subscription continues after trial

---

## 🔧 Troubleshooting

### Issue: Demo accounts not working

**Solution:**
```bash
# Re-run the setup script
npm run create:demo
```

### Issue: "User already exists" error

**Behavior:** Script updates existing users instead of failing
- ✅ Organizations updated
- ✅ Subscriptions refreshed
- ✅ Sample data re-created

### Issue: Cannot login after creation

**Check:**
1. Verify Supabase credentials in .env
2. Check auth.users table has entries
3. Confirm email is verified (auto-confirmed by script)
4. Try password reset if needed

### Issue: No sample data visible

**Solution:**
```bash
# Re-run to regenerate sample data
npm run create:demo
```

### Issue: Subscription features not working

**Check:**
1. Verify subscription_tiers table has 6 records
2. Check organization_subscriptions table
3. Verify subscription status is 'active' or 'trialing'
4. Run database update:
   ```sql
   SELECT update_usage_counts('org-id-here');
   ```

---

## 📈 Testing Workflows

### Workflow 1: New User Onboarding

1. Login as demo.trial@yuthub.com (trial)
2. Explore dashboard
3. Create first property
4. Add first resident
5. View usage statistics
6. Trial reminder appears
7. Upgrade to paid plan

### Workflow 2: Daily Operations

1. Login as demo.admin@yuthub.com
2. Review dashboard metrics
3. Check recent activity
4. Add new resident
5. Update support plans
6. Generate reports
7. Review billing

### Workflow 3: Team Collaboration

1. Login as demo.manager@yuthub.com
2. Assign tasks to staff
3. Review resident progress
4. Approve staff time sheets
5. Logout

6. Login as demo.staff@yuthub.com
7. View assigned tasks
8. Update resident notes
9. Complete daily logs

### Workflow 4: Subscription Management

1. Login as demo.starter@yuthub.com
2. Hit usage limit
3. View upgrade options
4. Select Professional plan
5. Complete payment
6. Verify increased limits
7. Test new features

---

## 🎯 Feature Testing Checklist

### Authentication
- [ ] Email/password login
- [ ] Password validation
- [ ] Session persistence
- [ ] Logout
- [ ] Remember me
- [ ] Password reset (if implemented)

### Authorization
- [ ] Admin full access
- [ ] Manager limited access
- [ ] Staff restricted access
- [ ] Viewer read-only
- [ ] Platform admin system access

### Multi-Tenancy
- [ ] Data isolation between orgs
- [ ] No cross-tenant access
- [ ] Correct org in all queries
- [ ] Org switching (if implemented)

### Subscription Tiers
- [ ] Starter limits enforced (1/10)
- [ ] Professional limits enforced (5/25)
- [ ] Enterprise unlimited
- [ ] Feature gating works
- [ ] Upgrade prompts shown

### Usage Tracking
- [ ] Properties counted correctly
- [ ] Residents counted correctly
- [ ] Staff counted correctly
- [ ] Usage dashboard accurate
- [ ] Approaching limit warnings

### Feature Access
- [ ] Safeguarding (Pro+)
- [ ] Financial Management (Pro+)
- [ ] Crisis Intervention (Enterprise)
- [ ] AI Analytics (Enterprise)
- [ ] API Access (Enterprise)

---

## 💡 Tips & Best Practices

### For Development

1. **Reset Demo Data:** Re-run `npm run create:demo` anytime
2. **Test All Roles:** Switch between accounts to verify permissions
3. **Check Logs:** Monitor console for auth/permission errors
4. **Database Inspection:** Use Supabase dashboard to verify data

### For QA Testing

1. **Follow Test Cases:** Use provided test cases as baseline
2. **Document Issues:** Note any permission bypasses or data leaks
3. **Test Limits:** Try to exceed usage limits
4. **Boundary Testing:** Test edge cases (0 residents, max capacity, etc.)

### For Demo Presentations

1. **Start with Admin:** Show full feature set first
2. **Show Limitations:** Demo starter account hitting limits
3. **Demonstrate Value:** Show Enterprise unlimited features
4. **Trial Flow:** Walk through trial → paid conversion

---

## 📞 Support

If demo accounts are not working:

1. Check Supabase connection
2. Verify .env file has correct credentials
3. Re-run setup: `npm run create:demo`
4. Check database tables exist
5. Review migration status

**Database Tables Required:**
- auth.users
- organizations
- user_organizations
- subscription_tiers
- organization_subscriptions
- subscription_usage
- properties
- residents
- staff_members

---

## 🔄 Updating Demo Accounts

To refresh demo accounts with new data:

```bash
# This will update existing accounts and refresh sample data
npm run create:demo
```

**Safe to run multiple times** - Updates existing records instead of creating duplicates.

---

**Demo accounts are ready for comprehensive testing of authentication, authorization, features, and subscription tiers! 🎉**
