import {
  users,
  properties,
  residents,
  supportPlans,
  incidents,
  activities,
  financialRecords,
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
}

export const storage = new DatabaseStorage();
