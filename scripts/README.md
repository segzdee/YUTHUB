# Database Validation & Audit Tools

This directory contains comprehensive database validation and audit tools for the YUTHUB housing management system.

## 🔍 Available Scripts

### 1. Database Structure Validation
**File**: `validate-database-structure.js`

Validates that all required database tables exist with proper structure:
- ✅ Core application tables (residents, properties, incidents, etc.)
- ✅ Platform admin tables (subscriptions, organizations, etc.)
- ✅ Authentication tables (users, sessions, tokens, etc.)
- ✅ Extended housing management tables
- ✅ Foreign key relationships
- ✅ Performance indexes
- ✅ Data integrity checks

```bash
# Run structure validation
node scripts/validate-database-structure.js
```

### 2. Database Security Validation
**File**: `validate-database-security.js`

Performs comprehensive security assessment:
- 🔒 SSL/TLS connection verification
- 🛡️ Row Level Security (RLS) policy checks
- 🔐 Authentication security measures
- 🛡️ Data protection compliance
- 🔗 Database constraints validation
- 💾 Backup and recovery security
- 📋 Audit logging capabilities

```bash
# Run security validation
node scripts/validate-database-security.js
```

### 3. Platform Admin Database Audit
**File**: `audit-platform-admin-db.ts`

Comprehensive audit of platform administration capabilities:
- 📊 Subscription management verification
- 🏢 Multi-tenant organization support
- 👤 Platform user access controls
- 📈 Usage tracking and analytics
- 💳 Billing and payment processing
- 🔍 Data aggregation capabilities

```bash
# Run platform admin audit
npx tsx scripts/audit-platform-admin-db.ts
```

### 4. Simple Platform Admin Audit
**File**: `simple-platform-admin-audit.ts`

Quick verification of platform admin functionality:
- ✅ Table existence checks
- ✅ Basic data validation
- ✅ Relationship testing
- ✅ Performance verification

```bash
# Run simple audit
npx tsx scripts/simple-platform-admin-audit.ts
```

## 📋 Prerequisites

Before running any validation scripts, ensure:

1. **Environment Variables Set**:
   ```bash
   export DATABASE_URL="your-database-connection-string"
   ```

2. **Dependencies Installed**:
   ```bash
   npm install
   ```

3. **Database Access**: Ensure your database is accessible and running

## 🎯 Validation Criteria

### Database Structure (validate-database-structure.js)
- **Core Tables**: 60+ tables across all categories
- **Column Requirements**: Minimum column counts per table
- **Relationships**: 10+ critical foreign key relationships
- **Indexes**: 8+ performance-critical indexes
- **Data Integrity**: Basic query functionality

### Security Assessment (validate-database-security.js)
- **Connection Security**: SSL/TLS encryption
- **Access Control**: Row Level Security policies
- **Authentication**: MFA, session management, API tokens
- **Data Protection**: Sensitive field identification and protection
- **Constraints**: NOT NULL, UNIQUE, and FOREIGN KEY constraints
- **Audit**: Comprehensive change tracking
- **Backup**: Recovery and retention policies

### Platform Admin (audit-platform-admin-db.ts)
- **Subscription Management**: Plans, features, billing
- **Organization Management**: Multi-tenant isolation
- **User Management**: Platform admin access controls
- **Analytics**: Revenue, usage, and performance metrics
- **Integration**: Payment processing and external systems

## 📊 Scoring System

Each validation script provides a percentage score based on:

### Excellent (90-100%)
- ✅ All critical requirements met
- ✅ Production-ready configuration
- ✅ Best practices implemented

### Very Good (80-89%)
- ✅ Most requirements met
- ⚠️ Minor optimizations needed
- ✅ Production-ready with improvements

### Good (70-79%)
- ⚠️ Some requirements met
- ⚠️ Improvements needed before production
- ⚠️ Security or performance gaps

### Needs Work (<70%)
- ❌ Critical requirements missing
- ❌ Significant improvements required
- ❌ Not production-ready

## 🔧 Common Issues & Solutions

### Issue: `DATABASE_URL not configured`
**Solution**: Set your database connection string
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Issue: `Table not found errors`
**Solution**: Ensure database schema is deployed
```bash
npx drizzle-kit push
```

### Issue: `Permission denied`
**Solution**: Verify database user has required permissions
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
```

### Issue: `Missing indexes`
**Solution**: Run index creation scripts or update schema
```sql
CREATE INDEX CONCURRENTLY idx_residents_property_id ON residents(property_id);
```

### Issue: `RLS policies not found`
**Solution**: Implement Row Level Security
```sql
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON residents 
FOR ALL TO authenticated 
USING (organization_id = current_setting('app.current_org')::int);
```

## 📈 Monitoring & Maintenance

### Regular Validation Schedule
- **Daily**: Run simple audit for basic health checks
- **Weekly**: Run structure validation for schema changes
- **Monthly**: Run security validation for compliance
- **Quarterly**: Run comprehensive platform admin audit

### Automated Integration
Add to CI/CD pipeline:
```yaml
# Example GitHub Actions
- name: Validate Database Structure
  run: node scripts/validate-database-structure.js
  
- name: Validate Database Security
  run: node scripts/validate-database-security.js
```

### Production Monitoring
- Set up alerts for validation failures
- Monitor performance metrics
- Track security compliance scores
- Automate backup verification

## 🔗 Related Documentation

- [Comprehensive Database Audit Report](../COMPREHENSIVE_DATABASE_AUDIT_REPORT.md)
- [Database Security Audit Report](../DATABASE_SECURITY_AUDIT_REPORT.md)
- [Connection Pooling Optimization](../CONNECTION_POOLING_OPTIMIZATION.md)
- [Schema Documentation](../shared/schema.ts)

## 🆘 Support

If validation scripts fail or you encounter issues:

1. **Check Database Connectivity**: Ensure DATABASE_URL is correct
2. **Verify Permissions**: Database user needs read access to information_schema
3. **Review Logs**: Check console output for specific error messages
4. **Update Schema**: Ensure latest schema is deployed
5. **Contact Support**: Create an issue with validation output

## 🔄 Updates

These validation scripts are versioned with the application:
- Update scripts when schema changes
- Test new validations in development
- Document any new requirements
- Maintain backward compatibility where possible
