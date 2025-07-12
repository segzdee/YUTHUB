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
  recordType: varchar("record_type").notNull(), // 'income', 'expense', 'budget'
  category: varchar("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
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
