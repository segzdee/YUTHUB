import {
  users,
  properties,
  residents,
  supportPlans,
  incidents,
  activities,
  financialRecords,
  formDrafts,
  propertyRooms,
  staffMembers,
  maintenanceRequests,
  tenancyAgreements,
  assessmentForms,
  progressTracking,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Resident,
  type InsertResident,
  type SupportPlan,
  type InsertSupportPlan,
  type Incident,
  type InsertIncident,
  type Activity,
  type InsertActivity,
  type FinancialRecord,
  type InsertFinancialRecord,
  type FormDraft,
  type InsertFormDraft,
  type PropertyRoom,
  type InsertPropertyRoom,
  type StaffMember,
  type InsertStaffMember,
  type MaintenanceRequest,
  type InsertMaintenanceRequest,
  type TenancyAgreement,
  type InsertTenancyAgreement,
  type AssessmentForm,
  type InsertAssessmentForm,
  type ProgressTracking,
  type InsertProgressTracking,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, count, avg, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(id: string, subscription: {
    tier: string;
    status: string;
    maxResidents: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<User>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  
  // Resident operations
  getResidents(): Promise<Resident[]>;
  getResident(id: number): Promise<Resident | undefined>;
  createResident(resident: InsertResident): Promise<Resident>;
  updateResident(id: number, resident: Partial<InsertResident>): Promise<Resident>;
  getResidentsByProperty(propertyId: number): Promise<Resident[]>;
  getRiskyResidents(): Promise<Resident[]>;
  
  // Support Plan operations
  getSupportPlans(): Promise<SupportPlan[]>;
  getSupportPlan(id: number): Promise<SupportPlan | undefined>;
  createSupportPlan(plan: InsertSupportPlan): Promise<SupportPlan>;
  updateSupportPlan(id: number, plan: Partial<InsertSupportPlan>): Promise<SupportPlan>;
  getSupportPlansByResident(residentId: number): Promise<SupportPlan[]>;
  
  // Incident operations
  getIncidents(): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident>;
  getActiveIncidents(): Promise<Incident[]>;
  
  // Activity operations
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Financial operations
  getFinancialRecords(): Promise<FinancialRecord[]>;
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalProperties: number;
    currentResidents: number;
    occupancyRate: number;
    activeIncidents: number;
  }>;

  // Form drafts operations
  getFormDraft(userId: string, formType: string): Promise<FormDraft | undefined>;
  createFormDraft(draft: InsertFormDraft): Promise<FormDraft>;
  updateFormDraft(id: number, draft: Partial<InsertFormDraft>): Promise<FormDraft>;

  // Property rooms operations
  getPropertyRooms(propertyId: number): Promise<PropertyRoom[]>;
  createPropertyRoom(room: InsertPropertyRoom): Promise<PropertyRoom>;
  updatePropertyRoom(id: number, room: Partial<InsertPropertyRoom>): Promise<PropertyRoom>;

  // Staff members operations
  getStaffMembers(): Promise<StaffMember[]>;
  createStaffMember(staff: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: number, staff: Partial<InsertStaffMember>): Promise<StaffMember>;

  // Maintenance requests operations
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest>;

  // Tenancy agreements operations
  getTenancyAgreements(): Promise<TenancyAgreement[]>;
  createTenancyAgreement(agreement: InsertTenancyAgreement): Promise<TenancyAgreement>;
  updateTenancyAgreement(id: number, agreement: Partial<InsertTenancyAgreement>): Promise<TenancyAgreement>;

  // Assessment forms operations
  getAssessmentForms(): Promise<AssessmentForm[]>;
  createAssessmentForm(form: InsertAssessmentForm): Promise<AssessmentForm>;
  updateAssessmentForm(id: number, form: Partial<InsertAssessmentForm>): Promise<AssessmentForm>;

  // Progress tracking operations
  getProgressTracking(residentId?: number): Promise<ProgressTracking[]>;
  createProgressTracking(tracking: InsertProgressTracking): Promise<ProgressTracking>;
  updateProgressTracking(id: number, tracking: Partial<InsertProgressTracking>): Promise<ProgressTracking>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserSubscription(id: string, subscription: {
    tier: string;
    status: string;
    maxResidents: number;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        subscriptionTier: subscription.tier,
        subscriptionStatus: subscription.status,
        maxResidents: subscription.maxResidents,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        subscriptionStartDate: subscription.startDate,
        subscriptionEndDate: subscription.endDate,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...property, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  // Resident operations
  async getResidents(): Promise<Resident[]> {
    return await db.select().from(residents).orderBy(desc(residents.createdAt));
  }

  async getResident(id: number): Promise<Resident | undefined> {
    const [resident] = await db.select().from(residents).where(eq(residents.id, id));
    return resident;
  }

  async createResident(resident: InsertResident): Promise<Resident> {
    const [newResident] = await db.insert(residents).values(resident).returning();
    
    // Update property occupancy
    if (resident.propertyId) {
      await db
        .update(properties)
        .set({ 
          occupiedUnits: sql`${properties.occupiedUnits} + 1`,
          updatedAt: new Date()
        })
        .where(eq(properties.id, resident.propertyId));
    }
    
    return newResident;
  }

  async updateResident(id: number, resident: Partial<InsertResident>): Promise<Resident> {
    const [updatedResident] = await db
      .update(residents)
      .set({ ...resident, updatedAt: new Date() })
      .where(eq(residents.id, id))
      .returning();
    return updatedResident;
  }

  async getResidentsByProperty(propertyId: number): Promise<Resident[]> {
    return await db.select().from(residents).where(eq(residents.propertyId, propertyId));
  }

  async getRiskyResidents(): Promise<Resident[]> {
    return await db
      .select()
      .from(residents)
      .where(sql`${residents.riskLevel} IN ('medium', 'high')`)
      .orderBy(desc(residents.updatedAt));
  }

  // Support Plan operations
  async getSupportPlans(): Promise<SupportPlan[]> {
    return await db.select().from(supportPlans).orderBy(desc(supportPlans.createdAt));
  }

  async getSupportPlan(id: number): Promise<SupportPlan | undefined> {
    const [plan] = await db.select().from(supportPlans).where(eq(supportPlans.id, id));
    return plan;
  }

  async createSupportPlan(plan: InsertSupportPlan): Promise<SupportPlan> {
    const [newPlan] = await db.insert(supportPlans).values(plan).returning();
    return newPlan;
  }

  async updateSupportPlan(id: number, plan: Partial<InsertSupportPlan>): Promise<SupportPlan> {
    const [updatedPlan] = await db
      .update(supportPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(supportPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async getSupportPlansByResident(residentId: number): Promise<SupportPlan[]> {
    return await db.select().from(supportPlans).where(eq(supportPlans.residentId, residentId));
  }

  // Incident operations
  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
    return incident;
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const [newIncident] = await db.insert(incidents).values(incident).returning();
    return newIncident;
  }

  async updateIncident(id: number, incident: Partial<InsertIncident>): Promise<Incident> {
    const [updatedIncident] = await db
      .update(incidents)
      .set({ ...incident, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return updatedIncident;
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(sql`${incidents.status} IN ('open', 'investigating')`)
      .orderBy(desc(incidents.createdAt));
  }

  // Activity operations
  async getActivities(limit = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Financial operations
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    return await db.select().from(financialRecords).orderBy(desc(financialRecords.createdAt));
  }

  async createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord> {
    const [newRecord] = await db.insert(financialRecords).values(record).returning();
    return newRecord;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalProperties: number;
    currentResidents: number;
    occupancyRate: number;
    activeIncidents: number;
  }> {
    const [propertyCount] = await db.select({ count: count() }).from(properties);
    const [residentCount] = await db.select({ count: count() }).from(residents).where(eq(residents.status, 'active'));
    const [activeIncidentCount] = await db.select({ count: count() }).from(incidents).where(sql`${incidents.status} IN ('open', 'investigating')`);
    
    const [occupancyData] = await db
      .select({
        totalUnits: sum(properties.totalUnits),
        occupiedUnits: sum(properties.occupiedUnits),
      })
      .from(properties);

    const occupancyRate = occupancyData.totalUnits && occupancyData.occupiedUnits 
      ? Math.round((Number(occupancyData.occupiedUnits) / Number(occupancyData.totalUnits)) * 100)
      : 0;

    return {
      totalProperties: propertyCount.count,
      currentResidents: residentCount.count,
      occupancyRate,
      activeIncidents: activeIncidentCount.count,
    };
  }

  // Form drafts operations
  async getFormDraft(userId: string, formType: string): Promise<FormDraft | undefined> {
    const [draft] = await db.select().from(formDrafts)
      .where(and(eq(formDrafts.userId, userId), eq(formDrafts.formType, formType)))
      .orderBy(desc(formDrafts.updatedAt))
      .limit(1);
    return draft || undefined;
  }

  async createFormDraft(draft: InsertFormDraft): Promise<FormDraft> {
    const [newDraft] = await db.insert(formDrafts).values(draft).returning();
    return newDraft;
  }

  async updateFormDraft(id: number, draft: Partial<InsertFormDraft>): Promise<FormDraft> {
    const [updatedDraft] = await db.update(formDrafts)
      .set({ ...draft, updatedAt: new Date() })
      .where(eq(formDrafts.id, id))
      .returning();
    return updatedDraft;
  }

  // Property rooms operations
  async getPropertyRooms(propertyId: number): Promise<PropertyRoom[]> {
    return await db.select().from(propertyRooms)
      .where(eq(propertyRooms.propertyId, propertyId));
  }

  async createPropertyRoom(room: InsertPropertyRoom): Promise<PropertyRoom> {
    const [newRoom] = await db.insert(propertyRooms).values(room).returning();
    return newRoom;
  }

  async updatePropertyRoom(id: number, room: Partial<InsertPropertyRoom>): Promise<PropertyRoom> {
    const [updatedRoom] = await db.update(propertyRooms)
      .set({ ...room, updatedAt: new Date() })
      .where(eq(propertyRooms.id, id))
      .returning();
    return updatedRoom;
  }

  // Staff members operations
  async getStaffMembers(): Promise<StaffMember[]> {
    return await db.select().from(staffMembers)
      .where(eq(staffMembers.isActive, true));
  }

  async createStaffMember(staff: InsertStaffMember): Promise<StaffMember> {
    const [newStaff] = await db.insert(staffMembers).values(staff).returning();
    return newStaff;
  }

  async updateStaffMember(id: number, staff: Partial<InsertStaffMember>): Promise<StaffMember> {
    const [updatedStaff] = await db.update(staffMembers)
      .set({ ...staff, updatedAt: new Date() })
      .where(eq(staffMembers.id, id))
      .returning();
    return updatedStaff;
  }

  // Maintenance requests operations
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests)
      .orderBy(desc(maintenanceRequests.createdAt));
  }

  async createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [newRequest] = await db.insert(maintenanceRequests).values(request).returning();
    return newRequest;
  }

  async updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest> {
    const [updatedRequest] = await db.update(maintenanceRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return updatedRequest;
  }

  // Tenancy agreements operations
  async getTenancyAgreements(): Promise<TenancyAgreement[]> {
    return await db.select().from(tenancyAgreements)
      .orderBy(desc(tenancyAgreements.createdAt));
  }

  async createTenancyAgreement(agreement: InsertTenancyAgreement): Promise<TenancyAgreement> {
    const [newAgreement] = await db.insert(tenancyAgreements).values(agreement).returning();
    return newAgreement;
  }

  async updateTenancyAgreement(id: number, agreement: Partial<InsertTenancyAgreement>): Promise<TenancyAgreement> {
    const [updatedAgreement] = await db.update(tenancyAgreements)
      .set({ ...agreement, updatedAt: new Date() })
      .where(eq(tenancyAgreements.id, id))
      .returning();
    return updatedAgreement;
  }

  // Assessment forms operations
  async getAssessmentForms(): Promise<AssessmentForm[]> {
    return await db.select().from(assessmentForms)
      .orderBy(desc(assessmentForms.createdAt));
  }

  async createAssessmentForm(form: InsertAssessmentForm): Promise<AssessmentForm> {
    const [newForm] = await db.insert(assessmentForms).values(form).returning();
    return newForm;
  }

  async updateAssessmentForm(id: number, form: Partial<InsertAssessmentForm>): Promise<AssessmentForm> {
    const [updatedForm] = await db.update(assessmentForms)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(assessmentForms.id, id))
      .returning();
    return updatedForm;
  }

  // Progress tracking operations
  async getProgressTracking(residentId?: number): Promise<ProgressTracking[]> {
    const query = db.select().from(progressTracking);
    
    if (residentId) {
      query.where(eq(progressTracking.residentId, residentId));
    }
    
    return await query.orderBy(desc(progressTracking.lastUpdated));
  }

  async createProgressTracking(tracking: InsertProgressTracking): Promise<ProgressTracking> {
    const [newTracking] = await db.insert(progressTracking).values(tracking).returning();
    return newTracking;
  }

  async updateProgressTracking(id: number, tracking: Partial<InsertProgressTracking>): Promise<ProgressTracking> {
    const [updatedTracking] = await db.update(progressTracking)
      .set({ ...tracking, lastUpdated: new Date() })
      .where(eq(progressTracking.id, id))
      .returning();
    return updatedTracking;
  }
}

export const storage = new DatabaseStorage();
