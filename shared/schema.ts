import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  'sessions',
  {
    sid: varchar('sid').primaryKey(),
    sess: jsonb('sess').notNull(),
    expire: timestamp('expire').notNull(),
  },
  table => [index('IDX_session_expire').on(table.expire)]
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable('users', {
  id: varchar('id').primaryKey().notNull(),
  email: varchar('email').unique(),
  firstName: varchar('first_name'),
  lastName: varchar('last_name'),
  profileImageUrl: varchar('profile_image_url'),
  role: varchar('role').default('staff'), // staff, admin, platform_admin
  department: varchar('department'),
  employeeId: varchar('employee_id'),
  primaryAuthMethod: varchar('primary_auth_method').default('REPLIT'), // 'REPLIT', 'GOOGLE', 'MICROSOFT', 'APPLE', 'EMAIL'
  passwordHash: varchar('password_hash'), // For email auth
  passwordLastChanged: timestamp('password_last_changed'),
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: varchar('mfa_secret'), // TOTP secret
  mfaBackupCodes: text('mfa_backup_codes').array(), // Array of backup codes
  accountLocked: boolean('account_locked').default(false),
  lastLogin: timestamp('last_login'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token'),
  passwordResetToken: varchar('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  isActive: boolean('is_active').default(true),
  subscriptionTier: varchar('subscription_tier').default('trial'), // trial, starter, professional, enterprise
  subscriptionStatus: varchar('subscription_status').default('active'), // active, cancelled, expired, past_due
  maxResidents: integer('max_residents').default(25),
  stripeCustomerId: varchar('stripe_customer_id'),
  stripeSubscriptionId: varchar('stripe_subscription_id'),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  tosAccepted: boolean('tos_accepted').default(false),
  tosAcceptedAt: timestamp('tos_accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User authentication methods table for multi-method auth
export const userAuthMethods = pgTable(
  'user_auth_methods',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    provider: varchar('provider').notNull(), // 'REPLIT', 'GOOGLE', 'MICROSOFT', 'APPLE', 'EMAIL'
    providerId: varchar('provider_id').notNull(), // Provider-specific user ID
    providerEmail: varchar('provider_email'),
    accessToken: text('access_token'), // OAuth access token
    refreshToken: text('refresh_token'), // OAuth refresh token
    tokenExpiresAt: timestamp('token_expires_at'),
    providerData: jsonb('provider_data'), // Additional provider-specific data
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_user_auth_methods_user_id').on(table.userId),
    index('idx_user_auth_methods_provider').on(table.provider),
    index('idx_user_auth_methods_provider_id').on(table.providerId),
  ]
);

// User sessions table for multi-device session management
export const userSessions = pgTable(
  'user_sessions',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    sessionToken: varchar('session_token').notNull().unique(),
    deviceInfo: jsonb('device_info'), // Browser, OS, IP, etc.
    lastActivity: timestamp('last_activity').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_user_sessions_user_id').on(table.userId),
    index('idx_user_sessions_token').on(table.sessionToken),
    index('idx_user_sessions_expires').on(table.expiresAt),
  ]
);

// Authentication audit log
export const authAuditLog = pgTable(
  'auth_audit_log',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id),
    action: varchar('action').notNull(), // 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_RESET', 'MFA_ENABLED', etc.
    provider: varchar('provider'), // Which auth method was used
    ipAddress: varchar('ip_address'),
    userAgent: text('user_agent'),
    success: boolean('success').default(false),
    failureReason: varchar('failure_reason'),
    metadata: jsonb('metadata'), // Additional context
    timestamp: timestamp('timestamp').defaultNow(),
  },
  table => [
    index('idx_auth_audit_user_id').on(table.userId),
    index('idx_auth_audit_timestamp').on(table.timestamp),
    index('idx_auth_audit_action').on(table.action),
  ]
);

// Properties table
export const properties = pgTable(
  'properties',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    address: text('address').notNull(),
    propertyType: varchar('property_type').notNull(), // 'shared_housing', 'studio_units', 'transition_units'
    totalUnits: integer('total_units').notNull(),
    occupiedUnits: integer('occupied_units').default(0),
    status: varchar('status').default('active'), // 'active', 'maintenance', 'inactive'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_properties_status').on(table.status),
    index('idx_properties_property_type').on(table.propertyType),
    index('idx_properties_created_at').on(table.createdAt),
  ]
);

// Residents table
export const residents = pgTable(
  'residents',
  {
    id: serial('id').primaryKey(),
    firstName: varchar('first_name').notNull(),
    lastName: varchar('last_name').notNull(),
    email: varchar('email').unique(),
    phone: varchar('phone'),
    dateOfBirth: date('date_of_birth'),
    propertyId: integer('property_id').references(() => properties.id),
    unitNumber: varchar('unit_number'),
    moveInDate: date('move_in_date'),
    moveOutDate: date('move_out_date'),
    keyWorkerId: varchar('key_worker_id').references(() => users.id),
    independenceLevel: integer('independence_level').default(1), // 1-5 scale
    riskLevel: varchar('risk_level').default('low'), // 'low', 'medium', 'high'
    status: varchar('status').default('active'), // 'active', 'moved_out', 'at_risk'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_residents_property_id').on(table.propertyId),
    index('idx_residents_key_worker_id').on(table.keyWorkerId),
    index('idx_residents_status').on(table.status),
    index('idx_residents_risk_level').on(table.riskLevel),
    index('idx_residents_move_in_date').on(table.moveInDate),
    index('idx_residents_name').on(table.firstName, table.lastName),
  ]
);

// Support Plans table
export const supportPlans = pgTable('support_plans', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id),
  keyWorkerId: varchar('key_worker_id').references(() => users.id),
  goals: text('goals').notNull(),
  objectives: text('objectives').notNull(),
  reviewDate: date('review_date').notNull(),
  status: varchar('status').default('active'), // 'active', 'completed', 'paused'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Incidents table
export const incidents = pgTable(
  'incidents',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').references(() => properties.id),
    residentId: integer('resident_id').references(() => residents.id),
    reportedBy: varchar('reported_by').references(() => users.id),
    incidentType: varchar('incident_type').notNull(), // 'maintenance', 'behavioral', 'medical', 'safety'
    severity: varchar('severity').notNull(), // 'low', 'medium', 'high', 'critical'
    title: varchar('title').notNull(),
    description: text('description').notNull(),
    status: varchar('status').default('open'), // 'open', 'investigating', 'resolved', 'closed'
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_incidents_property_id').on(table.propertyId),
    index('idx_incidents_resident_id').on(table.residentId),
    index('idx_incidents_reported_by').on(table.reportedBy),
    index('idx_incidents_status').on(table.status),
    index('idx_incidents_severity').on(table.severity),
    index('idx_incidents_incident_type').on(table.incidentType),
    index('idx_incidents_created_at').on(table.createdAt),
    index('idx_incidents_status_severity').on(table.status, table.severity),
  ]
);

// Activities table for tracking system activities
export const activities = pgTable(
  'activities',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id),
    activityType: varchar('activity_type').notNull(), // 'placement', 'support_plan', 'incident', 'assessment'
    title: varchar('title').notNull(),
    description: text('description'),
    entityId: integer('entity_id'), // ID of the related entity
    entityType: varchar('entity_type'), // 'resident', 'property', 'incident', etc.
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_activities_user_id').on(table.userId),
    index('idx_activities_activity_type').on(table.activityType),
    index('idx_activities_entity').on(table.entityType, table.entityId),
    index('idx_activities_created_at').on(table.createdAt),
  ]
);

// Financial Records table
export const financialRecords = pgTable(
  'financial_records',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id').references(() => properties.id),
    residentId: integer('resident_id').references(() => residents.id),
    recordType: varchar('record_type').notNull(), // 'income', 'expense', 'budget', 'rent', 'deposit'
    category: varchar('category').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    description: text('description'),
    date: date('date').notNull(),
    dueDate: date('due_date'),
    paidDate: date('paid_date'),
    status: varchar('status').default('pending'), // 'pending', 'paid', 'overdue'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_financial_records_property_id').on(table.propertyId),
    index('idx_financial_records_resident_id').on(table.residentId),
    index('idx_financial_records_record_type').on(table.recordType),
    index('idx_financial_records_status').on(table.status),
    index('idx_financial_records_date').on(table.date),
    index('idx_financial_records_due_date').on(table.dueDate),
  ]
);

// Form drafts table for save-and-continue functionality
export const formDrafts = pgTable('form_drafts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  formType: varchar('form_type').notNull(), // 'property_registration', 'resident_intake', etc.
  formData: jsonb('form_data').notNull(),
  step: integer('step').default(1),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Property rooms table for room allocation
export const propertyRooms = pgTable('property_rooms', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .references(() => properties.id)
    .notNull(),
  roomNumber: varchar('room_number').notNull(),
  roomType: varchar('room_type').notNull(), // 'single', 'double', 'studio', 'shared'
  floor: integer('floor'),
  capacity: integer('capacity').default(1),
  currentOccupancy: integer('current_occupancy').default(0),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }),
  facilities: text('facilities').array(), // ['ensuite', 'kitchenette', 'balcony']
  status: varchar('status').default('available'), // 'available', 'occupied', 'maintenance', 'reserved'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Staff management table
