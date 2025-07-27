import {
  type Property,
  type Resident,
  type UpsertUser,
  type User,
} from '@shared/schema';

interface DashboardMetrics {
  totalProperties: number;
  totalResidents: number;
  occupancyRate: number;
  maintenanceRequests: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'maintenance' | 'incident' | 'payment' | 'resident_update';
  description: string;
  timestamp: Date;
  userId?: string;
  propertyId?: number;
}

interface BillingAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  topClients: TopClient[];
}

interface TopClient {
  clientId: number;
  clientName: string;
  totalAmount: number;
  invoiceCount: number;
}

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

  // Required method signatures
  getProperties(): Promise<Property[]>;
  getResidents(): Promise<Resident[]>;
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getBillingAnalytics(): Promise<BillingAnalytics>;
}
