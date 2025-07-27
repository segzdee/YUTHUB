import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import * as schema from './schema';

// Database entity types
export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Property = InferSelectModel<typeof schema.properties>;
export type NewProperty = InferInsertModel<typeof schema.properties>;

export type Resident = InferSelectModel<typeof schema.residents>;
export type NewResident = InferInsertModel<typeof schema.residents>;

export type SupportPlan = InferSelectModel<typeof schema.supportPlans>;
export type NewSupportPlan = InferInsertModel<typeof schema.supportPlans>;

export type Organization = InferSelectModel<typeof schema.organizations>;
export type NewOrganization = InferInsertModel<typeof schema.organizations>;

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: PaginationInfo;
    timestamp: string;
    organizationId?: number;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// WebSocket message interfaces
export interface WebSocketMessage {
  type:
    | 'update'
    | 'notification'
    | 'metric_change'
    | 'incident_alert'
    | 'connection_established'
    | 'pong';
  data: Record<string, unknown>;
  timestamp: string;
  clientId?: string;
}

// Form interfaces
export interface FormStepData {
  [key: string]: unknown;
}

export interface FormStep {
  id: string;
  title: string;
  component: React.ComponentType<FormStepProps>;
  validation?: (data: FormStepData) => boolean;
}

export interface FormStepProps {
  data: FormStepData;
  onDataChange: (data: FormStepData) => void;
}

// Device and session interfaces
export interface DeviceInfo {
  browser?: string;
  os?: string;
  ip?: string;
  userAgent?: string;
}

export interface SessionDetails {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  lastActivity: Date;
  expiresAt: Date;
}

// Audit and security interfaces
export interface AuditLogEntry {
  id: number;
  userId?: string;
  action: string;
  provider?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

// Error handling interfaces
export interface ErrorDetails {
  code?: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

// File upload interfaces
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  filename: string;
  path: string;
}

// Authentication interfaces
export interface AuthenticatedRequest {
  user?: {
    claims?: {
      sub: string;
    };
    id?: string;
    role?: string;
  };
}
