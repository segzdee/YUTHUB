# Unused Modules - Analysis & Decision

## Summary
Several page components exist in the codebase that are not currently routed or integrated into the main application. This document analyzes each and provides a recommendation.

## Modules Analysis

### 1. Crisis.tsx
**Purpose**: Emergency contact management and crisis response system
**Features**:
- Emergency contact directory (999, crisis hotlines, on-call managers)
- Active call tracking
- Crisis protocol display
- 24/7 availability information

**Status**: KEEP - Potentially useful feature
**Recommendation**: This is a valuable safeguarding feature that should be integrated into the Compliance module
**Integration Path**: Add as `/app/dashboard/compliance/crisis` route

### 2. Housing.tsx
**Purpose**: Comprehensive housing management
**Features**:
- Property listing and management
- Resident tracking per property
- Maintenance request management
- Real-time updates via WebSocket

**Status**: REDUNDANT - Functionality exists in dashboard modules
**Recommendation**: REMOVE - Features already covered by:
- `/app/dashboard/properties` (property management)
- `/app/dashboard/residents` (resident management)
- Maintenance can be added to properties module if needed

### 3. Independence.tsx
**Purpose**: Independence skill tracking and progress monitoring
**Features**:
- Life skills progress tracking
- Goal achievement monitoring
- Support plan integration
- Resident milestone tracking

**Status**: REDUNDANT - Functionality covered by existing modules
**Recommendation**: REMOVE - Features already covered by:
- `/app/dashboard/compliance/progress` (progress tracking)
- `/app/dashboard/residents/support-plans` (support plans)

### 4. CrisisConnectDashboard.tsx
**Purpose**: Specialized crisis management dashboard
**Features**: Appears to be a full dashboard view for crisis management

**Status**: DUPLICATE of Crisis.tsx functionality
**Recommendation**: REMOVE - Use Crisis.tsx if crisis features are needed

### 5. MonitoringDashboard.tsx
**Purpose**: System monitoring and metrics
**Features**: Platform health and monitoring

**Status**: KEEP for platform admin use
**Recommendation**: Could be integrated into Platform Admin section

### 6. UKCouncils.tsx
**Purpose**: UK local council integration and data
**Features**: Council-specific information and integration

**Status**: SPECIALIZED - Domain specific
**Recommendation**: KEEP if UK council integration is a planned feature, otherwise REMOVE

### 7. Forms.tsx
**Purpose**: Generic forms page
**Features**: Form builder or form listing

**Status**: UNCLEAR without more context
**Recommendation**: Review and either integrate into relevant module or REMOVE

### 8. Support.tsx (Not Billing)
**Purpose**: General support/help features
**Features**: Unknown without inspection

**Status**: May overlap with Help.tsx
**Recommendation**: REMOVE if redundant with Help page

## Immediate Actions

### Files to Remove (Redundant)
```bash
rm -f client/src/pages/Housing.tsx
rm -f client/src/pages/Independence.tsx
rm -f client/src/pages/CrisisConnectDashboard.tsx
```

### Files to Keep for Future Integration
- `Crisis.tsx` - Integrate into Compliance module
- `MonitoringDashboard.tsx` - Integrate into Platform Admin

### Files Requiring Decision
- `UKCouncils.tsx` - Keep if UK council features planned
- `Forms.tsx` - Review purpose and integrate or remove
- `Support.tsx` - Check if different from Help.tsx

## Implementation Plan

### Phase 1: Cleanup (Immediate)
1. Remove clearly redundant files (Housing, Independence, CrisisConnectDashboard)
2. Remove legacy auth files (already done)
3. Remove duplicate dashboard files (already done)

### Phase 2: Integration (Next Sprint)
1. Add Crisis module to Compliance section
2. Add MonitoringDashboard to Platform Admin
3. Review and decide on UKCouncils, Forms, Support

### Phase 3: Documentation (Ongoing)
1. Document all active routes
2. Maintain routing map
3. Enforce route structure in development

## Route Structure Standards

Going forward, all new features should follow this structure:
```
/app/dashboard/{module}/{feature}
```

Examples:
- `/app/dashboard/compliance/crisis` - Crisis management
- `/app/dashboard/monitoring/system` - System monitoring
- `/app/dashboard/integrations/councils` - Council integrations

## Benefits of Cleanup

1. **Reduced Confusion**: Developers won't be confused by multiple implementations
2. **Faster Builds**: Fewer unused files to process
3. **Better Maintainability**: Clear which code is active
4. **Improved Navigation**: Only active features in codebase
5. **Easier Onboarding**: New developers see only relevant code

## Testing Requirements

After cleanup:
1. ✅ Verify all existing routes still work
2. ✅ Test Help page integration
3. ✅ Ensure no import errors
4. ✅ Run full build to catch any issues
5. ✅ Test navigation between all active routes
