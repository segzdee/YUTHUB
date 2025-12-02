import { z } from 'zod';

// Authentication schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationType: z.enum(['housing_association', 'local_authority', 'charity', 'private_provider']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Resident schemas
export const createResidentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().optional().nullable(),
  property_id: z.string().uuid('Invalid property ID').optional().nullable(),
  room_id: z.string().uuid('Invalid room ID').optional().nullable(),
  status: z.enum(['active', 'inactive', 'moved_on', 'archived']).default('active'),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say', 'other']).optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  emergency_contact_relationship: z.string().optional().nullable(),
  medical_info: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  dietary_requirements: z.string().optional().nullable(),
  admission_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  expected_move_on_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export const updateResidentSchema = createResidentSchema.partial();

// Property schemas
export const createPropertySchema = z.object({
  property_name: z.string().min(1, 'Property name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  county: z.string().optional().nullable(),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, 'Invalid UK postcode').optional().nullable(),
  country: z.string().default('United Kingdom'),
  property_type: z.enum(['house', 'flat', 'hostel', 'supported_housing', 'semi_independent']).optional(),
  total_beds: z.number().int().min(0, 'Total beds must be 0 or more'),
  occupied_beds: z.number().int().min(0, 'Occupied beds must be 0 or more').default(0),
  status: z.enum(['active', 'inactive', 'maintenance', 'full']).default('active'),
});

export const updatePropertySchema = createPropertySchema.partial();

export const createRoomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  floor: z.string().optional().nullable(),
  room_type: z.enum(['single', 'double', 'shared', 'ensuite', 'studio']).optional(),
  is_occupied: z.boolean().default(false),
  status: z.enum(['available', 'occupied', 'maintenance', 'reserved']).default('available'),
});

// Support Plan schemas
export const createSupportPlanSchema = z.object({
  resident_id: z.string().uuid('Invalid resident ID'),
  plan_name: z.string().min(1, 'Plan name is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'completed', 'archived', 'on_hold']).default('active'),
  key_worker_id: z.string().uuid('Invalid key worker ID').optional().nullable(),
  support_hours_per_week: z.number().min(0).optional().nullable(),
  outcomes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateSupportPlanSchema = createSupportPlanSchema.partial();

export const createGoalSchema = z.object({
  goal_description: z.string().min(1, 'Goal description is required'),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  category: z.enum(['education', 'employment', 'health', 'life_skills', 'relationships', 'housing', 'financial', 'other']).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold', 'abandoned']).default('not_started'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  progress_percentage: z.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

// Incident schemas
export const createIncidentSchema = z.object({
  resident_id: z.string().uuid('Invalid resident ID').optional().nullable(),
  title: z.string().min(1, 'Incident title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['behavioral', 'medical', 'safeguarding', 'property_damage', 'missing_person', 'police_involved', 'other']),
  location: z.string().optional().nullable(),
  witnesses: z.string().optional().nullable(),
  actions_taken: z.string().optional().nullable(),
  police_notified: z.boolean().default(false),
  police_reference: z.string().optional().nullable(),
  ambulance_called: z.boolean().default(false),
  status: z.enum(['reported', 'investigating', 'resolved', 'escalated']).default('reported'),
});

export const updateIncidentSchema = createIncidentSchema.partial();

// Safeguarding schemas
export const createSafeguardingConcernSchema = z.object({
  resident_id: z.string().uuid('Invalid resident ID'),
  concern_type: z.enum(['abuse', 'neglect', 'exploitation', 'self_harm', 'substance_misuse', 'welfare', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  reported_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  immediate_action_taken: z.string().optional().nullable(),
  local_authority_notified: z.boolean().default(false),
  police_notified: z.boolean().default(false),
  status: z.enum(['open', 'investigating', 'action_plan_in_place', 'closed']).default('open'),
  outcome: z.string().optional().nullable(),
});

export const updateSafeguardingConcernSchema = createSafeguardingConcernSchema.partial();

// User management schemas
export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'manager', 'staff', 'viewer']),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'manager', 'staff', 'viewer']),
});

// Organization schemas
export const updateOrganizationSchema = z.object({
  display_name: z.string().min(1).optional(),
  organization_type: z.enum(['housing_association', 'local_authority', 'charity', 'private_provider']).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  county: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url().optional().nullable(),
  charity_number: z.string().optional().nullable(),
  company_number: z.string().optional().nullable(),
  ofsted_registration: z.string().optional().nullable(),
});

// Report schemas
export const generateReportSchema = z.object({
  reportType: z.enum(['occupancy', 'outcomes', 'incidents', 'financials', 'safeguarding', 'custom']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  parameters: z.record(z.any()).optional(),
});

// Billing schemas
export const createCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export const createPortalSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default('20'),
});

export const residentQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'inactive', 'moved_on', 'archived']).optional(),
  search: z.string().optional(),
  propertyId: z.string().uuid().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const incidentQuerySchema = paginationSchema.extend({
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['reported', 'investigating', 'resolved', 'escalated']).optional(),
  residentId: z.string().uuid().optional(),
});