export const staffMembers = pgTable('staff_members', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  employeeId: varchar('employee_id').unique(),
  department: varchar('department'), // 'housing', 'support', 'management', 'maintenance'
  position: varchar('position').notNull(),
  startDate: date('start_date'),
  endDate: date('end_date'),
  workingHours: jsonb('working_hours'), // {'monday': {'start': '09:00', 'end': '17:00'}}
  contactNumber: varchar('contact_number'),
  emergencyContact: jsonb('emergency_contact'),
  certifications: text('certifications').array(),
  accessLevel: varchar('access_level').default('standard'), // 'standard', 'supervisor', 'manager', 'admin'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Maintenance requests table
export const maintenanceRequests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id')
    .references(() => properties.id)
    .notNull(),
  roomId: integer('room_id').references(() => propertyRooms.id),
  residentId: integer('resident_id').references(() => residents.id),
  reportedBy: varchar('reported_by')
    .references(() => users.id)
    .notNull(),
  title: varchar('title').notNull(),
  description: text('description').notNull(),
  priority: varchar('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  category: varchar('category').notNull(), // 'plumbing', 'electrical', 'heating', 'structural', 'appliances'
  status: varchar('status').default('open'), // 'open', 'in_progress', 'completed', 'cancelled'
  assignedTo: integer('assigned_to').references(() => staffMembers.id),
  estimatedCost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actualCost: decimal('actual_cost', { precision: 10, scale: 2 }),
  scheduledDate: timestamp('scheduled_date'),
  completedDate: timestamp('completed_date'),
  images: text('images').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tenancy agreements table
export const tenancyAgreements = pgTable('tenancy_agreements', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id')
    .references(() => residents.id)
    .notNull(),
  propertyId: integer('property_id')
    .references(() => properties.id)
    .notNull(),
  roomId: integer('room_id').references(() => propertyRooms.id),
  agreementType: varchar('agreement_type').notNull(), // 'license', 'assured_shorthold', 'supported_living'
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  monthlyRent: decimal('monthly_rent', { precision: 10, scale: 2 }).notNull(),
  deposit: decimal('deposit', { precision: 10, scale: 2 }),
  serviceCharge: decimal('service_charge', { precision: 10, scale: 2 }),
  terms: jsonb('terms'), // Flexible terms and conditions
  status: varchar('status').default('active'), // 'active', 'expired', 'terminated', 'pending'
  documentPath: varchar('document_path'),
  signedDate: timestamp('signed_date'),
  witnessedBy: integer('witnessed_by').references(() => staffMembers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assessment forms table
export const assessmentForms = pgTable('assessment_forms', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id')
    .references(() => residents.id)
    .notNull(),
  assessmentType: varchar('assessment_type').notNull(), // 'intake', 'review', 'move_on', 'risk'
  assessorId: integer('assessor_id')
    .references(() => staffMembers.id)
    .notNull(),
  responses: jsonb('responses').notNull(), // Flexible form responses
  score: integer('score'),
  recommendations: text('recommendations'),
  nextReviewDate: date('next_review_date'),
  status: varchar('status').default('completed'), // 'draft', 'completed', 'approved'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Progress tracking table
export const progressTracking = pgTable('progress_tracking', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id')
    .references(() => residents.id)
    .notNull(),
  supportPlanId: integer('support_plan_id').references(() => supportPlans.id),
  goalType: varchar('goal_type').notNull(), // 'independence', 'education', 'employment', 'health', 'social'
  goal: text('goal').notNull(),
  targetDate: date('target_date'),
  currentProgress: integer('current_progress').default(0), // 0-100 percentage
  milestones: jsonb('milestones'), // Array of milestone objects
  notes: text('notes'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  updatedBy: integer('updated_by')
    .references(() => staffMembers.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  residents: many(residents),
  supportPlans: many(supportPlans),
  incidents: many(incidents),
  activities: many(activities),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  residents: many(residents),
  incidents: many(incidents),
  financialRecords: many(financialRecords),
}));

export const residentsRelations = relations(residents, ({ one, many }) => ({
  property: one(properties, {
    fields: [residents.propertyId],
    references: [properties.id],
  }),
  keyWorker: one(users, {
    fields: [residents.keyWorkerId],
    references: [users.id],
  }),
  supportPlans: many(supportPlans),
  incidents: many(incidents),
}));

export const supportPlansRelations = relations(supportPlans, ({ one }) => ({
  resident: one(residents, {
    fields: [supportPlans.residentId],
    references: [residents.id],
  }),
  keyWorker: one(users, {
    fields: [supportPlans.keyWorkerId],
    references: [users.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  property: one(properties, {
    fields: [incidents.propertyId],
    references: [properties.id],
  }),
  resident: one(residents, {
    fields: [incidents.residentId],
    references: [residents.id],
  }),
  reporter: one(users, {
    fields: [incidents.reportedBy],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const financialRecordsRelations = relations(
  financialRecords,
  ({ one }) => ({
    property: one(properties, {
      fields: [financialRecords.propertyId],
      references: [properties.id],
    }),
    resident: one(residents, {
      fields: [financialRecords.residentId],
      references: [residents.id],
    }),
  })
);

export const formDraftsRelations = relations(formDrafts, ({ one }) => ({
  user: one(users, {
    fields: [formDrafts.userId],
    references: [users.id],
  }),
}));

export const propertyRoomsRelations = relations(
  propertyRooms,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [propertyRooms.propertyId],
      references: [properties.id],
    }),
    maintenanceRequests: many(maintenanceRequests),
    tenancyAgreements: many(tenancyAgreements),
  })
);

export const staffMembersRelations = relations(
  staffMembers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [staffMembers.userId],
      references: [users.id],
    }),
    assignedMaintenanceRequests: many(maintenanceRequests),
    assessmentForms: many(assessmentForms),
    progressTracking: many(progressTracking),
  })
);

export const maintenanceRequestsRelations = relations(
  maintenanceRequests,
  ({ one }) => ({
    property: one(properties, {
      fields: [maintenanceRequests.propertyId],
      references: [properties.id],
    }),
    room: one(propertyRooms, {
      fields: [maintenanceRequests.roomId],
      references: [propertyRooms.id],
    }),
    resident: one(residents, {
      fields: [maintenanceRequests.residentId],
      references: [residents.id],
    }),
    reporter: one(users, {
      fields: [maintenanceRequests.reportedBy],
      references: [users.id],
    }),
    assignedStaff: one(staffMembers, {
      fields: [maintenanceRequests.assignedTo],
      references: [staffMembers.id],
    }),
  })
);

export const tenancyAgreementsRelations = relations(
  tenancyAgreements,
  ({ one }) => ({
    resident: one(residents, {
      fields: [tenancyAgreements.residentId],
      references: [residents.id],
    }),
    property: one(properties, {
      fields: [tenancyAgreements.propertyId],
      references: [properties.id],
    }),
    room: one(propertyRooms, {
      fields: [tenancyAgreements.roomId],
      references: [propertyRooms.id],
    }),
    witness: one(staffMembers, {
      fields: [tenancyAgreements.witnessedBy],
      references: [staffMembers.id],
    }),
  })
);

export const assessmentFormsRelations = relations(
  assessmentForms,
  ({ one }) => ({
    resident: one(residents, {
      fields: [assessmentForms.residentId],
      references: [residents.id],
    }),
    assessor: one(staffMembers, {
      fields: [assessmentForms.assessorId],
      references: [staffMembers.id],
    }),
  })
);

export const progressTrackingRelations = relations(
  progressTracking,
  ({ one }) => ({
    resident: one(residents, {
      fields: [progressTracking.residentId],
      references: [residents.id],
    }),
    supportPlan: one(supportPlans, {
      fields: [progressTracking.supportPlanId],
      references: [supportPlans.id],
    }),
    updatedByStaff: one(staffMembers, {
      fields: [progressTracking.updatedBy],
      references: [staffMembers.id],
    }),
  })
);

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResidentSchema = createInsertSchema(residents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportPlanSchema = createInsertSchema(supportPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialRecordSchema = createInsertSchema(
  financialRecords
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFormDraftSchema = createInsertSchema(formDrafts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyRoomSchema = createInsertSchema(propertyRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceRequestSchema = createInsertSchema(
  maintenanceRequests
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenancyAgreementSchema = createInsertSchema(
  tenancyAgreements
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentFormSchema = createInsertSchema(
  assessmentForms
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressTrackingSchema = createInsertSchema(
  progressTracking
).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Security and audit tables

// Audit trail table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id),
  action: varchar('action').notNull(), // LOGIN_SUCCESS, LOGIN_FAILED, PERMISSION_CHANGED, etc.
  resource: varchar('resource').notNull(), // AUTH, RBAC, PROPERTY, RESIDENT, etc.
  resourceId: varchar('resource_id'), // ID of the affected resource
  details: jsonb('details'), // Additional context
  ipAddress: varchar('ip_address'),
  userAgent: varchar('user_agent'),
  success: boolean('success').notNull(),
  riskLevel: varchar('risk_level').default('low'), // low, medium, high, critical
  timestamp: timestamp('timestamp').defaultNow(),
});

// Account lockout tracking
export const accountLockouts = pgTable('account_lockouts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  failedAttempts: integer('failed_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  lastAttempt: timestamp('last_attempt'),
  lastAttemptIp: varchar('last_attempt_ip'),
  resetAt: timestamp('reset_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// API tokens for programmatic access
export const apiTokens = pgTable('api_tokens', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  tokenHash: varchar('token_hash').notNull(),
  name: varchar('name').notNull(), // Human readable name for the token
  permissions: text('permissions').array(), // Array of permissions
  lastUsed: timestamp('last_used'),
  expiresAt: timestamp('expires_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Permission cache for performance
export const permissionCache = pgTable('permission_cache', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id')
    .references(() => users.id)
    .notNull(),
  permissions: jsonb('permissions').notNull(), // Cached permissions object
  role: varchar('role').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Resident = typeof residents.$inferSelect;
export type InsertResident = z.infer<typeof insertResidentSchema>;
export type SupportPlan = typeof supportPlans.$inferSelect;
export type InsertSupportPlan = z.infer<typeof insertSupportPlanSchema>;
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type FormDraft = typeof formDrafts.$inferSelect;
export type InsertFormDraft = z.infer<typeof insertFormDraftSchema>;
export type PropertyRoom = typeof propertyRooms.$inferSelect;
export type InsertPropertyRoom = z.infer<typeof insertPropertyRoomSchema>;
export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<
  typeof insertMaintenanceRequestSchema
>;
export type TenancyAgreement = typeof tenancyAgreements.$inferSelect;
export type InsertTenancyAgreement = z.infer<
  typeof insertTenancyAgreementSchema
>;
export type AssessmentForm = typeof assessmentForms.$inferSelect;
export type InsertAssessmentForm = z.infer<typeof insertAssessmentFormSchema>;
export type ProgressTracking = typeof progressTracking.$inferSelect;
export type InsertProgressTracking = z.infer<
  typeof insertProgressTrackingSchema
>;

// Billing System Tables
export const governmentClients = pgTable('government_clients', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  clientType: text('client_type').notNull(), // 'council', 'local_authority', 'government_agency'
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  billingAddress: text('billing_address').notNull(),
  paymentTerms: integer('payment_terms').default(30), // days
  defaultRate: decimal('default_rate', { precision: 10, scale: 2 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const supportLevelRates = pgTable('support_level_rates', {
  id: serial('id').primaryKey(),
  supportLevel: text('support_level').notNull(), // 'low', 'medium', 'high', 'intensive'
  rateType: text('rate_type').notNull(), // 'nightly', 'weekly', 'monthly'
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }).notNull(),
  additionalServices: text('additional_services').array(),
  serviceRate: decimal('service_rate', { precision: 10, scale: 2 }).default(
    '0.00'
  ),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const billingPeriods = pgTable('billing_periods', {
  id: serial('id').primaryKey(),
  residentId: integer('resident_id').references(() => residents.id),
  governmentClientId: integer('government_client_id').references(
    () => governmentClients.id
  ),
  propertyId: integer('property_id').references(() => properties.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  supportLevel: text('support_level').notNull(),
  rateType: text('rate_type').notNull(),
  dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }).notNull(),
  additionalServices: text('additional_services').array(),
  serviceCharges: decimal('service_charges', {
    precision: 10,
    scale: 2,
  }).default('0.00'),
  totalDays: integer('total_days'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  status: text('status').default('active'), // 'active', 'ended', 'suspended'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  governmentClientId: integer('government_client_id').references(
    () => governmentClients.id
  ),
  billingPeriodStart: date('billing_period_start').notNull(),
  billingPeriodEnd: date('billing_period_end').notNull(),
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'), // 'pending', 'sent', 'paid', 'overdue', 'cancelled'
  paidDate: date('paid_date'),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }),
  paymentMethod: text('payment_method'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoiceLineItems = pgTable('invoice_line_items', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  billingPeriodId: integer('billing_period_id').references(
    () => billingPeriods.id
  ),
  residentAnonymizedId: text('resident_anonymized_id').notNull(),
  description: text('description').notNull(),
  serviceType: text('service_type').notNull(),
  quantity: integer('quantity').notNull(),
  unitRate: decimal('unit_rate', { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentReminders = pgTable('payment_reminders', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  reminderType: text('reminder_type').notNull(), // 'first', 'second', 'final'
  sentDate: date('sent_date').notNull(),
  sentTo: text('sent_to').notNull(),
  status: text('status').default('sent'), // 'sent', 'bounced', 'responded'
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditTrail = pgTable('audit_trail', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Billing relations
export const governmentClientsRelations = relations(
  governmentClients,
  ({ many }) => ({
    billingPeriods: many(billingPeriods),
    invoices: many(invoices),
  })
);

export const supportLevelRatesRelations = relations(
  supportLevelRates,
  ({ many }) => ({
    billingPeriods: many(billingPeriods),
  })
);

export const billingPeriodsRelations = relations(
  billingPeriods,
  ({ one, many }) => ({
    resident: one(residents, {
      fields: [billingPeriods.residentId],
      references: [residents.id],
    }),
    governmentClient: one(governmentClients, {
      fields: [billingPeriods.governmentClientId],
      references: [governmentClients.id],
    }),
    property: one(properties, {
      fields: [billingPeriods.propertyId],
      references: [properties.id],
    }),
    invoiceLineItems: many(invoiceLineItems),
  })
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  governmentClient: one(governmentClients, {
    fields: [invoices.governmentClientId],
    references: [governmentClients.id],
  }),
  lineItems: many(invoiceLineItems),
  paymentReminders: many(paymentReminders),
}));

export const invoiceLineItemsRelations = relations(
  invoiceLineItems,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [invoiceLineItems.invoiceId],
      references: [invoices.id],
    }),
    billingPeriod: one(billingPeriods, {
      fields: [invoiceLineItems.billingPeriodId],
      references: [billingPeriods.id],
    }),
  })
);

export const paymentRemindersRelations = relations(
  paymentReminders,
  ({ one }) => ({
    invoice: one(invoices, {
      fields: [paymentReminders.invoiceId],
      references: [invoices.id],
    }),
  })
);

// Billing insert schemas
export const insertGovernmentClientSchema = createInsertSchema(
  governmentClients
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportLevelRateSchema = createInsertSchema(
  supportLevelRates
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBillingPeriodSchema = createInsertSchema(
  billingPeriods
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(
  invoiceLineItems
).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentReminderSchema = createInsertSchema(
  paymentReminders
).omit({
  id: true,
  createdAt: true,
});

export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  timestamp: true,
});

// Additional Critical Tables for Comprehensive Housing Management

// Document storage for file attachments and records
export const documentStorage = pgTable(
  'document_storage',
  {
    id: serial('id').primaryKey(),
    filename: varchar('filename').notNull(),
    originalName: varchar('original_name').notNull(),
    mimeType: varchar('mime_type').notNull(),
    fileSize: integer('file_size').notNull(),
    filePath: text('file_path').notNull(),
    thumbnailPath: text('thumbnail_path'),
    uploadedBy: varchar('uploaded_by')
      .references(() => users.id)
      .notNull(),
    entityType: varchar('entity_type').notNull(), // 'resident', 'property', 'incident', 'maintenance'
    entityId: integer('entity_id').notNull(),
    documentType: varchar('document_type').notNull(), // 'photo', 'pdf', 'form', 'contract', 'certificate'
    tags: text('tags').array(),
    description: text('description'),
    isConfidential: boolean('is_confidential').default(false),
    retentionDate: date('retention_date'),
    version: integer('version').default(1),
    parentDocumentId: integer('parent_document_id').references(
      () => documentStorage.id
    ),
    isCurrentVersion: boolean('is_current_version').default(true),
    checksum: varchar('checksum'), // For file integrity verification
    downloadCount: integer('download_count').default(0),
    lastAccessedAt: timestamp('last_accessed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_document_storage_entity').on(table.entityType, table.entityId),
    index('idx_document_storage_uploaded_by').on(table.uploadedBy),
    index('idx_document_storage_document_type').on(table.documentType),
    index('idx_document_storage_parent').on(table.parentDocumentId),
    index('idx_document_storage_current_version').on(table.isCurrentVersion),
    index('idx_document_storage_checksum').on(table.checksum),
  ]
);

// File sharing for secure document sharing between staff
export const fileSharing = pgTable(
  'file_sharing',
  {
    id: serial('id').primaryKey(),
    documentId: integer('document_id')
      .references(() => documentStorage.id)
      .notNull(),
    sharedBy: varchar('shared_by')
      .references(() => users.id)
      .notNull(),
    sharedWith: varchar('shared_with')
      .references(() => users.id)
      .notNull(),
    accessLevel: varchar('access_level').default('view'), // 'view', 'download', 'edit'
    expiresAt: timestamp('expires_at'),
    isRevoked: boolean('is_revoked').default(false),
    revokedAt: timestamp('revoked_at'),
    shareReason: text('share_reason'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_file_sharing_document_id').on(table.documentId),
    index('idx_file_sharing_shared_by').on(table.sharedBy),
    index('idx_file_sharing_shared_with').on(table.sharedWith),
    index('idx_file_sharing_expires_at').on(table.expiresAt),
  ]
);

// File access logs for audit and compliance
export const fileAccessLogs = pgTable(
  'file_access_logs',
  {
    id: serial('id').primaryKey(),
    documentId: integer('document_id')
      .references(() => documentStorage.id)
      .notNull(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    actionType: varchar('action_type').notNull(), // 'view', 'download', 'upload', 'delete', 'share'
    ipAddress: varchar('ip_address'),
    userAgent: text('user_agent'),
    success: boolean('success').default(true),
    errorMessage: text('error_message'),
    fileSize: integer('file_size'), // For upload/download actions
    downloadDuration: integer('download_duration'), // milliseconds
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_file_access_logs_document_id').on(table.documentId),
    index('idx_file_access_logs_user_id').on(table.userId),
    index('idx_file_access_logs_action_type').on(table.actionType),
    index('idx_file_access_logs_created_at').on(table.createdAt),
  ]
);

// File backup records for disaster recovery
export const fileBackupRecords = pgTable(
  'file_backup_records',
  {
    id: serial('id').primaryKey(),
    backupDate: date('backup_date').notNull(),
    backupType: varchar('backup_type').notNull(), // 'full', 'incremental', 'differential'
    backupLocation: text('backup_location').notNull(),
    totalFiles: integer('total_files').notNull(),
    totalSize: integer('total_size').notNull(), // bytes
    backupStatus: varchar('backup_status').default('in_progress'), // 'in_progress', 'completed', 'failed'
    backupDuration: integer('backup_duration'), // seconds
    verificationStatus: varchar('verification_status'), // 'pending', 'verified', 'failed'
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  table => [
    index('idx_file_backup_records_backup_date').on(table.backupDate),
    index('idx_file_backup_records_backup_type').on(table.backupType),
    index('idx_file_backup_records_backup_status').on(table.backupStatus),
  ]
);

// Communication logs for tracking emails/calls/messages with residents
export const communicationLogs = pgTable(
  'communication_logs',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    staffId: varchar('staff_id')
      .references(() => users.id)
      .notNull(),
    communicationType: varchar('communication_type').notNull(), // 'email', 'phone', 'sms', 'in_person', 'video_call'
    direction: varchar('direction').notNull(), // 'inbound', 'outbound'
    subject: varchar('subject'),
    content: text('content').notNull(),
    outcome: varchar('outcome'), // 'successful', 'no_response', 'voicemail', 'busy'
    followUpRequired: boolean('follow_up_required').default(false),
    followUpDate: date('follow_up_date'),
    isConfidential: boolean('is_confidential').default(false),
    attachments: text('attachments').array(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_communication_logs_resident_id').on(table.residentId),
    index('idx_communication_logs_staff_id').on(table.staffId),
    index('idx_communication_logs_type').on(table.communicationType),
    index('idx_communication_logs_created_at').on(table.createdAt),
  ]
);

// Calendar events for appointments and scheduling
export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    eventType: varchar('event_type').notNull(), // 'appointment', 'meeting', 'inspection', 'review', 'training'
    location: varchar('location'),
    organizer: varchar('organizer')
      .references(() => users.id)
      .notNull(),
    attendees: text('attendees').array(), // Array of user IDs
    residentId: integer('resident_id').references(() => residents.id),
    propertyId: integer('property_id').references(() => properties.id),
    status: varchar('status').default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'
    isRecurring: boolean('is_recurring').default(false),
    recurrenceRule: jsonb('recurrence_rule'),
    reminderSet: boolean('reminder_set').default(false),
    reminderTime: integer('reminder_time').default(15), // minutes before
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_calendar_events_start_time').on(table.startTime),
    index('idx_calendar_events_organizer').on(table.organizer),
    index('idx_calendar_events_resident_id').on(table.residentId),
    index('idx_calendar_events_property_id').on(table.propertyId),
    index('idx_calendar_events_status').on(table.status),
  ]
);

// Risk assessments for safeguarding protocols
export const riskAssessments = pgTable(
  'risk_assessments',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    assessorId: varchar('assessor_id')
      .references(() => users.id)
      .notNull(),
    assessmentType: varchar('assessment_type').notNull(), // 'initial', 'review', 'emergency', 'moving_on'
    riskCategories: jsonb('risk_categories').notNull(), // {self_harm: 'high', substance_abuse: 'medium', etc.}
    overallRiskLevel: varchar('overall_risk_level').notNull(), // 'low', 'medium', 'high', 'critical'
    riskFactors: text('risk_factors').array(),
    protectiveFactors: text('protective_factors').array(),
    recommendations: text('recommendations').notNull(),
    actionPlan: text('action_plan').notNull(),
    reviewDate: date('review_date').notNull(),
    escalationRequired: boolean('escalation_required').default(false),
    escalatedTo: varchar('escalated_to').references(() => users.id),
    status: varchar('status').default('active'), // 'active', 'completed', 'superseded'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_risk_assessments_resident_id').on(table.residentId),
    index('idx_risk_assessments_assessor_id').on(table.assessorId),
    index('idx_risk_assessments_overall_risk_level').on(table.overallRiskLevel),
    index('idx_risk_assessments_review_date').on(table.reviewDate),
  ]
);

// Emergency contacts for crisis management
export const emergencyContacts = pgTable(
  'emergency_contacts',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    contactType: varchar('contact_type').notNull(), // 'family', 'friend', 'professional', 'social_worker', 'gp'
    name: varchar('name').notNull(),
    relationship: varchar('relationship').notNull(),
    phone: varchar('phone').notNull(),
    email: varchar('email'),
    address: text('address'),
    isPrimary: boolean('is_primary').default(false),
    canContact: boolean('can_contact').default(true),
    consentDate: date('consent_date'),
    notes: text('notes'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_emergency_contacts_resident_id').on(table.residentId),
    index('idx_emergency_contacts_contact_type').on(table.contactType),
    index('idx_emergency_contacts_is_primary').on(table.isPrimary),
  ]
);

// Move records for tracking move-ins/move-outs
export const moveRecords = pgTable(
  'move_records',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    fromPropertyId: integer('from_property_id').references(() => properties.id),
    toPropertyId: integer('to_property_id').references(() => properties.id),
    fromRoomId: integer('from_room_id').references(() => propertyRooms.id),
    toRoomId: integer('to_room_id').references(() => propertyRooms.id),
    moveType: varchar('move_type').notNull(), // 'move_in', 'move_out', 'internal_transfer', 'emergency_move'
    moveDate: date('move_date').notNull(),
    reason: text('reason').notNull(),
    plannedDate: date('planned_date'),
    isEmergencyMove: boolean('is_emergency_move').default(false),
    handoverBy: varchar('handover_by').references(() => users.id),
    handoverTo: varchar('handover_to').references(() => users.id),
    inventoryChecked: boolean('inventory_checked').default(false),
    depositReturned: boolean('deposit_returned').default(false),
    cleaningRequired: boolean('cleaning_required').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_move_records_resident_id').on(table.residentId),
    index('idx_move_records_move_date').on(table.moveDate),
    index('idx_move_records_move_type').on(table.moveType),
    index('idx_move_records_from_property_id').on(table.fromPropertyId),
    index('idx_move_records_to_property_id').on(table.toPropertyId),
  ]
);

// Rent payments for detailed payment history
export const rentPayments = pgTable(
  'rent_payments',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    propertyId: integer('property_id')
      .references(() => properties.id)
      .notNull(),
    roomId: integer('room_id').references(() => propertyRooms.id),
    paymentDate: date('payment_date').notNull(),
    dueDate: date('due_date').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar('payment_method').notNull(), // 'cash', 'card', 'bank_transfer', 'housing_benefit', 'universal_credit'
    paymentReference: varchar('payment_reference'),
    paymentStatus: varchar('payment_status').default('pending'), // 'pending', 'paid', 'partial', 'overdue', 'cancelled'
    isPartialPayment: boolean('is_partial_payment').default(false),
    outstandingBalance: decimal('outstanding_balance', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    latePaymentFee: decimal('late_payment_fee', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    paymentPeriod: varchar('payment_period').notNull(), // 'weekly', 'monthly', 'quarterly'
    notes: text('notes'),
    processedBy: varchar('processed_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_rent_payments_resident_id').on(table.residentId),
    index('idx_rent_payments_property_id').on(table.propertyId),
    index('idx_rent_payments_payment_date').on(table.paymentDate),
    index('idx_rent_payments_due_date').on(table.dueDate),
    index('idx_rent_payments_payment_status').on(table.paymentStatus),
  ]
);

// Contractors for maintenance provider management
export const contractors = pgTable(
  'contractors',
  {
    id: serial('id').primaryKey(),
    companyName: varchar('company_name').notNull(),
    contactName: varchar('contact_name').notNull(),
    email: varchar('email').notNull(),
    phone: varchar('phone').notNull(),
    address: text('address'),
    specializations: text('specializations').array(), // ['plumbing', 'electrical', 'heating', 'general']
    certifications: text('certifications').array(),
    insuranceDetails: jsonb('insurance_details'),
    emergencyContact: boolean('emergency_contact').default(false),
    preferredContractor: boolean('preferred_contractor').default(false),
    paymentTerms: integer('payment_terms').default(30), // days
    hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
    callOutFee: decimal('call_out_fee', { precision: 10, scale: 2 }),
    rating: integer('rating').default(5), // 1-5 stars
    notes: text('notes'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_contractors_company_name').on(table.companyName),
    index('idx_contractors_specializations').on(table.specializations),
    index('idx_contractors_emergency_contact').on(table.emergencyContact),
    index('idx_contractors_preferred_contractor').on(table.preferredContractor),
  ]
);

// Inspections for property compliance checks
export const inspections = pgTable(
  'inspections',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id')
      .references(() => properties.id)
      .notNull(),
    roomId: integer('room_id').references(() => propertyRooms.id),
    inspectionType: varchar('inspection_type').notNull(), // 'health_safety', 'fire_safety', 'electrical', 'gas', 'routine', 'complaint'
    inspectorId: varchar('inspector_id').references(() => users.id),
    contractorId: integer('contractor_id').references(() => contractors.id),
    scheduledDate: date('scheduled_date').notNull(),
    completedDate: date('completed_date'),
    status: varchar('status').default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'failed', 'rescheduled'
    passStatus: varchar('pass_status'), // 'pass', 'fail', 'conditional_pass'
    checklist: jsonb('checklist'), // Inspection checklist items with pass/fail status
    findings: text('findings'),
    recommendations: text('recommendations'),
    followUpRequired: boolean('follow_up_required').default(false),
    followUpDate: date('follow_up_date'),
    certificate: varchar('certificate'), // Path to certificate file
    images: text('images').array(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_inspections_property_id').on(table.propertyId),
    index('idx_inspections_inspection_type').on(table.inspectionType),
    index('idx_inspections_scheduled_date').on(table.scheduledDate),
    index('idx_inspections_status').on(table.status),
    index('idx_inspections_pass_status').on(table.passStatus),
  ]
);

// Notifications for system alerts and messaging
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    notificationType: varchar('notification_type').notNull(), // 'alert', 'reminder', 'message', 'system', 'emergency'
    title: varchar('title').notNull(),
    message: text('message').notNull(),
    priority: varchar('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    category: varchar('category'), // 'maintenance', 'resident', 'financial', 'system', 'compliance'
    entityType: varchar('entity_type'), // 'resident', 'property', 'incident', 'maintenance'
    entityId: integer('entity_id'),
    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at'),
    actionRequired: boolean('action_required').default(false),
    actionUrl: varchar('action_url'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_notifications_user_id').on(table.userId),
    index('idx_notifications_notification_type').on(table.notificationType),
    index('idx_notifications_priority').on(table.priority),
    index('idx_notifications_is_read').on(table.isRead),
    index('idx_notifications_created_at').on(table.createdAt),
  ]
);

// Report templates for custom reporting
export const reportTemplates = pgTable(
  'report_templates',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    description: text('description'),
    reportType: varchar('report_type').notNull(), // 'occupancy', 'financial', 'incident', 'progress', 'compliance'
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    isDefault: boolean('is_default').default(false),
    isShared: boolean('is_shared').default(false),
    parameters: jsonb('parameters'), // Report parameters and filters
    columns: jsonb('columns'), // Column definitions
    formatting: jsonb('formatting'), // Styling and formatting options
    schedule: jsonb('schedule'), // Automated report schedule
    recipients: text('recipients').array(), // Email recipients for scheduled reports
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_report_templates_created_by').on(table.createdBy),
    index('idx_report_templates_report_type').on(table.reportType),
    index('idx_report_templates_is_default').on(table.isDefault),
  ]
);

// Dashboard widgets for user customization
export const dashboardWidgets = pgTable(
  'dashboard_widgets',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    widgetType: varchar('widget_type').notNull(), // 'metrics', 'chart', 'table', 'alert', 'calendar'
    widgetName: varchar('widget_name').notNull(),
    configuration: jsonb('configuration').notNull(), // Widget-specific configuration
    position: jsonb('position'), // {x: 0, y: 0, width: 4, height: 2}
    isVisible: boolean('is_visible').default(true),
    refreshInterval: integer('refresh_interval').default(300), // seconds
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_dashboard_widgets_user_id').on(table.userId),
    index('idx_dashboard_widgets_widget_type').on(table.widgetType),
  ]
);

// Crisis teams for emergency response coordination
export const crisisTeams = pgTable(
  'crisis_teams',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    description: text('description'),
    teamLeader: varchar('team_leader')
      .references(() => users.id)
      .notNull(),
    members: text('members').array(), // Array of user IDs
    specializations: text('specializations').array(), // ['mental_health', 'substance_abuse', 'domestic_violence']
    availability: jsonb('availability'), // When team is available
    contactDetails: jsonb('contact_details'), // Emergency contact info
    escalationLevel: integer('escalation_level').default(1), // 1-5 escalation levels
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_crisis_teams_team_leader').on(table.teamLeader),
    index('idx_crisis_teams_specializations').on(table.specializations),
    index('idx_crisis_teams_escalation_level').on(table.escalationLevel),
  ]
);

// Referrals for external service connections
export const referrals = pgTable(
  'referrals',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    referredBy: varchar('referred_by')
      .references(() => users.id)
      .notNull(),
    referralType: varchar('referral_type').notNull(), // 'health', 'education', 'employment', 'legal', 'housing'
    serviceProvider: varchar('service_provider').notNull(),
    contactDetails: jsonb('contact_details'),
    reason: text('reason').notNull(),
    urgency: varchar('urgency').default('routine'), // 'routine', 'urgent', 'emergency'
    referralDate: date('referral_date').notNull(),
    expectedDate: date('expected_date'),
    status: varchar('status').default('pending'), // 'pending', 'accepted', 'declined', 'completed', 'cancelled'
    outcome: text('outcome'),
    followUpRequired: boolean('follow_up_required').default(false),
    followUpDate: date('follow_up_date'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_referrals_resident_id').on(table.residentId),
    index('idx_referrals_referred_by').on(table.referredBy),
    index('idx_referrals_referral_type').on(table.referralType),
    index('idx_referrals_status').on(table.status),
    index('idx_referrals_referral_date').on(table.referralDate),
  ]
);

// Outcomes tracking for measuring success metrics
export const outcomesTracking = pgTable(
  'outcomes_tracking',
  {
    id: serial('id').primaryKey(),
    residentId: integer('resident_id')
      .references(() => residents.id)
      .notNull(),
    outcomeCategory: varchar('outcome_category').notNull(), // 'housing', 'education', 'employment', 'health', 'independence'
    outcomeType: varchar('outcome_type').notNull(), // 'positive', 'negative', 'neutral'
    description: text('description').notNull(),
    measurableOutcome: varchar('measurable_outcome'), // Specific measurable result
    baselineValue: decimal('baseline_value', { precision: 10, scale: 2 }),
    currentValue: decimal('current_value', { precision: 10, scale: 2 }),
    targetValue: decimal('target_value', { precision: 10, scale: 2 }),
    achievementDate: date('achievement_date'),
    recordedBy: varchar('recorded_by')
      .references(() => users.id)
      .notNull(),
    verificationMethod: varchar('verification_method'), // How outcome was verified
    isVerified: boolean('is_verified').default(false),
    verifiedBy: varchar('verified_by').references(() => users.id),
    verificationDate: date('verification_date'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_outcomes_tracking_resident_id').on(table.residentId),
    index('idx_outcomes_tracking_outcome_category').on(table.outcomeCategory),
    index('idx_outcomes_tracking_outcome_type').on(table.outcomeType),
    index('idx_outcomes_tracking_achievement_date').on(table.achievementDate),
  ]
);

// System configurations for platform settings
export const systemConfigurations = pgTable(
  'system_configurations',
  {
    id: serial('id').primaryKey(),
    configKey: varchar('config_key').notNull().unique(),
    configValue: jsonb('config_value').notNull(),
    description: text('description'),
    category: varchar('category').notNull(), // 'general', 'security', 'notifications', 'billing', 'reporting'
    dataType: varchar('data_type').notNull(), // 'string', 'number', 'boolean', 'json', 'array'
    isEditable: boolean('is_editable').default(true),
    requiresRestart: boolean('requires_restart').default(false),
    lastModifiedBy: varchar('last_modified_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_system_configurations_config_key').on(table.configKey),
    index('idx_system_configurations_category').on(table.category),
  ]
);

// Organizations for multi-tenancy support
export const organizations = pgTable(
  'organizations',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    displayName: varchar('display_name'),
    description: text('description'),
    organizationType: varchar('organization_type').notNull(), // 'housing_provider', 'local_authority', 'charity', 'private'
    registrationNumber: varchar('registration_number'),
    taxNumber: varchar('tax_number'),
    address: text('address'),
    phone: varchar('phone'),
    email: varchar('email'),
    website: varchar('website'),
    logo: varchar('logo'),
    branding: jsonb('branding'), // Colors, fonts, styling
    settings: jsonb('settings'), // Organization-specific settings
    subscription: jsonb('subscription'), // Subscription details
    parentOrganizationId: integer('parent_organization_id').references(
      () => organizations.id
    ),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_organizations_name').on(table.name),
    index('idx_organizations_organization_type').on(table.organizationType),
    index('idx_organizations_parent_organization_id').on(
      table.parentOrganizationId
    ),
  ]
);

// Roles and permissions for granular access control
export const rolesPermissions = pgTable(
  'roles_permissions',
  {
    id: serial('id').primaryKey(),
    roleName: varchar('role_name').notNull(),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    permissions: jsonb('permissions').notNull(), // Detailed permissions object
    isSystemRole: boolean('is_system_role').default(false),
    description: text('description'),
    createdBy: varchar('created_by').references(() => users.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_roles_permissions_role_name').on(table.roleName),
    index('idx_roles_permissions_organization_id').on(table.organizationId),
  ]
);

// Workflows for process automation
export const workflows = pgTable(
  'workflows',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    description: text('description'),
    workflowType: varchar('workflow_type').notNull(), // 'approval', 'notification', 'task', 'escalation'
    triggerEvents: text('trigger_events').array(), // Events that trigger the workflow
    conditions: jsonb('conditions'), // Conditions for workflow execution
    actions: jsonb('actions'), // Actions to perform
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    isActive: boolean('is_active').default(true),
    version: integer('version').default(1),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_workflows_workflow_type').on(table.workflowType),
    index('idx_workflows_created_by').on(table.createdBy),
    index('idx_workflows_organization_id').on(table.organizationId),
  ]
);

// Communication templates for standardized messaging
export const communicationTemplates = pgTable(
  'communication_templates',
  {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    templateType: varchar('template_type').notNull(), // 'email', 'sms', 'letter', 'notification'
    purpose: varchar('purpose').notNull(), // 'welcome', 'reminder', 'incident', 'maintenance', 'review'
    subject: varchar('subject'),
    content: text('content').notNull(),
    variables: text('variables').array(), // Available template variables
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_communication_templates_template_type').on(table.templateType),
    index('idx_communication_templates_purpose').on(table.purpose),
    index('idx_communication_templates_organization_id').on(
      table.organizationId
    ),
  ]
);

// Assets for property equipment tracking
export const assets = pgTable(
  'assets',
  {
    id: serial('id').primaryKey(),
    assetTag: varchar('asset_tag').notNull().unique(),
    name: varchar('name').notNull(),
    description: text('description'),
    category: varchar('category').notNull(), // 'appliance', 'furniture', 'safety', 'technology', 'vehicle'
    manufacturer: varchar('manufacturer'),
    model: varchar('model'),
    serialNumber: varchar('serial_number'),
    purchaseDate: date('purchase_date'),
    purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }),
    warrantyExpiry: date('warranty_expiry'),
    propertyId: integer('property_id').references(() => properties.id),
    roomId: integer('room_id').references(() => propertyRooms.id),
    condition: varchar('condition').default('good'), // 'excellent', 'good', 'fair', 'poor', 'damaged'
    lastInspection: date('last_inspection'),
    nextInspection: date('next_inspection'),
    maintenanceSchedule: jsonb('maintenance_schedule'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_assets_asset_tag').on(table.assetTag),
    index('idx_assets_property_id').on(table.propertyId),
    index('idx_assets_category').on(table.category),
    index('idx_assets_condition').on(table.condition),
  ]
);

// Utilities for service management
export const utilities = pgTable(
  'utilities',
  {
    id: serial('id').primaryKey(),
    propertyId: integer('property_id')
      .references(() => properties.id)
      .notNull(),
    utilityType: varchar('utility_type').notNull(), // 'gas', 'electricity', 'water', 'internet', 'tv'
    provider: varchar('provider').notNull(),
    accountNumber: varchar('account_number'),
    meterNumber: varchar('meter_number'),
    supply: varchar('supply'), // 'mains', 'prepaid', 'smart_meter'
    tariff: varchar('tariff'),
    monthlyEstimate: decimal('monthly_estimate', { precision: 10, scale: 2 }),
    lastReading: decimal('last_reading', { precision: 10, scale: 2 }),
    lastReadingDate: date('last_reading_date'),
    contractStartDate: date('contract_start_date'),
    contractEndDate: date('contract_end_date'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_utilities_property_id').on(table.propertyId),
    index('idx_utilities_utility_type').on(table.utilityType),
    index('idx_utilities_provider').on(table.provider),
  ]
);

// Insurance records for coverage tracking
export const insuranceRecords = pgTable(
  'insurance_records',
  {
    id: serial('id').primaryKey(),
    policyNumber: varchar('policy_number').notNull().unique(),
    propertyId: integer('property_id').references(() => properties.id),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    insuranceType: varchar('insurance_type').notNull(), // 'building', 'contents', 'liability', 'professional'
    provider: varchar('provider').notNull(),
    coverage: jsonb('coverage'), // Coverage details
    premium: decimal('premium', { precision: 10, scale: 2 }).notNull(),
    excess: decimal('excess', { precision: 10, scale: 2 }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    renewalDate: date('renewal_date'),
    claims: jsonb('claims'), // Claims history
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_insurance_records_policy_number').on(table.policyNumber),
    index('idx_insurance_records_property_id').on(table.propertyId),
    index('idx_insurance_records_insurance_type').on(table.insuranceType),
    index('idx_insurance_records_renewal_date').on(table.renewalDate),
  ]
);

// Training records for staff development
export const trainingRecords = pgTable(
  'training_records',
  {
    id: serial('id').primaryKey(),
    staffId: varchar('staff_id')
      .references(() => users.id)
      .notNull(),
    trainingType: varchar('training_type').notNull(), // 'safeguarding', 'health_safety', 'mandatory', 'professional'
    trainingName: varchar('training_name').notNull(),
    provider: varchar('provider'),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    completionDate: date('completion_date'),
    status: varchar('status').default('enrolled'), // 'enrolled', 'in_progress', 'completed', 'failed', 'expired'
    certificateNumber: varchar('certificate_number'),
    expiryDate: date('expiry_date'),
    renewalRequired: boolean('renewal_required').default(false),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_training_records_staff_id').on(table.staffId),
    index('idx_training_records_training_type').on(table.trainingType),
    index('idx_training_records_status').on(table.status),
    index('idx_training_records_expiry_date').on(table.expiryDate),
  ]
);

// Complaints for issue resolution
export const complaints = pgTable(
  'complaints',
  {
    id: serial('id').primaryKey(),
    complaintNumber: varchar('complaint_number').notNull().unique(),
    complainantType: varchar('complainant_type').notNull(), // 'resident', 'staff', 'external', 'anonymous'
    complainantId: integer('complainant_id').references(() => residents.id),
    complainantDetails: jsonb('complainant_details'), // For external/anonymous complaints
    complaintCategory: varchar('complaint_category').notNull(), // 'service', 'staff', 'property', 'policy', 'discrimination'
    description: text('description').notNull(),
    severity: varchar('severity').default('medium'), // 'low', 'medium', 'high', 'critical'
    assignedTo: varchar('assigned_to').references(() => users.id),
    status: varchar('status').default('received'), // 'received', 'investigating', 'resolved', 'closed', 'escalated'
    resolution: text('resolution'),
    actionsTaken: text('actions_taken'),
    resolutionDate: date('resolution_date'),
    isUpheld: boolean('is_upheld'),
    appealDeadline: date('appeal_deadline'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_complaints_complaint_number').on(table.complaintNumber),
    index('idx_complaints_complainant_id').on(table.complainantId),
    index('idx_complaints_complaint_category').on(table.complaintCategory),
    index('idx_complaints_severity').on(table.severity),
    index('idx_complaints_status').on(table.status),
  ]
);

// Surveys for feedback collection
export const surveys = pgTable(
  'surveys',
  {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    surveyType: varchar('survey_type').notNull(), // 'satisfaction', 'feedback', 'evaluation', 'needs_assessment'
    targetAudience: varchar('target_audience').notNull(), // 'residents', 'staff', 'all', 'external'
    questions: jsonb('questions').notNull(), // Survey questions and structure
    isAnonymous: boolean('is_anonymous').default(false),
    isActive: boolean('is_active').default(true),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_surveys_survey_type').on(table.surveyType),
    index('idx_surveys_target_audience').on(table.targetAudience),
    index('idx_surveys_created_by').on(table.createdBy),
    index('idx_surveys_is_active').on(table.isActive),
  ]
);

// Survey responses
export const surveyResponses = pgTable(
  'survey_responses',
  {
    id: serial('id').primaryKey(),
    surveyId: integer('survey_id')
      .references(() => surveys.id)
      .notNull(),
    respondentId: varchar('respondent_id').references(() => users.id),
    respondentType: varchar('respondent_type').notNull(), // 'resident', 'staff', 'external'
    responses: jsonb('responses').notNull(), // Response data
    isComplete: boolean('is_complete').default(false),
    submittedAt: timestamp('submitted_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_survey_responses_survey_id').on(table.surveyId),
    index('idx_survey_responses_respondent_id').on(table.respondentId),
    index('idx_survey_responses_respondent_type').on(table.respondentType),
  ]
);

// Integration logs for external system connectivity
export const integrationLogs = pgTable(
  'integration_logs',
  {
    id: serial('id').primaryKey(),
    integration: varchar('integration').notNull(), // 'local_authority', 'housing_benefit', 'universal_credit', 'nhs'
    operation: varchar('operation').notNull(), // 'sync', 'create', 'update', 'delete', 'query'
    entityType: varchar('entity_type'), // 'resident', 'property', 'payment'
    entityId: integer('entity_id'),
    requestData: jsonb('request_data'),
    responseData: jsonb('response_data'),
    status: varchar('status').notNull(), // 'success', 'failure', 'partial'
    errorCode: varchar('error_code'),
    errorMessage: text('error_message'),
    processingTime: integer('processing_time'), // milliseconds
    retryCount: integer('retry_count').default(0),
    nextRetryAt: timestamp('next_retry_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_integration_logs_integration').on(table.integration),
    index('idx_integration_logs_operation').on(table.operation),
    index('idx_integration_logs_status').on(table.status),
    index('idx_integration_logs_created_at').on(table.createdAt),
  ]
);

// Insert schemas for all new tables
export const insertDocumentStorageSchema = createInsertSchema(
  documentStorage
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSharingSchema = createInsertSchema(fileSharing).omit({
  id: true,
  createdAt: true,
});

export const insertFileAccessLogSchema = createInsertSchema(
  fileAccessLogs
).omit({
  id: true,
  createdAt: true,
});

export const insertFileBackupRecordSchema = createInsertSchema(
  fileBackupRecords
).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(
  communicationLogs
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(
  calendarEvents
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(
  riskAssessments
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmergencyContactSchema = createInsertSchema(
  emergencyContacts
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMoveRecordSchema = createInsertSchema(moveRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRentPaymentSchema = createInsertSchema(rentPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertReportTemplateSchema = createInsertSchema(
  reportTemplates
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(
  dashboardWidgets
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrisisTeamSchema = createInsertSchema(crisisTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOutcomesTrackingSchema = createInsertSchema(
  outcomesTracking
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemConfigurationSchema = createInsertSchema(
  systemConfigurations
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolesPermissionSchema = createInsertSchema(
  rolesPermissions
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunicationTemplateSchema = createInsertSchema(
  communicationTemplates
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUtilitySchema = createInsertSchema(utilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsuranceRecordSchema = createInsertSchema(
  insuranceRecords
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingRecordSchema = createInsertSchema(
  trainingRecords
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSurveyResponseSchema = createInsertSchema(
  surveyResponses
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationLogSchema = createInsertSchema(
  integrationLogs
).omit({
  id: true,
  createdAt: true,
});

// Billing types
export type GovernmentClient = typeof governmentClients.$inferSelect;
export type InsertGovernmentClient = z.infer<
  typeof insertGovernmentClientSchema
>;
export type SupportLevelRate = typeof supportLevelRates.$inferSelect;
export type InsertSupportLevelRate = z.infer<
  typeof insertSupportLevelRateSchema
>;
export type BillingPeriod = typeof billingPeriods.$inferSelect;
export type InsertBillingPeriod = z.infer<typeof insertBillingPeriodSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;
export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;

// Additional comprehensive housing management types
export type DocumentStorage = typeof documentStorage.$inferSelect;
export type InsertDocumentStorage = z.infer<typeof insertDocumentStorageSchema>;
export type FileSharing = typeof fileSharing.$inferSelect;
export type InsertFileSharing = z.infer<typeof insertFileSharingSchema>;
export type FileAccessLog = typeof fileAccessLogs.$inferSelect;
export type InsertFileAccessLog = z.infer<typeof insertFileAccessLogSchema>;
export type FileBackupRecord = typeof fileBackupRecords.$inferSelect;
export type InsertFileBackupRecord = z.infer<
  typeof insertFileBackupRecordSchema
>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<
  typeof insertCommunicationLogSchema
>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = z.infer<
  typeof insertEmergencyContactSchema
>;
export type MoveRecord = typeof moveRecords.$inferSelect;
export type InsertMoveRecord = z.infer<typeof insertMoveRecordSchema>;
export type RentPayment = typeof rentPayments.$inferSelect;
export type InsertRentPayment = z.infer<typeof insertRentPaymentSchema>;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type CrisisTeam = typeof crisisTeams.$inferSelect;
export type InsertCrisisTeam = z.infer<typeof insertCrisisTeamSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type OutcomesTracking = typeof outcomesTracking.$inferSelect;
export type InsertOutcomesTracking = z.infer<
  typeof insertOutcomesTrackingSchema
>;
export type SystemConfiguration = typeof systemConfigurations.$inferSelect;
export type InsertSystemConfiguration = z.infer<
  typeof insertSystemConfigurationSchema
>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type RolesPermission = typeof rolesPermissions.$inferSelect;
export type InsertRolesPermission = z.infer<typeof insertRolesPermissionSchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type InsertCommunicationTemplate = z.infer<
  typeof insertCommunicationTemplateSchema
>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Utility = typeof utilities.$inferSelect;
export type InsertUtility = z.infer<typeof insertUtilitySchema>;
export type InsuranceRecord = typeof insuranceRecords.$inferSelect;
export type InsertInsuranceRecord = z.infer<typeof insertInsuranceRecordSchema>;
export type TrainingRecord = typeof trainingRecords.$inferSelect;
export type InsertTrainingRecord = z.infer<typeof insertTrainingRecordSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = z.infer<typeof insertIntegrationLogSchema>;

// =================== SUBSCRIPTION MANAGEMENT SYSTEM ===================

// Subscription plans defining tiers with pricing, features, and limits
export const subscriptionPlans = pgTable(
  'subscription_plans',
  {
    id: serial('id').primaryKey(),
    planName: varchar('plan_name').notNull(), // 'starter', 'professional', 'enterprise', 'trial'
    displayName: varchar('display_name').notNull(), // 'Starter Plan', 'Professional Plan', etc.
    description: text('description'),
    monthlyPrice: decimal('monthly_price', {
      precision: 10,
      scale: 2,
    }).notNull(),
    annualPrice: decimal('annual_price', { precision: 10, scale: 2 }).notNull(),
    annualDiscountPercent: integer('annual_discount_percent').default(15),
    maxResidents: integer('max_residents'), // 25 for Starter, 100 for Professional, null for unlimited
    maxProperties: integer('max_properties'), // Property limits per tier
    maxUsers: integer('max_users'), // Staff user limits
    maxApiCalls: integer('max_api_calls'), // API rate limits
    maxStorage: integer('max_storage'), // Storage limits in GB
    features: jsonb('features').notNull(), // Available features for this tier
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    trialDays: integer('trial_days').default(14),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_plans_plan_name').on(table.planName),
    index('idx_subscription_plans_is_active').on(table.isActive),
    index('idx_subscription_plans_sort_order').on(table.sortOrder),
  ]
);

// Organization subscriptions tracking which councils have which plans
export const organizationSubscriptions = pgTable(
  'organization_subscriptions',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    planId: integer('plan_id')
      .references(() => subscriptionPlans.id)
      .notNull(),
    status: varchar('status').default('active'), // 'active', 'cancelled', 'expired', 'past_due', 'trialing'
    currentPeriodStart: timestamp('current_period_start').notNull(),
    currentPeriodEnd: timestamp('current_period_end').notNull(),
    billingCycle: varchar('billing_cycle').default('monthly'), // 'monthly', 'annual'
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency').default('GBP'),
    trialStart: timestamp('trial_start'),
    trialEnd: timestamp('trial_end'),
    cancelAt: timestamp('cancel_at'),
    canceledAt: timestamp('canceled_at'),
    cancelReason: text('cancel_reason'),
    stripeSubscriptionId: varchar('stripe_subscription_id'),
    stripeCustomerId: varchar('stripe_customer_id'),
    nextBillingDate: timestamp('next_billing_date'),
    autoRenew: boolean('auto_renew').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_organization_subscriptions_organization_id').on(
      table.organizationId
    ),
    index('idx_organization_subscriptions_plan_id').on(table.planId),
    index('idx_organization_subscriptions_status').on(table.status),
    index('idx_organization_subscriptions_current_period_end').on(
      table.currentPeriodEnd
    ),
    index('idx_organization_subscriptions_stripe_subscription_id').on(
      table.stripeSubscriptionId
    ),
  ]
);

// Feature mapping for each subscription tier
export const subscriptionFeatures = pgTable(
  'subscription_features',
  {
    id: serial('id').primaryKey(),
    planId: integer('plan_id')
      .references(() => subscriptionPlans.id)
      .notNull(),
    featureKey: varchar('feature_key').notNull(), // 'advanced_reporting', 'api_access', 'multi_property'
    featureName: varchar('feature_name').notNull(),
    isEnabled: boolean('is_enabled').default(true),
    limit: integer('limit'), // Numeric limits for features
    metadata: jsonb('metadata'), // Additional feature configuration
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_features_plan_id').on(table.planId),
    index('idx_subscription_features_feature_key').on(table.featureKey),
    index('idx_subscription_features_is_enabled').on(table.isEnabled),
  ]
);

// Usage tracking for monitoring against plan limits
export const usageTracking = pgTable(
  'usage_tracking',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    usageType: varchar('usage_type').notNull(), // 'residents', 'properties', 'users', 'api_calls', 'storage'
    currentUsage: integer('current_usage').default(0),
    limit: integer('limit'), // Current plan limit
    period: varchar('period').default('monthly'), // 'daily', 'monthly', 'annual'
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    overageAmount: integer('overage_amount').default(0),
    lastReset: timestamp('last_reset'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_usage_tracking_organization_id').on(table.organizationId),
    index('idx_usage_tracking_usage_type').on(table.usageType),
    index('idx_usage_tracking_period_end').on(table.periodEnd),
    index('idx_usage_tracking_organization_usage_type').on(
      table.organizationId,
      table.usageType
    ),
  ]
);

// Billing cycles for managing payment schedules
export const billingCycles = pgTable(
  'billing_cycles',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    cycleType: varchar('cycle_type').notNull(), // 'monthly', 'annual'
    cycleStart: timestamp('cycle_start').notNull(),
    cycleEnd: timestamp('cycle_end').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    discountPercent: integer('discount_percent').default(0),
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status').default('active'), // 'active', 'completed', 'cancelled'
    dueDate: timestamp('due_date').notNull(),
    paidDate: timestamp('paid_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_billing_cycles_organization_id').on(table.organizationId),
    index('idx_billing_cycles_subscription_id').on(table.subscriptionId),
    index('idx_billing_cycles_due_date').on(table.dueDate),
    index('idx_billing_cycles_status').on(table.status),
  ]
);

// Payment methods for storing customer payment information
export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    methodType: varchar('method_type').notNull(), // 'card', 'bank_transfer', 'paypal'
    isDefault: boolean('is_default').default(false),
    isActive: boolean('is_active').default(true),
    stripePaymentMethodId: varchar('stripe_payment_method_id'),
    cardLast4: varchar('card_last_4'),
    cardBrand: varchar('card_brand'),
    cardExpMonth: integer('card_exp_month'),
    cardExpYear: integer('card_exp_year'),
    billingName: varchar('billing_name'),
    billingEmail: varchar('billing_email'),
    billingAddress: jsonb('billing_address'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_payment_methods_organization_id').on(table.organizationId),
    index('idx_payment_methods_is_default').on(table.isDefault),
    index('idx_payment_methods_is_active').on(table.isActive),
    index('idx_payment_methods_stripe_payment_method_id').on(
      table.stripePaymentMethodId
    ),
  ]
);

// Subscription invoices for SaaS billing (separate from government billing)
export const subscriptionInvoices = pgTable(
  'subscription_invoices',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    invoiceNumber: varchar('invoice_number').notNull().unique(),
    invoiceDate: timestamp('invoice_date').notNull(),
    dueDate: timestamp('due_date').notNull(),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', {
      precision: 10,
      scale: 2,
    }).default('0.00'),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default(
      '0.00'
    ),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status').default('pending'), // 'pending', 'paid', 'overdue', 'cancelled', 'refunded'
    paidDate: timestamp('paid_date'),
    paymentMethodId: integer('payment_method_id').references(
      () => paymentMethods.id
    ),
    stripeInvoiceId: varchar('stripe_invoice_id'),
    stripePaymentIntentId: varchar('stripe_payment_intent_id'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_invoices_organization_id').on(table.organizationId),
    index('idx_subscription_invoices_subscription_id').on(table.subscriptionId),
    index('idx_subscription_invoices_invoice_number').on(table.invoiceNumber),
    index('idx_subscription_invoices_status').on(table.status),
    index('idx_subscription_invoices_due_date').on(table.dueDate),
    index('idx_subscription_invoices_stripe_invoice_id').on(
      table.stripeInvoiceId
    ),
  ]
);

// Feature toggles for enabling/disabling functionality based on subscription tier
export const featureToggles = pgTable(
  'feature_toggles',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    featureKey: varchar('feature_key').notNull(),
    isEnabled: boolean('is_enabled').default(false),
    enabledBy: varchar('enabled_by').references(() => users.id),
    enabledAt: timestamp('enabled_at'),
    disabledAt: timestamp('disabled_at'),
    reason: text('reason'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_feature_toggles_organization_id').on(table.organizationId),
    index('idx_feature_toggles_feature_key').on(table.featureKey),
    index('idx_feature_toggles_is_enabled').on(table.isEnabled),
    index('idx_feature_toggles_organization_feature').on(
      table.organizationId,
      table.featureKey
    ),
  ]
);

// Trial periods for managing free trials and conversions
export const trialPeriods = pgTable(
  'trial_periods',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    planId: integer('plan_id')
      .references(() => subscriptionPlans.id)
      .notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    status: varchar('status').default('active'), // 'active', 'expired', 'converted', 'cancelled'
    convertedAt: timestamp('converted_at'),
    convertedToSubscriptionId: integer(
      'converted_to_subscription_id'
    ).references(() => organizationSubscriptions.id),
    extensionDays: integer('extension_days').default(0),
    extensionReason: text('extension_reason'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_trial_periods_organization_id').on(table.organizationId),
    index('idx_trial_periods_plan_id').on(table.planId),
    index('idx_trial_periods_status').on(table.status),
    index('idx_trial_periods_end_date').on(table.endDate),
  ]
);

// Subscription changes for tracking upgrades/downgrades
export const subscriptionChanges = pgTable(
  'subscription_changes',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    changeType: varchar('change_type').notNull(), // 'upgrade', 'downgrade', 'plan_change', 'billing_change'
    fromPlanId: integer('from_plan_id').references(() => subscriptionPlans.id),
    toPlanId: integer('to_plan_id').references(() => subscriptionPlans.id),
    fromAmount: decimal('from_amount', { precision: 10, scale: 2 }),
    toAmount: decimal('to_amount', { precision: 10, scale: 2 }),
    effectiveDate: timestamp('effective_date').notNull(),
    prorationAmount: decimal('proration_amount', { precision: 10, scale: 2 }),
    reason: text('reason'),
    initiatedBy: varchar('initiated_by').references(() => users.id),
    status: varchar('status').default('pending'), // 'pending', 'completed', 'failed', 'cancelled'
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_changes_organization_id').on(table.organizationId),
    index('idx_subscription_changes_subscription_id').on(table.subscriptionId),
    index('idx_subscription_changes_change_type').on(table.changeType),
    index('idx_subscription_changes_effective_date').on(table.effectiveDate),
    index('idx_subscription_changes_status').on(table.status),
  ]
);

// Usage limits for enforcing tier restrictions
export const usageLimits = pgTable(
  'usage_limits',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    limitType: varchar('limit_type').notNull(), // 'properties', 'users', 'residents', 'api_calls', 'storage'
    currentValue: integer('current_value').default(0),
    limitValue: integer('limit_value').notNull(),
    softLimit: integer('soft_limit'), // Warning threshold
    hardLimit: integer('hard_limit'), // Absolute limit
    period: varchar('period').default('monthly'), // 'daily', 'monthly', 'annual'
    resetDate: timestamp('reset_date'),
    isBlocked: boolean('is_blocked').default(false),
    lastWarningDate: timestamp('last_warning_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_usage_limits_organization_id').on(table.organizationId),
    index('idx_usage_limits_limit_type').on(table.limitType),
    index('idx_usage_limits_is_blocked').on(table.isBlocked),
    index('idx_usage_limits_organization_limit_type').on(
      table.organizationId,
      table.limitType
    ),
  ]
);

// Overage charges for usage beyond plan limits
export const overageCharges = pgTable(
  'overage_charges',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    usageType: varchar('usage_type').notNull(), // 'residents', 'properties', 'api_calls', 'storage'
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    allowedUsage: integer('allowed_usage').notNull(),
    actualUsage: integer('actual_usage').notNull(),
    overageAmount: integer('overage_amount').notNull(),
    ratePerUnit: decimal('rate_per_unit', {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalCharge: decimal('total_charge', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status').default('pending'), // 'pending', 'billed', 'waived'
    billedDate: timestamp('billed_date'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_overage_charges_organization_id').on(table.organizationId),
    index('idx_overage_charges_subscription_id').on(table.subscriptionId),
    index('idx_overage_charges_usage_type').on(table.usageType),
    index('idx_overage_charges_period_end').on(table.periodEnd),
    index('idx_overage_charges_status').on(table.status),
  ]
);

// Subscription discounts for promotional pricing
export const subscriptionDiscounts = pgTable(
  'subscription_discounts',
  {
    id: serial('id').primaryKey(),
    code: varchar('code').notNull().unique(),
    name: varchar('name').notNull(),
    description: text('description'),
    discountType: varchar('discount_type').notNull(), // 'percentage', 'fixed_amount', 'free_months'
    discountValue: decimal('discount_value', {
      precision: 10,
      scale: 2,
    }).notNull(),
    appliesTo: varchar('applies_to').notNull(), // 'all_plans', 'specific_plans', 'first_payment', 'recurring'
    applicablePlans: text('applicable_plans').array(),
    maxUses: integer('max_uses'),
    currentUses: integer('current_uses').default(0),
    validFrom: timestamp('valid_from').notNull(),
    validUntil: timestamp('valid_until'),
    isActive: boolean('is_active').default(true),
    createdBy: varchar('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_discounts_code').on(table.code),
    index('idx_subscription_discounts_is_active').on(table.isActive),
    index('idx_subscription_discounts_valid_from').on(table.validFrom),
    index('idx_subscription_discounts_valid_until').on(table.validUntil),
  ]
);

// Payment transactions for tracking successful/failed payments
export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id').references(
      () => organizationSubscriptions.id
    ),
    invoiceId: integer('invoice_id').references(() => subscriptionInvoices.id),
    paymentMethodId: integer('payment_method_id').references(
      () => paymentMethods.id
    ),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency').default('GBP'),
    status: varchar('status').notNull(), // 'pending', 'succeeded', 'failed', 'cancelled', 'refunded'
    transactionType: varchar('transaction_type').notNull(), // 'payment', 'refund', 'chargeback'
    stripePaymentIntentId: varchar('stripe_payment_intent_id'),
    stripeChargeId: varchar('stripe_charge_id'),
    failureReason: text('failure_reason'),
    processedAt: timestamp('processed_at'),
    refundedAt: timestamp('refunded_at'),
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_payment_transactions_organization_id').on(table.organizationId),
    index('idx_payment_transactions_subscription_id').on(table.subscriptionId),
    index('idx_payment_transactions_invoice_id').on(table.invoiceId),
    index('idx_payment_transactions_status').on(table.status),
    index('idx_payment_transactions_transaction_type').on(
      table.transactionType
    ),
    index('idx_payment_transactions_stripe_payment_intent_id').on(
      table.stripePaymentIntentId
    ),
    index('idx_payment_transactions_processed_at').on(table.processedAt),
  ]
);

// Subscription renewals for automatic billing management
export const subscriptionRenewals = pgTable(
  'subscription_renewals',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    renewalDate: timestamp('renewal_date').notNull(),
    previousPeriodEnd: timestamp('previous_period_end').notNull(),
    newPeriodStart: timestamp('new_period_start').notNull(),
    newPeriodEnd: timestamp('new_period_end').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status').default('scheduled'), // 'scheduled', 'processing', 'completed', 'failed', 'cancelled'
    attemptCount: integer('attempt_count').default(0),
    lastAttemptDate: timestamp('last_attempt_date'),
    nextRetryDate: timestamp('next_retry_date'),
    failureReason: text('failure_reason'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_renewals_organization_id').on(table.organizationId),
    index('idx_subscription_renewals_subscription_id').on(table.subscriptionId),
    index('idx_subscription_renewals_renewal_date').on(table.renewalDate),
    index('idx_subscription_renewals_status').on(table.status),
    index('idx_subscription_renewals_next_retry_date').on(table.nextRetryDate),
  ]
);

// Cancellation requests for managing subscription terminations
export const cancellationRequests = pgTable(
  'cancellation_requests',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    requestedBy: varchar('requested_by')
      .references(() => users.id)
      .notNull(),
    requestDate: timestamp('request_date').notNull(),
    cancellationType: varchar('cancellation_type').notNull(), // 'immediate', 'end_of_period', 'scheduled'
    scheduledDate: timestamp('scheduled_date'),
    reason: text('reason'),
    feedback: text('feedback'),
    status: varchar('status').default('pending'), // 'pending', 'approved', 'cancelled', 'completed'
    processedBy: varchar('processed_by').references(() => users.id),
    processedAt: timestamp('processed_at'),
    refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_cancellation_requests_organization_id').on(table.organizationId),
    index('idx_cancellation_requests_subscription_id').on(table.subscriptionId),
    index('idx_cancellation_requests_requested_by').on(table.requestedBy),
    index('idx_cancellation_requests_status').on(table.status),
    index('idx_cancellation_requests_scheduled_date').on(table.scheduledDate),
  ]
);

// Multi-tenant settings for organization isolation
export const multiTenantSettings = pgTable(
  'multi_tenant_settings',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    settingKey: varchar('setting_key').notNull(),
    settingValue: jsonb('setting_value'),
    dataType: varchar('data_type').notNull(), // 'string', 'number', 'boolean', 'json'
    isInherited: boolean('is_inherited').default(false),
    parentSettingId: integer('parent_setting_id').references(
      () => multiTenantSettings.id
    ),
    lastModifiedBy: varchar('last_modified_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_multi_tenant_settings_organization_id').on(table.organizationId),
    index('idx_multi_tenant_settings_setting_key').on(table.settingKey),
    index('idx_multi_tenant_settings_organization_key').on(
      table.organizationId,
      table.settingKey
    ),
  ]
);

// Feature entitlements for granular permission control per tier
export const featureEntitlements = pgTable(
  'feature_entitlements',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    subscriptionId: integer('subscription_id')
      .references(() => organizationSubscriptions.id)
      .notNull(),
    featureKey: varchar('feature_key').notNull(),
    isEntitled: boolean('is_entitled').default(false),
    usageLimit: integer('usage_limit'),
    currentUsage: integer('current_usage').default(0),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_feature_entitlements_organization_id').on(table.organizationId),
    index('idx_feature_entitlements_subscription_id').on(table.subscriptionId),
    index('idx_feature_entitlements_feature_key').on(table.featureKey),
    index('idx_feature_entitlements_is_entitled').on(table.isEntitled),
    index('idx_feature_entitlements_organization_feature').on(
      table.organizationId,
      table.featureKey
    ),
  ]
);

// Subscription analytics for tracking revenue, churn, and upgrade patterns
export const subscriptionAnalytics = pgTable(
  'subscription_analytics',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    metricType: varchar('metric_type').notNull(), // 'mrr', 'churn', 'ltv', 'conversion', 'usage'
    metricValue: decimal('metric_value', { precision: 15, scale: 2 }).notNull(),
    period: varchar('period').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
    periodDate: date('period_date').notNull(),
    dimensions: jsonb('dimensions'), // Additional metric dimensions
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_subscription_analytics_organization_id').on(
      table.organizationId
    ),
    index('idx_subscription_analytics_metric_type').on(table.metricType),
    index('idx_subscription_analytics_period').on(table.period),
    index('idx_subscription_analytics_period_date').on(table.periodDate),
    index('idx_subscription_analytics_metric_period_date').on(
      table.metricType,
      table.periodDate
    ),
  ]
);

// Platform admin users table (separate from regular users)
export const platformUsers = pgTable(
  'platform_users',
  {
    id: serial('id').primaryKey(),
    userId: varchar('user_id')
      .references(() => users.id)
      .notNull(),
    accessLevel: varchar('access_level').default('admin'), // 'admin', 'super_admin', 'read_only'
    permissions: jsonb('permissions').notNull(), // Platform-specific permissions
    mfaEnabled: boolean('mfa_enabled').default(true),
    mfaSecret: varchar('mfa_secret'),
    ipWhitelist: text('ip_whitelist').array(), // Allowed IP addresses
    lastLoginAt: timestamp('last_login_at'),
    loginCount: integer('login_count').default(0),
    isActive: boolean('is_active').default(true),
    createdBy: varchar('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_platform_users_user_id').on(table.userId),
    index('idx_platform_users_access_level').on(table.accessLevel),
    index('idx_platform_users_is_active').on(table.isActive),
  ]
);

// Platform audit logs (separate from regular audit logs)
export const platformAuditLogs = pgTable(
  'platform_audit_logs',
  {
    id: serial('id').primaryKey(),
    adminUserId: varchar('admin_user_id')
      .references(() => users.id)
      .notNull(),
    action: varchar('action').notNull(), // 'ORGANIZATION_CREATED', 'SUBSCRIPTION_CHANGED', 'FEATURE_TOGGLED', etc.
    targetType: varchar('target_type').notNull(), // 'organization', 'subscription', 'user', 'system'
    targetId: varchar('target_id'), // ID of the affected resource
    organizationId: integer('organization_id').references(
      () => organizations.id
    ), // If action affects specific org
    details: jsonb('details').notNull(), // Detailed action information
    ipAddress: varchar('ip_address'),
    userAgent: varchar('user_agent'),
    success: boolean('success').notNull(),
    riskLevel: varchar('risk_level').default('medium'), // 'low', 'medium', 'high', 'critical'
    timestamp: timestamp('timestamp').defaultNow(),
  },
  table => [
    index('idx_platform_audit_logs_admin_user_id').on(table.adminUserId),
    index('idx_platform_audit_logs_action').on(table.action),
    index('idx_platform_audit_logs_target_type').on(table.targetType),
    index('idx_platform_audit_logs_organization_id').on(table.organizationId),
    index('idx_platform_audit_logs_timestamp').on(table.timestamp),
    index('idx_platform_audit_logs_risk_level').on(table.riskLevel),
  ]
);

// System metrics for platform performance monitoring
export const systemMetrics = pgTable(
  'system_metrics',
  {
    id: serial('id').primaryKey(),
    metricName: varchar('metric_name').notNull(), // 'db_connections', 'api_response_time', 'memory_usage', etc.
    metricValue: decimal('metric_value', { precision: 15, scale: 4 }).notNull(),
    unit: varchar('unit'), // 'ms', 'bytes', 'percent', 'count'
    organizationId: integer('organization_id').references(
      () => organizations.id
    ), // null for system-wide metrics
    metadata: jsonb('metadata'), // Additional metric context
    recordedAt: timestamp('recorded_at').defaultNow(),
  },
  table => [
    index('idx_system_metrics_metric_name').on(table.metricName),
    index('idx_system_metrics_organization_id').on(table.organizationId),
    index('idx_system_metrics_recorded_at').on(table.recordedAt),
    index('idx_system_metrics_name_recorded_at').on(
      table.metricName,
      table.recordedAt
    ),
  ]
);

// Platform notifications for system-wide announcements
export const platformNotifications = pgTable(
  'platform_notifications',
  {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    message: text('message').notNull(),
    notificationType: varchar('notification_type').notNull(), // 'maintenance', 'feature', 'security', 'billing'
    priority: varchar('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    targetAudience: varchar('target_audience').default('all'), // 'all', 'admins', 'specific_orgs'
    targetOrganizations: integer('target_organizations').array(), // Specific org IDs if targeted
    isActive: boolean('is_active').default(true),
    scheduledFor: timestamp('scheduled_for'),
    expiresAt: timestamp('expires_at'),
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_platform_notifications_notification_type').on(
      table.notificationType
    ),
    index('idx_platform_notifications_priority').on(table.priority),
    index('idx_platform_notifications_target_audience').on(
      table.targetAudience
    ),
    index('idx_platform_notifications_is_active').on(table.isActive),
    index('idx_platform_notifications_scheduled_for').on(table.scheduledFor),
  ]
);

// Organization analytics cache for platform admin dashboard
export const organizationAnalytics = pgTable(
  'organization_analytics',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id')
      .references(() => organizations.id)
      .notNull(),
    metricType: varchar('metric_type').notNull(), // 'total_residents', 'occupancy_rate', 'revenue', 'incidents'
    metricValue: decimal('metric_value', { precision: 15, scale: 2 }).notNull(),
    period: varchar('period').notNull(), // 'current', 'daily', 'weekly', 'monthly'
    periodDate: date('period_date').notNull(),
    calculatedAt: timestamp('calculated_at').defaultNow(),
    metadata: jsonb('metadata'), // Additional calculation context
  },
  table => [
    index('idx_organization_analytics_organization_id').on(
      table.organizationId
    ),
    index('idx_organization_analytics_metric_type').on(table.metricType),
    index('idx_organization_analytics_period').on(table.period),
    index('idx_organization_analytics_period_date').on(table.periodDate),
    index('idx_organization_analytics_org_metric_period').on(
      table.organizationId,
      table.metricType,
      table.periodDate
    ),
  ]
);

// Organization invitations table
export const organizationInvitations = pgTable('organization_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  inviterUserId: uuid('inviter_user_id')
    .references(() => users.id)
    .notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, accepted, expired
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
});

// Platform sessions for admin access tracking
export const platformSessions = pgTable(
  'platform_sessions',
  {
    id: varchar('id').primaryKey().notNull(),
    adminUserId: varchar('admin_user_id')
      .references(() => users.id)
      .notNull(),
    deviceInfo: jsonb('device_info'), // browser, OS, device fingerprint
    ipAddress: varchar('ip_address'),
    userAgent: varchar('user_agent'),
    mfaVerified: boolean('mfa_verified').default(false),
    lastActivity: timestamp('last_activity').defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  table => [
    index('idx_platform_sessions_admin_user_id').on(table.adminUserId),
    index('idx_platform_sessions_expires_at').on(table.expiresAt),
    index('idx_platform_sessions_last_activity').on(table.lastActivity),
  ]
);

// Maintenance windows for scheduled system maintenance
export const maintenanceWindows = pgTable(
  'maintenance_windows',
  {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    maintenanceType: varchar('maintenance_type').notNull(), // 'database', 'system', 'deployment', 'security'
    status: varchar('status').default('scheduled'), // 'scheduled', 'in_progress', 'completed', 'cancelled'
    scheduledStart: timestamp('scheduled_start').notNull(),
    scheduledEnd: timestamp('scheduled_end').notNull(),
    actualStart: timestamp('actual_start'),
    actualEnd: timestamp('actual_end'),
    affectedServices: text('affected_services').array(), // Services that will be affected
    notificationsSent: boolean('notifications_sent').default(false),
    createdBy: varchar('created_by')
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  table => [
    index('idx_maintenance_windows_status').on(table.status),
    index('idx_maintenance_windows_scheduled_start').on(table.scheduledStart),
    index('idx_maintenance_windows_maintenance_type').on(table.maintenanceType),
  ]
);

// Support tickets for cross-organization issue tracking
export const supportTickets = pgTable(
  'support_tickets',
  {
    id: serial('id').primaryKey(),
    organizationId: integer('organization_id').references(
      () => organizations.id
    ),
    reportedBy: varchar('reported_by')
      .references(() => users.id)
      .notNull(),
    assignedTo: varchar('assigned_to').references(() => users.id),
    title: varchar('title').notNull(),
    description: text('description').notNull(),
    category: varchar('category').notNull(), // 'technical', 'billing', 'feature_request', 'bug', 'account'
    priority: varchar('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
    status: varchar('status').default('open'), // 'open', 'in_progress', 'resolved', 'closed'
    resolution: text('resolution'),
    metadata: jsonb('metadata'), // Additional ticket context
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  table => [
    index('idx_support_tickets_organization_id').on(table.organizationId),
    index('idx_support_tickets_reported_by').on(table.reportedBy),
    index('idx_support_tickets_assigned_to').on(table.assignedTo),
    index('idx_support_tickets_category').on(table.category),
    index('idx_support_tickets_priority').on(table.priority),
    index('idx_support_tickets_status').on(table.status),
    index('idx_support_tickets_created_at').on(table.createdAt),
  ]
);

// Revenue reports for financial analytics
export const revenueReports = pgTable(
  'revenue_reports',
  {
    id: serial('id').primaryKey(),
    reportName: varchar('report_name').notNull(),
    reportType: varchar('report_type').notNull(), // 'monthly', 'quarterly', 'annual', 'custom'
    periodStart: date('period_start').notNull(),
    periodEnd: date('period_end').notNull(),
    totalRevenue: decimal('total_revenue', {
      precision: 15,
      scale: 2,
    }).notNull(),
    subscriptionRevenue: decimal('subscription_revenue', {
      precision: 15,
      scale: 2,
    }).notNull(),
    onetimeRevenue: decimal('onetime_revenue', {
      precision: 15,
      scale: 2,
    }).default('0.00'),
    refundAmount: decimal('refund_amount', { precision: 15, scale: 2 }).default(
      '0.00'
    ),
    netRevenue: decimal('net_revenue', { precision: 15, scale: 2 }).notNull(),
    organizationCount: integer('organization_count').notNull(),
    newSubscriptions: integer('new_subscriptions').default(0),
    canceledSubscriptions: integer('canceled_subscriptions').default(0),
    churnRate: decimal('churn_rate', { precision: 5, scale: 2 }), // Percentage
    data: jsonb('data').notNull(), // Detailed report data
    generatedBy: varchar('generated_by')
      .references(() => users.id)
      .notNull(),
    generatedAt: timestamp('generated_at').defaultNow(),
  },
  table => [
    index('idx_revenue_reports_report_type').on(table.reportType),
    index('idx_revenue_reports_period_start').on(table.periodStart),
    index('idx_revenue_reports_period_end').on(table.periodEnd),
    index('idx_revenue_reports_generated_at').on(table.generatedAt),
  ]
);

// =================== SUBSCRIPTION MANAGEMENT RELATIONS ===================

// Subscription plans relations
export const subscriptionPlansRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    subscriptions: many(organizationSubscriptions),
    features: many(subscriptionFeatures),
    trialPeriods: many(trialPeriods),
  })
);

// Organization subscriptions relations
export const organizationSubscriptionsRelations = relations(
  organizationSubscriptions,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [organizationSubscriptions.organizationId],
      references: [organizations.id],
    }),
    plan: one(subscriptionPlans, {
      fields: [organizationSubscriptions.planId],
      references: [subscriptionPlans.id],
    }),
    invoices: many(subscriptionInvoices),
    transactions: many(paymentTransactions),
    renewals: many(subscriptionRenewals),
    changes: many(subscriptionChanges),
    entitlements: many(featureEntitlements),
    billingCycles: many(billingCycles),
    overageCharges: many(overageCharges),
    cancellationRequests: many(cancellationRequests),
  })
);

// Payment methods relations
export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [paymentMethods.organizationId],
      references: [organizations.id],
    }),
    invoices: many(subscriptionInvoices),
    transactions: many(paymentTransactions),
  })
);

// Subscription invoices relations
export const subscriptionInvoicesRelations = relations(
  subscriptionInvoices,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [subscriptionInvoices.organizationId],
      references: [organizations.id],
    }),
    subscription: one(organizationSubscriptions, {
      fields: [subscriptionInvoices.subscriptionId],
      references: [organizationSubscriptions.id],
    }),
    paymentMethod: one(paymentMethods, {
      fields: [subscriptionInvoices.paymentMethodId],
      references: [paymentMethods.id],
    }),
    transactions: many(paymentTransactions),
  })
);

// =================== SUBSCRIPTION MANAGEMENT INSERT SCHEMAS ===================

export const insertSubscriptionPlanSchema = createInsertSchema(
  subscriptionPlans
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSubscriptionSchema = createInsertSchema(
  organizationSubscriptions
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionFeatureSchema = createInsertSchema(
  subscriptionFeatures
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageTrackingSchema = createInsertSchema(usageTracking).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  }
);

export const insertBillingCycleSchema = createInsertSchema(billingCycles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(
  paymentMethods
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionInvoiceSchema = createInsertSchema(
  subscriptionInvoices
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureToggleSchema = createInsertSchema(
  featureToggles
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrialPeriodSchema = createInsertSchema(trialPeriods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionChangeSchema = createInsertSchema(
  subscriptionChanges
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUsageLimitSchema = createInsertSchema(usageLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOverageChargeSchema = createInsertSchema(
  overageCharges
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionDiscountSchema = createInsertSchema(
  subscriptionDiscounts
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(
  paymentTransactions
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionRenewalSchema = createInsertSchema(
  subscriptionRenewals
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCancellationRequestSchema = createInsertSchema(
  cancellationRequests
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMultiTenantSettingSchema = createInsertSchema(
  multiTenantSettings
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureEntitlementSchema = createInsertSchema(
  featureEntitlements
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionAnalyticsSchema = createInsertSchema(
  subscriptionAnalytics
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// =================== SUBSCRIPTION MANAGEMENT TYPES ===================

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<
  typeof insertSubscriptionPlanSchema
>;
export type OrganizationSubscription =
  typeof organizationSubscriptions.$inferSelect;
export type InsertOrganizationSubscription = z.infer<
  typeof insertOrganizationSubscriptionSchema
>;
export type SubscriptionFeature = typeof subscriptionFeatures.$inferSelect;
export type InsertSubscriptionFeature = z.infer<
  typeof insertSubscriptionFeatureSchema
>;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = z.infer<typeof insertUsageTrackingSchema>;
export type BillingCycle = typeof billingCycles.$inferSelect;
export type InsertBillingCycle = z.infer<typeof insertBillingCycleSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
export type InsertSubscriptionInvoice = z.infer<
  typeof insertSubscriptionInvoiceSchema
>;
export type FeatureToggle = typeof featureToggles.$inferSelect;
export type InsertFeatureToggle = z.infer<typeof insertFeatureToggleSchema>;
export type TrialPeriod = typeof trialPeriods.$inferSelect;
export type InsertTrialPeriod = z.infer<typeof insertTrialPeriodSchema>;
export type SubscriptionChange = typeof subscriptionChanges.$inferSelect;
export type InsertSubscriptionChange = z.infer<
  typeof insertSubscriptionChangeSchema
>;
export type UsageLimit = typeof usageLimits.$inferSelect;
export type InsertUsageLimit = z.infer<typeof insertUsageLimitSchema>;
export type OverageCharge = typeof overageCharges.$inferSelect;
export type InsertOverageCharge = z.infer<typeof insertOverageChargeSchema>;
export type SubscriptionDiscount = typeof subscriptionDiscounts.$inferSelect;
export type InsertSubscriptionDiscount = z.infer<
  typeof insertSubscriptionDiscountSchema
>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<
  typeof insertPaymentTransactionSchema
>;
export type SubscriptionRenewal = typeof subscriptionRenewals.$inferSelect;
export type InsertSubscriptionRenewal = z.infer<
  typeof insertSubscriptionRenewalSchema
>;
export type CancellationRequest = typeof cancellationRequests.$inferSelect;
export type InsertCancellationRequest = z.infer<
  typeof insertCancellationRequestSchema
>;
export type MultiTenantSetting = typeof multiTenantSettings.$inferSelect;
export type InsertMultiTenantSetting = z.infer<
  typeof insertMultiTenantSettingSchema
>;
export type FeatureEntitlement = typeof featureEntitlements.$inferSelect;
export type InsertFeatureEntitlement = z.infer<
  typeof insertFeatureEntitlementSchema
>;
export type SubscriptionAnalytics = typeof subscriptionAnalytics.$inferSelect;
export type InsertSubscriptionAnalytics = z.infer<
  typeof insertSubscriptionAnalyticsSchema
>;
