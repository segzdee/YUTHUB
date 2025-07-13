import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("staff"),
  subscriptionTier: varchar("subscription_tier").default("trial"), // trial, starter, professional, enterprise
  subscriptionStatus: varchar("subscription_status").default("active"), // active, cancelled, expired, past_due
  maxResidents: integer("max_residents").default(25),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  address: text("address").notNull(),
  propertyType: varchar("property_type").notNull(), // 'shared_housing', 'studio_units', 'transition_units'
  totalUnits: integer("total_units").notNull(),
  occupiedUnits: integer("occupied_units").default(0),
  status: varchar("status").default("active"), // 'active', 'maintenance', 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residents table
export const residents = pgTable("residents", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  propertyId: integer("property_id").references(() => properties.id),
  unitNumber: varchar("unit_number"),
  moveInDate: date("move_in_date"),
  moveOutDate: date("move_out_date"),
  keyWorkerId: varchar("key_worker_id").references(() => users.id),
  independenceLevel: integer("independence_level").default(1), // 1-5 scale
  riskLevel: varchar("risk_level").default("low"), // 'low', 'medium', 'high'
  status: varchar("status").default("active"), // 'active', 'moved_out', 'at_risk'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Plans table
export const supportPlans = pgTable("support_plans", {
  id: serial("id").primaryKey(),
  residentId: integer("resident_id").references(() => residents.id),
  keyWorkerId: varchar("key_worker_id").references(() => users.id),
  goals: text("goals").notNull(),
  objectives: text("objectives").notNull(),
  reviewDate: date("review_date").notNull(),
  status: varchar("status").default("active"), // 'active', 'completed', 'paused'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Incidents table
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  residentId: integer("resident_id").references(() => residents.id),
  reportedBy: varchar("reported_by").references(() => users.id),
  incidentType: varchar("incident_type").notNull(), // 'maintenance', 'behavioral', 'medical', 'safety'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("open"), // 'open', 'investigating', 'resolved', 'closed'
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table for tracking system activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  activityType: varchar("activity_type").notNull(), // 'placement', 'support_plan', 'incident', 'assessment'
  title: varchar("title").notNull(),
  description: text("description"),
  entityId: integer("entity_id"), // ID of the related entity
  entityType: varchar("entity_type"), // 'resident', 'property', 'incident', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial Records table
export const financialRecords = pgTable("financial_records", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  residentId: integer("resident_id").references(() => residents.id),
  recordType: varchar("record_type").notNull(), // 'income', 'expense', 'budget', 'rent', 'deposit'
  category: varchar("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  status: varchar("status").default("pending"), // 'pending', 'paid', 'overdue'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Form drafts table for save-and-continue functionality
export const formDrafts = pgTable("form_drafts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  formType: varchar("form_type").notNull(), // 'property_registration', 'resident_intake', etc.
  formData: jsonb("form_data").notNull(),
  step: integer("step").default(1),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property rooms table for room allocation
export const propertyRooms = pgTable("property_rooms", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  roomNumber: varchar("room_number").notNull(),
  roomType: varchar("room_type").notNull(), // 'single', 'double', 'studio', 'shared'
  floor: integer("floor"),
  capacity: integer("capacity").default(1),
  currentOccupancy: integer("current_occupancy").default(0),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }),
  facilities: text("facilities").array(), // ['ensuite', 'kitchenette', 'balcony']
  status: varchar("status").default("available"), // 'available', 'occupied', 'maintenance', 'reserved'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff management table
export const staffMembers = pgTable("staff_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  employeeId: varchar("employee_id").unique(),
  department: varchar("department"), // 'housing', 'support', 'management', 'maintenance'
  position: varchar("position").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  workingHours: jsonb("working_hours"), // {'monday': {'start': '09:00', 'end': '17:00'}}
  contactNumber: varchar("contact_number"),
  emergencyContact: jsonb("emergency_contact"),
  certifications: text("certifications").array(),
  accessLevel: varchar("access_level").default("standard"), // 'standard', 'supervisor', 'manager', 'admin'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance requests table
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  roomId: integer("room_id").references(() => propertyRooms.id),
  residentId: integer("resident_id").references(() => residents.id),
  reportedBy: varchar("reported_by").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  category: varchar("category").notNull(), // 'plumbing', 'electrical', 'heating', 'structural', 'appliances'
  status: varchar("status").default("open"), // 'open', 'in_progress', 'completed', 'cancelled'
  assignedTo: integer("assigned_to").references(() => staffMembers.id),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  images: text("images").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tenancy agreements table
export const tenancyAgreements = pgTable("tenancy_agreements", {
  id: serial("id").primaryKey(),
  residentId: integer("resident_id").references(() => residents.id).notNull(),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  roomId: integer("room_id").references(() => propertyRooms.id),
  agreementType: varchar("agreement_type").notNull(), // 'license', 'assured_shorthold', 'supported_living'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  monthlyRent: decimal("monthly_rent", { precision: 10, scale: 2 }).notNull(),
  deposit: decimal("deposit", { precision: 10, scale: 2 }),
  serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }),
  terms: jsonb("terms"), // Flexible terms and conditions
  status: varchar("status").default("active"), // 'active', 'expired', 'terminated', 'pending'
  documentPath: varchar("document_path"),
  signedDate: timestamp("signed_date"),
  witnessedBy: integer("witnessed_by").references(() => staffMembers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assessment forms table
export const assessmentForms = pgTable("assessment_forms", {
  id: serial("id").primaryKey(),
  residentId: integer("resident_id").references(() => residents.id).notNull(),
  assessmentType: varchar("assessment_type").notNull(), // 'intake', 'review', 'move_on', 'risk'
  assessorId: integer("assessor_id").references(() => staffMembers.id).notNull(),
  responses: jsonb("responses").notNull(), // Flexible form responses
  score: integer("score"),
  recommendations: text("recommendations"),
  nextReviewDate: date("next_review_date"),
  status: varchar("status").default("completed"), // 'draft', 'completed', 'approved'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress tracking table
export const progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  residentId: integer("resident_id").references(() => residents.id).notNull(),
  supportPlanId: integer("support_plan_id").references(() => supportPlans.id),
  goalType: varchar("goal_type").notNull(), // 'independence', 'education', 'employment', 'health', 'social'
  goal: text("goal").notNull(),
  targetDate: date("target_date"),
  currentProgress: integer("current_progress").default(0), // 0-100 percentage
  milestones: jsonb("milestones"), // Array of milestone objects
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: integer("updated_by").references(() => staffMembers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  property: one(properties, {
    fields: [financialRecords.propertyId],
    references: [properties.id],
  }),
  resident: one(residents, {
    fields: [financialRecords.residentId],
    references: [residents.id],
  }),
}));

export const formDraftsRelations = relations(formDrafts, ({ one }) => ({
  user: one(users, {
    fields: [formDrafts.userId],
    references: [users.id],
  }),
}));

export const propertyRoomsRelations = relations(propertyRooms, ({ one, many }) => ({
  property: one(properties, {
    fields: [propertyRooms.propertyId],
    references: [properties.id],
  }),
  maintenanceRequests: many(maintenanceRequests),
  tenancyAgreements: many(tenancyAgreements),
}));

export const staffMembersRelations = relations(staffMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [staffMembers.userId],
    references: [users.id],
  }),
  assignedMaintenanceRequests: many(maintenanceRequests),
  assessmentForms: many(assessmentForms),
  progressTracking: many(progressTracking),
}));

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
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
}));

