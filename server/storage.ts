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
  governmentClients,
  supportLevelRates,
  billingPeriods,
  invoices,
  invoiceLineItems,
  paymentReminders,
  auditTrail,
  userSessions,
  auditLogs,
  accountLockouts,
  documentStorage,
  fileSharing,
  fileAccessLogs,
  fileBackupRecords,
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
  type GovernmentClient,
  type InsertGovernmentClient,
  type SupportLevelRate,
  type InsertSupportLevelRate,
  type BillingPeriod,
  type InsertBillingPeriod,
  type Invoice,
  type InsertInvoice,
  type InvoiceLineItem,
  type InsertInvoiceLineItem,
  type PaymentReminder,
  type InsertPaymentReminder,
  type AuditTrail,
  type InsertAuditTrail,
  type DocumentStorage,
  type InsertDocumentStorage,
  type FileSharing,
  type InsertFileSharing,
  type FileAccessLog,
  type InsertFileAccessLog,
  type FileBackupRecord,
  type InsertFileBackupRecord,
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

  // Billing operations
  // Government clients
  getGovernmentClients(): Promise<GovernmentClient[]>;
  getGovernmentClient(id: number): Promise<GovernmentClient | undefined>;
  createGovernmentClient(client: InsertGovernmentClient): Promise<GovernmentClient>;
  updateGovernmentClient(id: number, client: Partial<InsertGovernmentClient>): Promise<GovernmentClient>;
  deleteGovernmentClient(id: number): Promise<void>;

  // Support level rates
  getSupportLevelRates(): Promise<SupportLevelRate[]>;
  getSupportLevelRate(id: number): Promise<SupportLevelRate | undefined>;
  createSupportLevelRate(rate: InsertSupportLevelRate): Promise<SupportLevelRate>;
  updateSupportLevelRate(id: number, rate: Partial<InsertSupportLevelRate>): Promise<SupportLevelRate>;
  deleteSupportLevelRate(id: number): Promise<void>;

  // Billing periods
  getBillingPeriods(): Promise<BillingPeriod[]>;
  getBillingPeriod(id: number): Promise<BillingPeriod | undefined>;
  createBillingPeriod(period: InsertBillingPeriod): Promise<BillingPeriod>;
  updateBillingPeriod(id: number, period: Partial<InsertBillingPeriod>): Promise<BillingPeriod>;
  getBillingPeriodsByClient(clientId: number): Promise<BillingPeriod[]>;
  getBillingPeriodsByResident(residentId: number): Promise<BillingPeriod[]>;
  getActiveBillingPeriods(): Promise<BillingPeriod[]>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  getInvoicesByClient(clientId: number): Promise<Invoice[]>;
  getOverdueInvoices(): Promise<Invoice[]>;
  getPendingInvoices(): Promise<Invoice[]>;
  generateInvoiceNumber(): Promise<string>;

  // Invoice line items
  getInvoiceLineItems(invoiceId: number): Promise<InvoiceLineItem[]>;
  createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem>;
  updateInvoiceLineItem(id: number, lineItem: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem>;
  deleteInvoiceLineItem(id: number): Promise<void>;

  // Payment reminders
  getPaymentReminders(invoiceId?: number): Promise<PaymentReminder[]>;
  createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder>;
  updatePaymentReminder(id: number, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder>;

  // Audit trail operations
  createAuditTrail(audit: InsertAuditTrail): Promise<AuditTrail>;
  getAuditTrail(entityType?: string, entityId?: string): Promise<AuditTrail[]>;

  // Billing analytics
  getBillingAnalytics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    outstandingAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    topClients: Array<{
      clientId: number;
      clientName: string;
      totalAmount: number;
      invoiceCount: number;
    }>;
  }>;

  // Document storage operations
  createDocument(document: InsertDocumentStorage): Promise<DocumentStorage>;
  getDocument(id: number): Promise<DocumentStorage | undefined>;
  getDocuments(filters?: { entityType?: string; entityId?: number; documentType?: string }): Promise<DocumentStorage[]>;
  updateDocument(id: number, updates: Partial<DocumentStorage>): Promise<DocumentStorage>;
  deleteDocument(id: number): Promise<void>;
  searchDocuments(query: string, filters?: { entityType?: string; documentType?: string }): Promise<DocumentStorage[]>;

  // File sharing operations
  createFileShare(share: InsertFileSharing): Promise<FileSharing>;
  getFileShares(documentId: number): Promise<FileSharing[]>;
  updateFileShare(id: number, updates: Partial<FileSharing>): Promise<FileSharing>;
  revokeFileShare(id: number): Promise<void>;

  // File access logging
  logFileAccess(log: InsertFileAccessLog): Promise<FileAccessLog>;
  getFileAccessLogs(documentId: number): Promise<FileAccessLog[]>;

  // File backup operations
  createBackupRecord(backup: InsertFileBackupRecord): Promise<FileBackupRecord>;
  getBackupRecords(): Promise<FileBackupRecord[]>;
  updateBackupRecord(id: number, updates: Partial<FileBackupRecord>): Promise<FileBackupRecord>;
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

  // Billing operations implementation
  // Government clients
  async getGovernmentClients(): Promise<GovernmentClient[]> {
    return await db.select().from(governmentClients).orderBy(desc(governmentClients.createdAt));
  }

  async getGovernmentClient(id: number): Promise<GovernmentClient | undefined> {
    const [client] = await db.select().from(governmentClients).where(eq(governmentClients.id, id));
    return client;
  }

  async createGovernmentClient(client: InsertGovernmentClient): Promise<GovernmentClient> {
    const [newClient] = await db.insert(governmentClients).values(client).returning();
    return newClient;
  }

  async updateGovernmentClient(id: number, client: Partial<InsertGovernmentClient>): Promise<GovernmentClient> {
    const [updatedClient] = await db
      .update(governmentClients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(governmentClients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteGovernmentClient(id: number): Promise<void> {
    await db.delete(governmentClients).where(eq(governmentClients.id, id));
  }

  // Support level rates
  async getSupportLevelRates(): Promise<SupportLevelRate[]> {
    return await db.select().from(supportLevelRates).where(eq(supportLevelRates.isActive, true));
  }

  async getSupportLevelRate(id: number): Promise<SupportLevelRate | undefined> {
    const [rate] = await db.select().from(supportLevelRates).where(eq(supportLevelRates.id, id));
    return rate;
  }

  async createSupportLevelRate(rate: InsertSupportLevelRate): Promise<SupportLevelRate> {
    const [newRate] = await db.insert(supportLevelRates).values(rate).returning();
    return newRate;
  }

  async updateSupportLevelRate(id: number, rate: Partial<InsertSupportLevelRate>): Promise<SupportLevelRate> {
    const [updatedRate] = await db
      .update(supportLevelRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(supportLevelRates.id, id))
      .returning();
    return updatedRate;
  }

  async deleteSupportLevelRate(id: number): Promise<void> {
    await db.update(supportLevelRates).set({ isActive: false }).where(eq(supportLevelRates.id, id));
  }

  // Billing periods
  async getBillingPeriods(): Promise<BillingPeriod[]> {
    return await db.select().from(billingPeriods).orderBy(desc(billingPeriods.createdAt));
  }

  async getBillingPeriod(id: number): Promise<BillingPeriod | undefined> {
    const [period] = await db.select().from(billingPeriods).where(eq(billingPeriods.id, id));
    return period;
  }

  async createBillingPeriod(period: InsertBillingPeriod): Promise<BillingPeriod> {
    const [newPeriod] = await db.insert(billingPeriods).values(period).returning();
    return newPeriod;
  }

  async updateBillingPeriod(id: number, period: Partial<InsertBillingPeriod>): Promise<BillingPeriod> {
    const [updatedPeriod] = await db
      .update(billingPeriods)
      .set({ ...period, updatedAt: new Date() })
      .where(eq(billingPeriods.id, id))
      .returning();
    return updatedPeriod;
  }

  async getBillingPeriodsByClient(clientId: number): Promise<BillingPeriod[]> {
    return await db.select().from(billingPeriods).where(eq(billingPeriods.governmentClientId, clientId));
  }

  async getBillingPeriodsByResident(residentId: number): Promise<BillingPeriod[]> {
    return await db.select().from(billingPeriods).where(eq(billingPeriods.residentId, residentId));
  }

  async getActiveBillingPeriods(): Promise<BillingPeriod[]> {
    return await db.select().from(billingPeriods).where(eq(billingPeriods.status, 'active'));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.governmentClientId, clientId));
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).where(
      and(
        eq(invoices.status, 'sent'),
        sql`${invoices.dueDate} < CURRENT_DATE`
      )
    );
  }

  async getPendingInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.status, 'pending'));
  }

  async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    const [lastInvoice] = await db
      .select()
      .from(invoices)
      .where(sql`${invoices.invoiceNumber} LIKE ${currentYear + currentMonth + '%'}`)
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `${currentYear}${currentMonth}${String(nextNumber).padStart(4, '0')}`;
  }

  // Invoice line items
  async getInvoiceLineItems(invoiceId: number): Promise<InvoiceLineItem[]> {
    return await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoiceId));
  }

  async createInvoiceLineItem(lineItem: InsertInvoiceLineItem): Promise<InvoiceLineItem> {
    const [newLineItem] = await db.insert(invoiceLineItems).values(lineItem).returning();
    return newLineItem;
  }

  async updateInvoiceLineItem(id: number, lineItem: Partial<InsertInvoiceLineItem>): Promise<InvoiceLineItem> {
    const [updatedLineItem] = await db
      .update(invoiceLineItems)
      .set(lineItem)
      .where(eq(invoiceLineItems.id, id))
      .returning();
    return updatedLineItem;
  }

  async deleteInvoiceLineItem(id: number): Promise<void> {
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.id, id));
  }

  // Payment reminders
  async getPaymentReminders(invoiceId?: number): Promise<PaymentReminder[]> {
    if (invoiceId) {
      return await db.select().from(paymentReminders).where(eq(paymentReminders.invoiceId, invoiceId));
    }
    return await db.select().from(paymentReminders).orderBy(desc(paymentReminders.createdAt));
  }

  async createPaymentReminder(reminder: InsertPaymentReminder): Promise<PaymentReminder> {
    const [newReminder] = await db.insert(paymentReminders).values(reminder).returning();
    return newReminder;
  }

  async updatePaymentReminder(id: number, reminder: Partial<InsertPaymentReminder>): Promise<PaymentReminder> {
    const [updatedReminder] = await db
      .update(paymentReminders)
      .set(reminder)
      .where(eq(paymentReminders.id, id))
      .returning();
    return updatedReminder;
  }

  // Audit trail
  async createAuditTrail(audit: InsertAuditTrail): Promise<AuditTrail> {
    const [newAudit] = await db.insert(auditTrail).values(audit).returning();
    return newAudit;
  }

  async getAuditTrail(entityType?: string, entityId?: string): Promise<AuditTrail[]> {
    if (entityType && entityId) {
      return await db.select().from(auditTrail)
        .where(and(eq(auditTrail.entityType, entityType), eq(auditTrail.entityId, entityId)))
        .orderBy(desc(auditTrail.timestamp));
    } else if (entityType) {
      return await db.select().from(auditTrail)
        .where(eq(auditTrail.entityType, entityType))
        .orderBy(desc(auditTrail.timestamp));
    }
    
    return await db.select().from(auditTrail).orderBy(desc(auditTrail.timestamp));
  }

  // Billing analytics
  async getBillingAnalytics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    outstandingAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    topClients: Array<{
      clientId: number;
      clientName: string;
      totalAmount: number;
      invoiceCount: number;
    }>;
  }> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Total revenue from paid invoices
    const [totalRevenueResult] = await db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(eq(invoices.status, 'paid'));

    // Monthly revenue
    const [monthlyRevenueResult] = await db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'paid'),
          sql`EXTRACT(MONTH FROM ${invoices.paidDate}) = ${currentMonth}`,
          sql`EXTRACT(YEAR FROM ${invoices.paidDate}) = ${currentYear}`
        )
      );

    // Outstanding amount
    const [outstandingResult] = await db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(sql`${invoices.status} IN ('pending', 'sent', 'overdue')`);

    // Invoice counts
    const [paidCount] = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.status, 'paid'));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.status, 'pending'));

    const [overdueCount] = await db
      .select({ count: count() })
      .from(invoices)
      .where(eq(invoices.status, 'overdue'));

    // Top clients
    const topClients = await db
      .select({
        clientId: invoices.governmentClientId,
        clientName: governmentClients.clientName,
        totalAmount: sum(invoices.totalAmount),
        invoiceCount: count(invoices.id),
      })
      .from(invoices)
      .innerJoin(governmentClients, eq(invoices.governmentClientId, governmentClients.id))
      .groupBy(invoices.governmentClientId, governmentClients.clientName)
      .orderBy(desc(sum(invoices.totalAmount)))
      .limit(5);

    return {
      totalRevenue: Number(totalRevenueResult?.total || 0),
      monthlyRevenue: Number(monthlyRevenueResult?.total || 0),
      outstandingAmount: Number(outstandingResult?.total || 0),
      paidInvoices: Number(paidCount?.count || 0),
      pendingInvoices: Number(pendingCount?.count || 0),
      overdueInvoices: Number(overdueCount?.count || 0),
      topClients: topClients.map(client => ({
        clientId: client.clientId!,
        clientName: client.clientName,
        totalAmount: Number(client.totalAmount || 0),
        invoiceCount: Number(client.invoiceCount || 0),
      })),
    };
  }

  // Security operations
  async getUserLockoutData(userId: string): Promise<{
    failedAttempts: number;
    lockedUntil: number | null;
    lastAttempt: number | null;
  }> {
    const [lockout] = await db
      .select()
      .from(accountLockouts)
      .where(eq(accountLockouts.userId, userId));
    
    return {
      failedAttempts: lockout?.failedAttempts || 0,
      lockedUntil: lockout?.lockedUntil?.getTime() || null,
      lastAttempt: lockout?.lastAttempt?.getTime() || null,
    };
  }

  async updateUserLockout(userId: string, data: {
    failedAttempts: number;
    lockedUntil: number | null;
    lastAttempt: number;
  }): Promise<void> {
    await db
      .insert(accountLockouts)
      .values({
        userId,
        failedAttempts: data.failedAttempts,
        lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null,
        lastAttempt: new Date(data.lastAttempt),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: accountLockouts.userId,
        set: {
          failedAttempts: data.failedAttempts,
          lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : null,
          lastAttempt: new Date(data.lastAttempt),
          updatedAt: new Date(),
        },
      });
  }

  async resetUserLockout(userId: string): Promise<void> {
    await db
      .update(accountLockouts)
      .set({
        failedAttempts: 0,
        lockedUntil: null,
        resetAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(accountLockouts.userId, userId));
  }

  // Session management
  async getSession(sessionId: string): Promise<any> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId));
    
    return session;
  }

  async createSession(session: {
    userId: string;
    deviceInfo: any;
    createdAt: number;
    lastActivity: number;
  }): Promise<string> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await db.insert(userSessions).values({
      id: sessionId,
      userId: session.userId,
      deviceInfo: session.deviceInfo,
      lastActivity: new Date(session.lastActivity),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(session.createdAt),
    });
    
    return sessionId;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await db
      .update(userSessions)
      .set({
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend expiry
      })
      .where(eq(userSessions.id, sessionId));
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.id, sessionId));
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userSessions)
      .where(and(
        eq(userSessions.userId, userId),
        eq(userSessions.isActive, true)
      ));
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.userId, userId));
  }

  // Audit logging
  async createAuditLog(log: {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: any;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    riskLevel: string;
  }): Promise<void> {
    await db.insert(auditLogs).values({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      success: log.success,
      riskLevel: log.riskLevel,
      timestamp: new Date(),
    });
  }

  // Document storage operations
  async createDocument(document: InsertDocumentStorage): Promise<DocumentStorage> {
    const result = await db
      .insert(documentStorage)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async getDocument(id: number): Promise<DocumentStorage | undefined> {
    const [document] = await db
      .select()
      .from(documentStorage)
      .where(eq(documentStorage.id, id));
    return document;
  }

  async getDocuments(filters?: { entityType?: string; entityId?: number; documentType?: string }): Promise<DocumentStorage[]> {
    const conditions = [];
    
    if (filters?.entityType) {
      conditions.push(eq(documentStorage.entityType, filters.entityType));
    }
    if (filters?.entityId) {
      conditions.push(eq(documentStorage.entityId, filters.entityId));
    }
    if (filters?.documentType) {
      conditions.push(eq(documentStorage.documentType, filters.documentType));
    }
    
    if (conditions.length > 0) {
      return await db.select().from(documentStorage)
        .where(and(...conditions))
        .orderBy(desc(documentStorage.createdAt));
    }
    
    return await db.select().from(documentStorage)
      .orderBy(desc(documentStorage.createdAt));
  }

  async updateDocument(id: number, updates: Partial<DocumentStorage>): Promise<DocumentStorage> {
    const [updatedDocument] = await db
      .update(documentStorage)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(documentStorage.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documentStorage).where(eq(documentStorage.id, id));
  }

  async searchDocuments(query: string, filters?: { entityType?: string; documentType?: string }): Promise<DocumentStorage[]> {
    const conditions = [
      sql`${documentStorage.originalName} ILIKE ${`%${query}%`} OR 
          ${documentStorage.description} ILIKE ${`%${query}%`} OR 
          array_to_string(${documentStorage.tags}, ' ') ILIKE ${`%${query}%`}`
    ];

    if (filters?.entityType) {
      conditions.push(eq(documentStorage.entityType, filters.entityType));
    }
    if (filters?.documentType) {
      conditions.push(eq(documentStorage.documentType, filters.documentType));
    }

    return await db
      .select()
      .from(documentStorage)
      .where(and(...conditions))
      .orderBy(desc(documentStorage.createdAt));
  }

  // File sharing operations
  async createFileShare(share: InsertFileSharing): Promise<FileSharing> {
    const [newShare] = await db
      .insert(fileSharing)
      .values({
        ...share,
        createdAt: new Date(),
      })
      .returning();
    return newShare;
  }

  async getFileShares(documentId: number): Promise<FileSharing[]> {
    return await db
      .select()
      .from(fileSharing)
      .where(and(
        eq(fileSharing.documentId, documentId),
        eq(fileSharing.isRevoked, false)
      ))
      .orderBy(desc(fileSharing.createdAt));
  }

  async updateFileShare(id: number, updates: Partial<FileSharing>): Promise<FileSharing> {
    const [updatedShare] = await db
      .update(fileSharing)
      .set(updates)
      .where(eq(fileSharing.id, id))
      .returning();
    return updatedShare;
  }

  async revokeFileShare(id: number): Promise<void> {
    await db
      .update(fileSharing)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(fileSharing.id, id));
  }

  // File access logging
  async logFileAccess(log: InsertFileAccessLog): Promise<FileAccessLog> {
    const [newLog] = await db
      .insert(fileAccessLogs)
      .values({
        ...log,
        createdAt: new Date(),
      })
      .returning();
    return newLog;
  }

  async getFileAccessLogs(documentId: number): Promise<FileAccessLog[]> {
    return await db
      .select()
      .from(fileAccessLogs)
      .where(eq(fileAccessLogs.documentId, documentId))
      .orderBy(desc(fileAccessLogs.createdAt));
  }

  // File backup operations
  async createBackupRecord(backup: InsertFileBackupRecord): Promise<FileBackupRecord> {
    const [newBackup] = await db
      .insert(fileBackupRecords)
      .values({
        ...backup,
        createdAt: new Date(),
      })
      .returning();
    return newBackup;
  }

  async getBackupRecords(): Promise<FileBackupRecord[]> {
    return await db
      .select()
      .from(fileBackupRecords)
      .orderBy(desc(fileBackupRecords.createdAt));
  }

  async updateBackupRecord(id: number, updates: Partial<FileBackupRecord>): Promise<FileBackupRecord> {
    const [updatedBackup] = await db
      .update(fileBackupRecords)
      .set(updates)
      .where(eq(fileBackupRecords.id, id))
      .returning();
    return updatedBackup;
  }
}

export const storage = new DatabaseStorage();
