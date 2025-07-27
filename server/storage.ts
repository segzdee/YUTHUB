import {
  accountLockouts,
  auditLogs,
  auditTrail,
  billingPeriods,
  documentStorage,
  fileAccessLogs,
  fileBackupRecords,
  fileSharing,
  governmentClients,
  invoiceLineItems,
  invoices,
  paymentReminders,
  progressTracking,
  properties,
  residents,
  supportLevelRates,
  userSessions,
  type AuditTrail,
  type BillingPeriod,
  type DocumentStorage,
  type FileAccessLog,
  type FileBackupRecord,
  type FileSharing,
  type GovernmentClient,
  type InsertAuditTrail,
  type InsertBillingPeriod,
  type InsertDocumentStorage,
  type InsertFileAccessLog,
  type InsertFileBackupRecord,
  type InsertFileSharing,
  type InsertGovernmentClient,
  type InsertInvoice,
  type InsertInvoiceLineItem,
  type InsertPaymentReminder,
  type InsertProgressTracking,
  type InsertSupportLevelRate,
  type Invoice,
  type InvoiceLineItem,
  type PaymentReminder,
  type ProgressTracking,
  type Property,
  type Resident,
  type SupportLevelRate,
  type UpsertUser,
  type User,
} from '@shared/schema';
import { and, count, desc, eq, sql, sum } from 'drizzle-orm';
import { db } from './db';

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserSubscription(
    id: string,
    subscription: {
      tier: string;
      status: string;
      maxResidents: number;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<User>;

  // Add missing method signatures
  getProperties(): Promise<Property[]>;
  getResidents(): Promise<Resident[]>;
  getDashboardMetrics(): Promise<any>;
}

class DatabaseStorage implements IStorage {
  // Add missing method implementations
  async getProperties(): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt));
  }

  async getResidents(): Promise<Resident[]> {
    return await db.select().from(residents).orderBy(desc(residents.createdAt));
  }

  async getDashboardMetrics(): Promise<{
    totalProperties: number;
    totalResidents: number;
    occupancyRate: number;
    maintenanceRequests: number;
    recentActivity: any[];
  }> {
    const [propertiesCount] = await db
      .select({ count: count() })
      .from(properties);
    const [residentsCount] = await db
      .select({ count: count() })
      .from(residents);

    // Calculate occupancy rate
    const [occupiedProperties] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.status, 'occupied'));

    const occupancyRate =
      propertiesCount.count > 0
        ? (occupiedProperties.count / propertiesCount.count) * 100
        : 0;

    return {
      totalProperties: propertiesCount.count,
      totalResidents: residentsCount.count,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      maintenanceRequests: 0, // Implement based on your maintenance schema
      recentActivity: [], // Implement based on your activity schema
    };
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

    // Top clients with proper null handling
    const topClients = await db
      .select({
        clientId: invoices.governmentClientId,
        clientName: governmentClients.clientName,
        totalAmount: sum(invoices.totalAmount),
        invoiceCount: count(invoices.id),
      })
      .from(invoices)
      .innerJoin(
        governmentClients,
        eq(invoices.governmentClientId, governmentClients.id)
      )
      .where(sql`${invoices.governmentClientId} IS NOT NULL`)
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

  async updateUserLockout(
    userId: string,
    data: {
      failedAttempts: number;
      lockedUntil: number | null;
      lastAttempt: number;
    }
  ): Promise<void> {
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
  async getSession(sessionId: number): Promise<any> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId));

    return session;
  }

  async createSession(session: {
    userId: string;
    sessionToken: string;
    deviceInfo: any;
    expiresAt: Date;
  }): Promise<number> {
    const [result] = await db
      .insert(userSessions)
      .values({
        userId: session.userId,
        sessionToken: session.sessionToken,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt,
        lastActivity: new Date(),
      })
      .returning({ id: userSessions.id });

    return result.id;
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await db
      .update(userSessions)
      .set({
        lastActivity: new Date(),
      })
      .where(eq(userSessions.id, sessionId));
  }

  async deleteSession(sessionId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.id, sessionId));
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userSessions)
      .where(
        and(eq(userSessions.userId, userId), eq(userSessions.isActive, true))
      );
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
  async createDocument(
    document: InsertDocumentStorage
  ): Promise<DocumentStorage> {
    const result = await db
      .insert(documentStorage)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Failed to create document');
    }
    return result[0];
  }

  async getDocument(id: number): Promise<DocumentStorage | undefined> {
    const [document] = await db
      .select()
      .from(documentStorage)
      .where(eq(documentStorage.id, id));
    return document;
  }

  async getDocuments(filters?: {
    entityType?: string;
    entityId?: number;
    documentType?: string;
  }): Promise<DocumentStorage[]> {
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
      return await db
        .select()
        .from(documentStorage)
        .where(and(...conditions))
        .orderBy(desc(documentStorage.createdAt));
    }

    return await db
      .select()
      .from(documentStorage)
      .orderBy(desc(documentStorage.createdAt));
  }

  async updateDocument(
    id: number,
    updates: Partial<DocumentStorage>
  ): Promise<DocumentStorage> {
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

  async searchDocuments(
    query: string,
    filters?: { entityType?: string; documentType?: string }
  ): Promise<DocumentStorage[]> {
    const conditions = [
      sql`${documentStorage.originalName} ILIKE ${`%${query}%`} OR 
          ${documentStorage.description} ILIKE ${`%${query}%`} OR 
          array_to_string(${documentStorage.tags}, ' ') ILIKE ${`%${query}%`}`,
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
      .where(
        and(
          eq(fileSharing.documentId, documentId),
          eq(fileSharing.isRevoked, false)
        )
      )
      .orderBy(desc(fileSharing.createdAt));
  }

  async updateFileShare(
    id: number,
    updates: Partial<FileSharing>
  ): Promise<FileSharing> {
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
  async createBackupRecord(
    backup: InsertFileBackupRecord
  ): Promise<FileBackupRecord> {
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

  async updateBackupRecord(
    id: number,
    updates: Partial<FileBackupRecord>
  ): Promise<FileBackupRecord> {
    const [updatedBackup] = await db
      .update(fileBackupRecords)
      .set(updates)
      .where(eq(fileBackupRecords.id, id))
      .returning();
    return updatedBackup;
  }

  // Progress tracking operations
  async createProgressTracking(
    tracking: InsertProgressTracking
  ): Promise<ProgressTracking> {
    const [newTracking] = await db
      .insert(progressTracking)
      .values(tracking)
      .returning();
    return newTracking;
  }

  async updateProgressTracking(
    id: number,
    tracking: Partial<InsertProgressTracking>
  ): Promise<ProgressTracking> {
    const [updatedTracking] = await db
      .update(progressTracking)
      .set({ ...tracking, lastUpdated: new Date() })
      .where(eq(progressTracking.id, id))
      .returning();
    return updatedTracking;
  }

  // Billing operations implementation
  // Government clients
  async getGovernmentClients(): Promise<GovernmentClient[]> {
    return await db
      .select()
      .from(governmentClients)
      .orderBy(desc(governmentClients.createdAt));
  }

  async getGovernmentClient(id: number): Promise<GovernmentClient | undefined> {
    const [client] = await db
      .select()
      .from(governmentClients)
      .where(eq(governmentClients.id, id));
    return client;
  }

  async createGovernmentClient(
    client: InsertGovernmentClient
  ): Promise<GovernmentClient> {
    const [newClient] = await db
      .insert(governmentClients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateGovernmentClient(
    id: number,
    client: Partial<InsertGovernmentClient>
  ): Promise<GovernmentClient> {
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
    return await db
      .select()
      .from(supportLevelRates)
      .where(eq(supportLevelRates.isActive, true));
  }

  async getSupportLevelRate(id: number): Promise<SupportLevelRate | undefined> {
    const [rate] = await db
      .select()
      .from(supportLevelRates)
      .where(eq(supportLevelRates.id, id));
    return rate;
  }

  async createSupportLevelRate(
    rate: InsertSupportLevelRate
  ): Promise<SupportLevelRate> {
    const [newRate] = await db
      .insert(supportLevelRates)
      .values(rate)
      .returning();
    return newRate;
  }

  async updateSupportLevelRate(
    id: number,
    rate: Partial<InsertSupportLevelRate>
  ): Promise<SupportLevelRate> {
    const [updatedRate] = await db
      .update(supportLevelRates)
      .set({ ...rate, updatedAt: new Date() })
      .where(eq(supportLevelRates.id, id))
      .returning();
    return updatedRate;
  }

  async deleteSupportLevelRate(id: number): Promise<void> {
    await db
      .update(supportLevelRates)
      .set({ isActive: false })
      .where(eq(supportLevelRates.id, id));
  }

  // Billing periods
  async getBillingPeriods(): Promise<BillingPeriod[]> {
    return await db
      .select()
      .from(billingPeriods)
      .orderBy(desc(billingPeriods.createdAt));
  }

  async getBillingPeriod(id: number): Promise<BillingPeriod | undefined> {
    const [period] = await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.id, id));
    return period;
  }

  async createBillingPeriod(
    period: InsertBillingPeriod
  ): Promise<BillingPeriod> {
    const [newPeriod] = await db
      .insert(billingPeriods)
      .values(period)
      .returning();
    return newPeriod;
  }

  async updateBillingPeriod(
    id: number,
    period: Partial<InsertBillingPeriod>
  ): Promise<BillingPeriod> {
    const [updatedPeriod] = await db
      .update(billingPeriods)
      .set({ ...period, updatedAt: new Date() })
      .where(eq(billingPeriods.id, id))
      .returning();
    return updatedPeriod;
  }

  async getBillingPeriodsByClient(clientId: number): Promise<BillingPeriod[]> {
    return await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.governmentClientId, clientId));
  }

  async getBillingPeriodsByResident(
    residentId: number
  ): Promise<BillingPeriod[]> {
    return await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.residentId, residentId));
  }

  async getActiveBillingPeriods(): Promise<BillingPeriod[]> {
    return await db
      .select()
      .from(billingPeriods)
      .where(eq(billingPeriods.status, 'active'));
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id));
    return invoice;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async updateInvoice(
    id: number,
    invoice: Partial<InsertInvoice>
  ): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.governmentClientId, clientId));
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.status, 'sent'),
          sql`${invoices.dueDate} < CURRENT_DATE`
        )
      );
  }

  async getPendingInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, 'pending'));
  }

  async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    const [lastInvoice] = await db
      .select()
      .from(invoices)
      .where(
        sql`${invoices.invoiceNumber} LIKE ${currentYear + currentMonth + '%'}`
      )
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1);

    let nextNumber = 1;
    if (lastInvoice?.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `${currentYear}${currentMonth}${String(nextNumber).padStart(4, '0')}`;
  }

  // Invoice line items
  async getInvoiceLineItems(invoiceId: number): Promise<InvoiceLineItem[]> {
    return await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, invoiceId));
  }

  async createInvoiceLineItem(
    lineItem: InsertInvoiceLineItem
  ): Promise<InvoiceLineItem> {
    const [newLineItem] = await db
      .insert(invoiceLineItems)
      .values(lineItem)
      .returning();
    return newLineItem;
  }

  async updateInvoiceLineItem(
    id: number,
    lineItem: Partial<InsertInvoiceLineItem>
  ): Promise<InvoiceLineItem> {
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
      return await db
        .select()
        .from(paymentReminders)
        .where(eq(paymentReminders.invoiceId, invoiceId));
    }
    return await db
      .select()
      .from(paymentReminders)
      .orderBy(desc(paymentReminders.createdAt));
  }

  async createPaymentReminder(
    reminder: InsertPaymentReminder
  ): Promise<PaymentReminder> {
    const [newReminder] = await db
      .insert(paymentReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updatePaymentReminder(
    id: number,
    reminder: Partial<InsertPaymentReminder>
  ): Promise<PaymentReminder> {
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

  async getAuditTrail(
    entityType?: string,
    entityId?: string
  ): Promise<AuditTrail[]> {
    if (entityType && entityId) {
      return await db
        .select()
        .from(auditTrail)
        .where(
          and(
            eq(auditTrail.entityType, entityType),
            eq(auditTrail.entityId, entityId)
          )
        )
        .orderBy(desc(auditTrail.timestamp));
    } else if (entityType) {
      return await db
        .select()
        .from(auditTrail)
        .where(eq(auditTrail.entityType, entityType))
        .orderBy(desc(auditTrail.timestamp));
    }

    return await db
      .select()
      .from(auditTrail)
      .orderBy(desc(auditTrail.timestamp));
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
      .innerJoin(
        governmentClients,
        eq(invoices.governmentClientId, governmentClients.id)
      )
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

  async updateUserLockout(
    userId: string,
    data: {
      failedAttempts: number;
      lockedUntil: number | null;
      lastAttempt: number;
    }
  ): Promise<void> {
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
  async getSession(sessionId: number): Promise<any> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId));

    return session;
  }

  async createSession(session: {
    userId: string;
    sessionToken: string;
    deviceInfo: any;
    expiresAt: Date;
  }): Promise<number> {
    const [result] = await db
      .insert(userSessions)
      .values({
        userId: session.userId,
        sessionToken: session.sessionToken,
        deviceInfo: session.deviceInfo,
        expiresAt: session.expiresAt,
        lastActivity: new Date(),
      })
      .returning({ id: userSessions.id });

    return result.id;
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await db
      .update(userSessions)
      .set({
        lastActivity: new Date(),
      })
      .where(eq(userSessions.id, sessionId));
  }

  async deleteSession(sessionId: number): Promise<void> {
    await db.delete(userSessions).where(eq(userSessions.id, sessionId));
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userSessions)
      .where(
        and(eq(userSessions.userId, userId), eq(userSessions.isActive, true))
      );
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
  async createDocument(
    document: InsertDocumentStorage
  ): Promise<DocumentStorage> {
    const result = await db
      .insert(documentStorage)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('Failed to create document');
    }
    return result[0];
  }

  async getDocument(id: number): Promise<DocumentStorage | undefined> {
    const [document] = await db
      .select()
      .from(documentStorage)
      .where(eq(documentStorage.id, id));
    return document;
  }

  async getDocuments(filters?: {
    entityType?: string;
    entityId?: number;
    documentType?: string;
  }): Promise<DocumentStorage[]> {
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
      return await db
        .select()
        .from(documentStorage)
        .where(and(...conditions))
        .orderBy(desc(documentStorage.createdAt));
    }

    return await db
      .select()
      .from(documentStorage)
      .orderBy(desc(documentStorage.createdAt));
  }

  async updateDocument(
    id: number,
    updates: Partial<DocumentStorage>
  ): Promise<DocumentStorage> {
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

  async searchDocuments(
    query: string,
    filters?: { entityType?: string; documentType?: string }
  ): Promise<DocumentStorage[]> {
    const conditions = [
      sql`${documentStorage.originalName} ILIKE ${`%${query}%`} OR 
          ${documentStorage.description} ILIKE ${`%${query}%`} OR 
          array_to_string(${documentStorage.tags}, ' ') ILIKE ${`%${query}%`}`,
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
      .where(
        and(
          eq(fileSharing.documentId, documentId),
          eq(fileSharing.isRevoked, false)
        )
      )
      .orderBy(desc(fileSharing.createdAt));
  }

  async updateFileShare(
    id: number,
    updates: Partial<FileSharing>
  ): Promise<FileSharing> {
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
  async createBackupRecord(
    backup: InsertFileBackupRecord
  ): Promise<FileBackupRecord> {
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

  async updateBackupRecord(
    id: number,
    updates: Partial<FileBackupRecord>
  ): Promise<FileBackupRecord> {
    const [updatedBackup] = await db
      .update(fileBackupRecords)
      .set(updates)
      .where(eq(fileBackupRecords.id, id))
      .returning();
    return updatedBackup;
  }
}

export const storage = new DatabaseStorage();