export const tenancyAgreementsRelations = relations(tenancyAgreements, ({ one }) => ({
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
}));

export const assessmentFormsRelations = relations(assessmentForms, ({ one }) => ({
  resident: one(residents, {
    fields: [assessmentForms.residentId],
    references: [residents.id],
  }),
  assessor: one(staffMembers, {
    fields: [assessmentForms.assessorId],
    references: [staffMembers.id],
  }),
}));

export const progressTrackingRelations = relations(progressTracking, ({ one }) => ({
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
}));

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

export const insertFinancialRecordSchema = createInsertSchema(financialRecords).omit({
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

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenancyAgreementSchema = createInsertSchema(tenancyAgreements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentFormSchema = createInsertSchema(assessmentForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProgressTrackingSchema = createInsertSchema(progressTracking).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
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
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type TenancyAgreement = typeof tenancyAgreements.$inferSelect;
export type InsertTenancyAgreement = z.infer<typeof insertTenancyAgreementSchema>;
export type AssessmentForm = typeof assessmentForms.$inferSelect;
export type InsertAssessmentForm = z.infer<typeof insertAssessmentFormSchema>;
export type ProgressTracking = typeof progressTracking.$inferSelect;
export type InsertProgressTracking = z.infer<typeof insertProgressTrackingSchema>;
