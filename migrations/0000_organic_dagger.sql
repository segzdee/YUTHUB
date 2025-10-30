CREATE TABLE "account_lockouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"failed_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"last_attempt" timestamp,
	"last_attempt_ip" varchar,
	"reset_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"activity_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"entity_id" integer,
	"entity_type" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token_hash" varchar NOT NULL,
	"name" varchar NOT NULL,
	"permissions" text[],
	"last_used" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"assessment_type" varchar NOT NULL,
	"assessor_id" integer NOT NULL,
	"responses" jsonb NOT NULL,
	"score" integer,
	"recommendations" text,
	"next_review_date" date,
	"status" varchar DEFAULT 'completed',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_tag" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"manufacturer" varchar,
	"model" varchar,
	"serial_number" varchar,
	"purchase_date" date,
	"purchase_price" numeric(10, 2),
	"warranty_expiry" date,
	"property_id" integer,
	"room_id" integer,
	"condition" varchar DEFAULT 'good',
	"last_inspection" date,
	"next_inspection" date,
	"maintenance_schedule" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "assets_asset_tag_unique" UNIQUE("asset_tag")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"action" varchar NOT NULL,
	"resource" varchar NOT NULL,
	"resource_id" varchar,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"success" boolean NOT NULL,
	"risk_level" varchar DEFAULT 'low',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_trail" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"old_values" text,
	"new_values" text,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"action" varchar NOT NULL,
	"provider" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"success" boolean DEFAULT false,
	"failure_reason" varchar,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_cycles" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"cycle_type" varchar NOT NULL,
	"cycle_start" timestamp NOT NULL,
	"cycle_end" timestamp NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"discount_percent" integer DEFAULT 0,
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'active',
	"due_date" timestamp NOT NULL,
	"paid_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer,
	"government_client_id" integer,
	"property_id" integer,
	"start_date" date NOT NULL,
	"end_date" date,
	"support_level" text NOT NULL,
	"rate_type" text NOT NULL,
	"daily_rate" numeric(10, 2) NOT NULL,
	"additional_services" text[],
	"service_charges" numeric(10, 2) DEFAULT '0.00',
	"total_days" integer,
	"total_amount" numeric(10, 2),
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"event_type" varchar NOT NULL,
	"location" varchar,
	"organizer" varchar NOT NULL,
	"attendees" text[],
	"resident_id" integer,
	"property_id" integer,
	"status" varchar DEFAULT 'scheduled',
	"is_recurring" boolean DEFAULT false,
	"recurrence_rule" jsonb,
	"reminder_set" boolean DEFAULT false,
	"reminder_time" integer DEFAULT 15,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cancellation_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"requested_by" varchar NOT NULL,
	"request_date" timestamp NOT NULL,
	"cancellation_type" varchar NOT NULL,
	"scheduled_date" timestamp,
	"reason" text,
	"feedback" text,
	"status" varchar DEFAULT 'pending',
	"processed_by" varchar,
	"processed_at" timestamp,
	"refund_amount" numeric(10, 2),
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"staff_id" varchar NOT NULL,
	"communication_type" varchar NOT NULL,
	"direction" varchar NOT NULL,
	"subject" varchar,
	"content" text NOT NULL,
	"outcome" varchar,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" date,
	"is_confidential" boolean DEFAULT false,
	"attachments" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"template_type" varchar NOT NULL,
	"purpose" varchar NOT NULL,
	"subject" varchar,
	"content" text NOT NULL,
	"variables" text[],
	"organization_id" integer,
	"created_by" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" serial PRIMARY KEY NOT NULL,
	"complaint_number" varchar NOT NULL,
	"complainant_type" varchar NOT NULL,
	"complainant_id" integer,
	"complainant_details" jsonb,
	"complaint_category" varchar NOT NULL,
	"description" text NOT NULL,
	"severity" varchar DEFAULT 'medium',
	"assigned_to" varchar,
	"status" varchar DEFAULT 'received',
	"resolution" text,
	"actions_taken" text,
	"resolution_date" date,
	"is_upheld" boolean,
	"appeal_deadline" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "complaints_complaint_number_unique" UNIQUE("complaint_number")
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar NOT NULL,
	"contact_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"address" text,
	"specializations" text[],
	"certifications" text[],
	"insurance_details" jsonb,
	"emergency_contact" boolean DEFAULT false,
	"preferred_contractor" boolean DEFAULT false,
	"payment_terms" integer DEFAULT 30,
	"hourly_rate" numeric(10, 2),
	"call_out_fee" numeric(10, 2),
	"rating" integer DEFAULT 5,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crisis_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"team_leader" varchar NOT NULL,
	"members" text[],
	"specializations" text[],
	"availability" jsonb,
	"contact_details" jsonb,
	"escalation_level" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"widget_type" varchar NOT NULL,
	"widget_name" varchar NOT NULL,
	"configuration" jsonb NOT NULL,
	"position" jsonb,
	"is_visible" boolean DEFAULT true,
	"refresh_interval" integer DEFAULT 300,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" varchar NOT NULL,
	"original_name" varchar NOT NULL,
	"mime_type" varchar NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"thumbnail_path" text,
	"uploaded_by" varchar NOT NULL,
	"entity_type" varchar NOT NULL,
	"entity_id" integer NOT NULL,
	"document_type" varchar NOT NULL,
	"tags" text[],
	"description" text,
	"is_confidential" boolean DEFAULT false,
	"retention_date" date,
	"version" integer DEFAULT 1,
	"parent_document_id" integer,
	"is_current_version" boolean DEFAULT true,
	"checksum" varchar,
	"download_count" integer DEFAULT 0,
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"contact_type" varchar NOT NULL,
	"name" varchar NOT NULL,
	"relationship" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"email" varchar,
	"address" text,
	"is_primary" boolean DEFAULT false,
	"can_contact" boolean DEFAULT true,
	"consent_date" date,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_entitlements" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"feature_key" varchar NOT NULL,
	"is_entitled" boolean DEFAULT false,
	"usage_limit" integer,
	"current_usage" integer DEFAULT 0,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_toggles" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"feature_key" varchar NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"enabled_by" varchar,
	"enabled_at" timestamp,
	"disabled_at" timestamp,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"success" boolean DEFAULT true,
	"error_message" text,
	"file_size" integer,
	"download_duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_backup_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"backup_date" date NOT NULL,
	"backup_type" varchar NOT NULL,
	"backup_location" text NOT NULL,
	"total_files" integer NOT NULL,
	"total_size" integer NOT NULL,
	"backup_status" varchar DEFAULT 'in_progress',
	"backup_duration" integer,
	"verification_status" varchar,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "file_sharing" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"shared_by" varchar NOT NULL,
	"shared_with" varchar NOT NULL,
	"access_level" varchar DEFAULT 'view',
	"expires_at" timestamp,
	"is_revoked" boolean DEFAULT false,
	"revoked_at" timestamp,
	"share_reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"resident_id" integer,
	"record_type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"due_date" date,
	"paid_date" date,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "form_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"form_type" varchar NOT NULL,
	"form_data" jsonb NOT NULL,
	"step" integer DEFAULT 1,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "government_clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"client_type" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"billing_address" text NOT NULL,
	"payment_terms" integer DEFAULT 30,
	"default_rate" numeric(10, 2),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"resident_id" integer,
	"reported_by" varchar,
	"incident_type" varchar NOT NULL,
	"severity" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"status" varchar DEFAULT 'open',
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inspections" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"room_id" integer,
	"inspection_type" varchar NOT NULL,
	"inspector_id" varchar,
	"contractor_id" integer,
	"scheduled_date" date NOT NULL,
	"completed_date" date,
	"status" varchar DEFAULT 'scheduled',
	"pass_status" varchar,
	"checklist" jsonb,
	"findings" text,
	"recommendations" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" date,
	"certificate" varchar,
	"images" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insurance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"policy_number" varchar NOT NULL,
	"property_id" integer,
	"organization_id" integer,
	"insurance_type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"coverage" jsonb,
	"premium" numeric(10, 2) NOT NULL,
	"excess" numeric(10, 2),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"renewal_date" date,
	"claims" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "insurance_records_policy_number_unique" UNIQUE("policy_number")
);
--> statement-breakpoint
CREATE TABLE "integration_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"integration" varchar NOT NULL,
	"operation" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" integer,
	"request_data" jsonb,
	"response_data" jsonb,
	"status" varchar NOT NULL,
	"error_code" varchar,
	"error_message" text,
	"processing_time" integer,
	"retry_count" integer DEFAULT 0,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer,
	"billing_period_id" integer,
	"resident_anonymized_id" text NOT NULL,
	"description" text NOT NULL,
	"service_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_rate" numeric(10, 2) NOT NULL,
	"line_total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"government_client_id" integer,
	"billing_period_start" date NOT NULL,
	"billing_period_end" date NOT NULL,
	"issue_date" date NOT NULL,
	"due_date" date NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"paid_date" date,
	"paid_amount" numeric(10, 2),
	"payment_method" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"room_id" integer,
	"resident_id" integer,
	"reported_by" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"category" varchar NOT NULL,
	"status" varchar DEFAULT 'open',
	"assigned_to" integer,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"images" text[],
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_windows" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"maintenance_type" varchar NOT NULL,
	"status" varchar DEFAULT 'scheduled',
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"affected_services" text[],
	"notifications_sent" boolean DEFAULT false,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "move_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"from_property_id" integer,
	"to_property_id" integer,
	"from_room_id" integer,
	"to_room_id" integer,
	"move_type" varchar NOT NULL,
	"move_date" date NOT NULL,
	"reason" text NOT NULL,
	"planned_date" date,
	"is_emergency_move" boolean DEFAULT false,
	"handover_by" varchar,
	"handover_to" varchar,
	"inventory_checked" boolean DEFAULT false,
	"deposit_returned" boolean DEFAULT false,
	"cleaning_required" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "multi_tenant_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"setting_key" varchar NOT NULL,
	"setting_value" jsonb,
	"data_type" varchar NOT NULL,
	"is_inherited" boolean DEFAULT false,
	"parent_setting_id" integer,
	"last_modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"notification_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"category" varchar,
	"entity_type" varchar,
	"entity_id" integer,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"action_required" boolean DEFAULT false,
	"action_url" varchar,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"metric_type" varchar NOT NULL,
	"metric_value" numeric(15, 2) NOT NULL,
	"period" varchar NOT NULL,
	"period_date" date NOT NULL,
	"calculated_at" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "organization_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"inviter_user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	CONSTRAINT "organization_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"status" varchar DEFAULT 'active',
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"billing_cycle" varchar DEFAULT 'monthly',
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'GBP',
	"trial_start" timestamp,
	"trial_end" timestamp,
	"cancel_at" timestamp,
	"canceled_at" timestamp,
	"cancel_reason" text,
	"stripe_subscription_id" varchar,
	"stripe_customer_id" varchar,
	"next_billing_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"display_name" varchar,
	"description" text,
	"organization_type" varchar NOT NULL,
	"registration_number" varchar,
	"tax_number" varchar,
	"address" text,
	"phone" varchar,
	"email" varchar,
	"website" varchar,
	"logo" varchar,
	"branding" jsonb,
	"settings" jsonb,
	"subscription" jsonb,
	"parent_organization_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "outcomes_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"outcome_category" varchar NOT NULL,
	"outcome_type" varchar NOT NULL,
	"description" text NOT NULL,
	"measurable_outcome" varchar,
	"baseline_value" numeric(10, 2),
	"current_value" numeric(10, 2),
	"target_value" numeric(10, 2),
	"achievement_date" date,
	"recorded_by" varchar NOT NULL,
	"verification_method" varchar,
	"is_verified" boolean DEFAULT false,
	"verified_by" varchar,
	"verification_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "overage_charges" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"usage_type" varchar NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"allowed_usage" integer NOT NULL,
	"actual_usage" integer NOT NULL,
	"overage_amount" integer NOT NULL,
	"rate_per_unit" numeric(10, 2) NOT NULL,
	"total_charge" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending',
	"billed_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"method_type" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"stripe_payment_method_id" varchar,
	"card_last_4" varchar,
	"card_brand" varchar,
	"card_exp_month" integer,
	"card_exp_year" integer,
	"billing_name" varchar,
	"billing_email" varchar,
	"billing_address" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer,
	"reminder_type" text NOT NULL,
	"sent_date" date NOT NULL,
	"sent_to" text NOT NULL,
	"status" text DEFAULT 'sent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer,
	"invoice_id" integer,
	"payment_method_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'GBP',
	"status" varchar NOT NULL,
	"transaction_type" varchar NOT NULL,
	"stripe_payment_intent_id" varchar,
	"stripe_charge_id" varchar,
	"failure_reason" text,
	"processed_at" timestamp,
	"refunded_at" timestamp,
	"refund_amount" numeric(10, 2),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"permissions" jsonb NOT NULL,
	"role" varchar NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"target_type" varchar NOT NULL,
	"target_id" varchar,
	"organization_id" integer,
	"details" jsonb NOT NULL,
	"ip_address" varchar,
	"user_agent" varchar,
	"success" boolean NOT NULL,
	"risk_level" varchar DEFAULT 'medium',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"notification_type" varchar NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"target_audience" varchar DEFAULT 'all',
	"target_organizations" integer[],
	"is_active" boolean DEFAULT true,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"admin_user_id" varchar NOT NULL,
	"device_info" jsonb,
	"ip_address" varchar,
	"user_agent" varchar,
	"mfa_verified" boolean DEFAULT false,
	"last_activity" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"access_level" varchar DEFAULT 'admin',
	"permissions" jsonb NOT NULL,
	"mfa_enabled" boolean DEFAULT true,
	"mfa_secret" varchar,
	"ip_whitelist" text[],
	"last_login_at" timestamp,
	"login_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "progress_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"support_plan_id" integer,
	"goal_type" varchar NOT NULL,
	"goal" text NOT NULL,
	"target_date" date,
	"current_progress" integer DEFAULT 0,
	"milestones" jsonb,
	"notes" text,
	"last_updated" timestamp DEFAULT now(),
	"updated_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"address" text NOT NULL,
	"property_type" varchar NOT NULL,
	"total_units" integer NOT NULL,
	"occupied_units" integer DEFAULT 0,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"room_number" varchar NOT NULL,
	"room_type" varchar NOT NULL,
	"floor" integer,
	"capacity" integer DEFAULT 1,
	"current_occupancy" integer DEFAULT 0,
	"monthly_rent" numeric(10, 2),
	"facilities" text[],
	"status" varchar DEFAULT 'available',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"referred_by" varchar NOT NULL,
	"referral_type" varchar NOT NULL,
	"service_provider" varchar NOT NULL,
	"contact_details" jsonb,
	"reason" text NOT NULL,
	"urgency" varchar DEFAULT 'routine',
	"referral_date" date NOT NULL,
	"expected_date" date,
	"status" varchar DEFAULT 'pending',
	"outcome" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rent_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"room_id" integer,
	"payment_date" date NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar NOT NULL,
	"payment_reference" varchar,
	"payment_status" varchar DEFAULT 'pending',
	"is_partial_payment" boolean DEFAULT false,
	"outstanding_balance" numeric(10, 2) DEFAULT '0.00',
	"late_payment_fee" numeric(10, 2) DEFAULT '0.00',
	"payment_period" varchar NOT NULL,
	"notes" text,
	"processed_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"report_type" varchar NOT NULL,
	"created_by" varchar NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_shared" boolean DEFAULT false,
	"parameters" jsonb,
	"columns" jsonb,
	"formatting" jsonb,
	"schedule" jsonb,
	"recipients" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "residents" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar,
	"phone" varchar,
	"date_of_birth" date,
	"property_id" integer,
	"unit_number" varchar,
	"move_in_date" date,
	"move_out_date" date,
	"key_worker_id" varchar,
	"independence_level" integer DEFAULT 1,
	"risk_level" varchar DEFAULT 'low',
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "residents_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "revenue_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_name" varchar NOT NULL,
	"report_type" varchar NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"total_revenue" numeric(15, 2) NOT NULL,
	"subscription_revenue" numeric(15, 2) NOT NULL,
	"onetime_revenue" numeric(15, 2) DEFAULT '0.00',
	"refund_amount" numeric(15, 2) DEFAULT '0.00',
	"net_revenue" numeric(15, 2) NOT NULL,
	"organization_count" integer NOT NULL,
	"new_subscriptions" integer DEFAULT 0,
	"canceled_subscriptions" integer DEFAULT 0,
	"churn_rate" numeric(5, 2),
	"data" jsonb NOT NULL,
	"generated_by" varchar NOT NULL,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"assessor_id" varchar NOT NULL,
	"assessment_type" varchar NOT NULL,
	"risk_categories" jsonb NOT NULL,
	"overall_risk_level" varchar NOT NULL,
	"risk_factors" text[],
	"protective_factors" text[],
	"recommendations" text NOT NULL,
	"action_plan" text NOT NULL,
	"review_date" date NOT NULL,
	"escalation_required" boolean DEFAULT false,
	"escalated_to" varchar,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_name" varchar NOT NULL,
	"organization_id" integer,
	"permissions" jsonb NOT NULL,
	"is_system_role" boolean DEFAULT false,
	"description" text,
	"created_by" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"employee_id" varchar,
	"department" varchar,
	"position" varchar NOT NULL,
	"start_date" date,
	"end_date" date,
	"working_hours" jsonb,
	"contact_number" varchar,
	"emergency_contact" jsonb,
	"certifications" text[],
	"access_level" varchar DEFAULT 'standard',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "staff_members_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "subscription_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"metric_type" varchar NOT NULL,
	"metric_value" numeric(15, 2) NOT NULL,
	"period" varchar NOT NULL,
	"period_date" date NOT NULL,
	"dimensions" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"change_type" varchar NOT NULL,
	"from_plan_id" integer,
	"to_plan_id" integer,
	"from_amount" numeric(10, 2),
	"to_amount" numeric(10, 2),
	"effective_date" timestamp NOT NULL,
	"proration_amount" numeric(10, 2),
	"reason" text,
	"initiated_by" varchar,
	"status" varchar DEFAULT 'pending',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_discounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"discount_type" varchar NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"applies_to" varchar NOT NULL,
	"applicable_plans" text[],
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscription_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"feature_key" varchar NOT NULL,
	"feature_name" varchar NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"limit" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"invoice_number" varchar NOT NULL,
	"invoice_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00',
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'pending',
	"paid_date" timestamp,
	"payment_method_id" integer,
	"stripe_invoice_id" varchar,
	"stripe_payment_intent_id" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscription_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_name" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"description" text,
	"monthly_price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2) NOT NULL,
	"annual_discount_percent" integer DEFAULT 15,
	"max_residents" integer,
	"max_properties" integer,
	"max_users" integer,
	"max_api_calls" integer,
	"max_storage" integer,
	"features" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"trial_days" integer DEFAULT 14,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_renewals" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"renewal_date" timestamp NOT NULL,
	"previous_period_end" timestamp NOT NULL,
	"new_period_start" timestamp NOT NULL,
	"new_period_end" timestamp NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" varchar DEFAULT 'scheduled',
	"attempt_count" integer DEFAULT 0,
	"last_attempt_date" timestamp,
	"next_retry_date" timestamp,
	"failure_reason" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_level_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"support_level" text NOT NULL,
	"rate_type" text NOT NULL,
	"base_rate" numeric(10, 2) NOT NULL,
	"additional_services" text[],
	"service_rate" numeric(10, 2) DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer,
	"key_worker_id" varchar,
	"goals" text NOT NULL,
	"objectives" text NOT NULL,
	"review_date" date NOT NULL,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"reported_by" varchar NOT NULL,
	"assigned_to" varchar,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"status" varchar DEFAULT 'open',
	"resolution" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "survey_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_id" integer NOT NULL,
	"respondent_id" varchar,
	"respondent_type" varchar NOT NULL,
	"responses" jsonb NOT NULL,
	"is_complete" boolean DEFAULT false,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"survey_type" varchar NOT NULL,
	"target_audience" varchar NOT NULL,
	"questions" jsonb NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"start_date" date NOT NULL,
	"end_date" date,
	"created_by" varchar NOT NULL,
	"organization_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"config_key" varchar NOT NULL,
	"config_value" jsonb NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"data_type" varchar NOT NULL,
	"is_editable" boolean DEFAULT true,
	"requires_restart" boolean DEFAULT false,
	"last_modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "system_configurations_config_key_unique" UNIQUE("config_key")
);
--> statement-breakpoint
CREATE TABLE "system_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"metric_name" varchar NOT NULL,
	"metric_value" numeric(15, 4) NOT NULL,
	"unit" varchar,
	"organization_id" integer,
	"metadata" jsonb,
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenancy_agreements" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"room_id" integer,
	"agreement_type" varchar NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"monthly_rent" numeric(10, 2) NOT NULL,
	"deposit" numeric(10, 2),
	"service_charge" numeric(10, 2),
	"terms" jsonb,
	"status" varchar DEFAULT 'active',
	"document_path" varchar,
	"signed_date" timestamp,
	"witnessed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "training_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_id" varchar NOT NULL,
	"training_type" varchar NOT NULL,
	"training_name" varchar NOT NULL,
	"provider" varchar,
	"start_date" date NOT NULL,
	"end_date" date,
	"completion_date" date,
	"status" varchar DEFAULT 'enrolled',
	"certificate_number" varchar,
	"expiry_date" date,
	"renewal_required" boolean DEFAULT false,
	"cost" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trial_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'active',
	"converted_at" timestamp,
	"converted_to_subscription_id" integer,
	"extension_days" integer DEFAULT 0,
	"extension_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"limit_type" varchar NOT NULL,
	"current_value" integer DEFAULT 0,
	"limit_value" integer NOT NULL,
	"soft_limit" integer,
	"hard_limit" integer,
	"period" varchar DEFAULT 'monthly',
	"reset_date" timestamp,
	"is_blocked" boolean DEFAULT false,
	"last_warning_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"usage_type" varchar NOT NULL,
	"current_usage" integer DEFAULT 0,
	"limit" integer,
	"period" varchar DEFAULT 'monthly',
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"overage_amount" integer DEFAULT 0,
	"last_reset" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_auth_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"provider_id" varchar NOT NULL,
	"provider_email" varchar,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"provider_data" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_token" varchar NOT NULL,
	"device_info" jsonb,
	"last_activity" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'staff',
	"department" varchar,
	"employee_id" varchar,
	"primary_auth_method" varchar DEFAULT 'REPLIT',
	"password_hash" varchar,
	"password_last_changed" timestamp,
	"mfa_enabled" boolean DEFAULT false,
	"mfa_secret" varchar,
	"mfa_backup_codes" text[],
	"account_locked" boolean DEFAULT false,
	"last_login" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"email_verified" boolean DEFAULT false,
	"email_verification_token" varchar,
	"password_reset_token" varchar,
	"password_reset_expires" timestamp,
	"is_active" boolean DEFAULT true,
	"subscription_tier" varchar DEFAULT 'trial',
	"subscription_status" varchar DEFAULT 'active',
	"max_residents" integer DEFAULT 25,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"tos_accepted" boolean DEFAULT false,
	"tos_accepted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "utilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"utility_type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"account_number" varchar,
	"meter_number" varchar,
	"supply" varchar,
	"tariff" varchar,
	"monthly_estimate" numeric(10, 2),
	"last_reading" numeric(10, 2),
	"last_reading_date" date,
	"contract_start_date" date,
	"contract_end_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"workflow_type" varchar NOT NULL,
	"trigger_events" text[],
	"conditions" jsonb,
	"actions" jsonb,
	"created_by" varchar NOT NULL,
	"organization_id" integer,
	"is_active" boolean DEFAULT true,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account_lockouts" ADD CONSTRAINT "account_lockouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_forms" ADD CONSTRAINT "assessment_forms_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_forms" ADD CONSTRAINT "assessment_forms_assessor_id_staff_members_id_fk" FOREIGN KEY ("assessor_id") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_room_id_property_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_audit_log" ADD CONSTRAINT "auth_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_cycles" ADD CONSTRAINT "billing_cycles_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_government_client_id_government_clients_id_fk" FOREIGN KEY ("government_client_id") REFERENCES "public"."government_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_periods" ADD CONSTRAINT "billing_periods_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organizer_users_id_fk" FOREIGN KEY ("organizer") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cancellation_requests" ADD CONSTRAINT "cancellation_requests_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_templates" ADD CONSTRAINT "communication_templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_templates" ADD CONSTRAINT "communication_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_complainant_id_residents_id_fk" FOREIGN KEY ("complainant_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crisis_teams" ADD CONSTRAINT "crisis_teams_team_leader_users_id_fk" FOREIGN KEY ("team_leader") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "dashboard_widgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_storage" ADD CONSTRAINT "document_storage_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_storage" ADD CONSTRAINT "document_storage_parent_document_id_document_storage_id_fk" FOREIGN KEY ("parent_document_id") REFERENCES "public"."document_storage"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_entitlements" ADD CONSTRAINT "feature_entitlements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_entitlements" ADD CONSTRAINT "feature_entitlements_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_toggles" ADD CONSTRAINT "feature_toggles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_toggles" ADD CONSTRAINT "feature_toggles_enabled_by_users_id_fk" FOREIGN KEY ("enabled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_access_logs" ADD CONSTRAINT "file_access_logs_document_id_document_storage_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_access_logs" ADD CONSTRAINT "file_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_sharing" ADD CONSTRAINT "file_sharing_document_id_document_storage_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_storage"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_sharing" ADD CONSTRAINT "file_sharing_shared_by_users_id_fk" FOREIGN KEY ("shared_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_sharing" ADD CONSTRAINT "file_sharing_shared_with_users_id_fk" FOREIGN KEY ("shared_with") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_drafts" ADD CONSTRAINT "form_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_room_id_property_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_inspector_id_users_id_fk" FOREIGN KEY ("inspector_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_contractor_id_contractors_id_fk" FOREIGN KEY ("contractor_id") REFERENCES "public"."contractors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_records" ADD CONSTRAINT "insurance_records_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insurance_records" ADD CONSTRAINT "insurance_records_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_billing_period_id_billing_periods_id_fk" FOREIGN KEY ("billing_period_id") REFERENCES "public"."billing_periods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_government_client_id_government_clients_id_fk" FOREIGN KEY ("government_client_id") REFERENCES "public"."government_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_room_id_property_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assigned_to_staff_members_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_from_property_id_properties_id_fk" FOREIGN KEY ("from_property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_to_property_id_properties_id_fk" FOREIGN KEY ("to_property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_from_room_id_property_rooms_id_fk" FOREIGN KEY ("from_room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_to_room_id_property_rooms_id_fk" FOREIGN KEY ("to_room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_handover_by_users_id_fk" FOREIGN KEY ("handover_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "move_records" ADD CONSTRAINT "move_records_handover_to_users_id_fk" FOREIGN KEY ("handover_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_tenant_settings" ADD CONSTRAINT "multi_tenant_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_tenant_settings" ADD CONSTRAINT "multi_tenant_settings_parent_setting_id_multi_tenant_settings_id_fk" FOREIGN KEY ("parent_setting_id") REFERENCES "public"."multi_tenant_settings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "multi_tenant_settings" ADD CONSTRAINT "multi_tenant_settings_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_analytics" ADD CONSTRAINT "organization_analytics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_inviter_user_id_users_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_organization_id_organizations_id_fk" FOREIGN KEY ("parent_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes_tracking" ADD CONSTRAINT "outcomes_tracking_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes_tracking" ADD CONSTRAINT "outcomes_tracking_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outcomes_tracking" ADD CONSTRAINT "outcomes_tracking_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overage_charges" ADD CONSTRAINT "overage_charges_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overage_charges" ADD CONSTRAINT "overage_charges_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_reminders" ADD CONSTRAINT "payment_reminders_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_subscription_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_cache" ADD CONSTRAINT "permission_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_audit_logs" ADD CONSTRAINT "platform_audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_notifications" ADD CONSTRAINT "platform_notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_sessions" ADD CONSTRAINT "platform_sessions_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_support_plan_id_support_plans_id_fk" FOREIGN KEY ("support_plan_id") REFERENCES "public"."support_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_tracking" ADD CONSTRAINT "progress_tracking_updated_by_staff_members_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_rooms" ADD CONSTRAINT "property_rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_room_id_property_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_key_worker_id_users_id_fk" FOREIGN KEY ("key_worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_reports" ADD CONSTRAINT "revenue_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_assessor_id_users_id_fk" FOREIGN KEY ("assessor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_escalated_to_users_id_fk" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles_permissions" ADD CONSTRAINT "roles_permissions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_analytics" ADD CONSTRAINT "subscription_analytics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_from_plan_id_subscription_plans_id_fk" FOREIGN KEY ("from_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_to_plan_id_subscription_plans_id_fk" FOREIGN KEY ("to_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_changes" ADD CONSTRAINT "subscription_changes_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_discounts" ADD CONSTRAINT "subscription_discounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_features" ADD CONSTRAINT "subscription_features_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_renewals" ADD CONSTRAINT "subscription_renewals_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_renewals" ADD CONSTRAINT "subscription_renewals_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_plans" ADD CONSTRAINT "support_plans_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_plans" ADD CONSTRAINT "support_plans_key_worker_id_users_id_fk" FOREIGN KEY ("key_worker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_reported_by_users_id_fk" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_respondent_id_users_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_configurations" ADD CONSTRAINT "system_configurations_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_metrics" ADD CONSTRAINT "system_metrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_room_id_property_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."property_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancy_agreements" ADD CONSTRAINT "tenancy_agreements_witnessed_by_staff_members_id_fk" FOREIGN KEY ("witnessed_by") REFERENCES "public"."staff_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_periods" ADD CONSTRAINT "trial_periods_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_periods" ADD CONSTRAINT "trial_periods_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trial_periods" ADD CONSTRAINT "trial_periods_converted_to_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("converted_to_subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_limits" ADD CONSTRAINT "usage_limits_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_tracking" ADD CONSTRAINT "usage_tracking_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth_methods" ADD CONSTRAINT "user_auth_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utilities" ADD CONSTRAINT "utilities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activities_user_id" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_activities_activity_type" ON "activities" USING btree ("activity_type");--> statement-breakpoint
CREATE INDEX "idx_activities_entity" ON "activities" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_activities_created_at" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_assets_asset_tag" ON "assets" USING btree ("asset_tag");--> statement-breakpoint
CREATE INDEX "idx_assets_property_id" ON "assets" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_assets_category" ON "assets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_assets_condition" ON "assets" USING btree ("condition");--> statement-breakpoint
CREATE INDEX "idx_auth_audit_user_id" ON "auth_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_audit_timestamp" ON "auth_audit_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_auth_audit_action" ON "auth_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_billing_cycles_organization_id" ON "billing_cycles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_billing_cycles_subscription_id" ON "billing_cycles" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_billing_cycles_due_date" ON "billing_cycles" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_billing_cycles_status" ON "billing_cycles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_start_time" ON "calendar_events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_organizer" ON "calendar_events" USING btree ("organizer");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_resident_id" ON "calendar_events" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_property_id" ON "calendar_events" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_calendar_events_status" ON "calendar_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_cancellation_requests_organization_id" ON "cancellation_requests" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_cancellation_requests_subscription_id" ON "cancellation_requests" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_cancellation_requests_requested_by" ON "cancellation_requests" USING btree ("requested_by");--> statement-breakpoint
CREATE INDEX "idx_cancellation_requests_status" ON "cancellation_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_cancellation_requests_scheduled_date" ON "cancellation_requests" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_communication_logs_resident_id" ON "communication_logs" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_communication_logs_staff_id" ON "communication_logs" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_communication_logs_type" ON "communication_logs" USING btree ("communication_type");--> statement-breakpoint
CREATE INDEX "idx_communication_logs_created_at" ON "communication_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_communication_templates_template_type" ON "communication_templates" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "idx_communication_templates_purpose" ON "communication_templates" USING btree ("purpose");--> statement-breakpoint
CREATE INDEX "idx_communication_templates_organization_id" ON "communication_templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_complaint_number" ON "complaints" USING btree ("complaint_number");--> statement-breakpoint
CREATE INDEX "idx_complaints_complainant_id" ON "complaints" USING btree ("complainant_id");--> statement-breakpoint
CREATE INDEX "idx_complaints_complaint_category" ON "complaints" USING btree ("complaint_category");--> statement-breakpoint
CREATE INDEX "idx_complaints_severity" ON "complaints" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_complaints_status" ON "complaints" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_contractors_company_name" ON "contractors" USING btree ("company_name");--> statement-breakpoint
CREATE INDEX "idx_contractors_specializations" ON "contractors" USING btree ("specializations");--> statement-breakpoint
CREATE INDEX "idx_contractors_emergency_contact" ON "contractors" USING btree ("emergency_contact");--> statement-breakpoint
CREATE INDEX "idx_contractors_preferred_contractor" ON "contractors" USING btree ("preferred_contractor");--> statement-breakpoint
CREATE INDEX "idx_crisis_teams_team_leader" ON "crisis_teams" USING btree ("team_leader");--> statement-breakpoint
CREATE INDEX "idx_crisis_teams_specializations" ON "crisis_teams" USING btree ("specializations");--> statement-breakpoint
CREATE INDEX "idx_crisis_teams_escalation_level" ON "crisis_teams" USING btree ("escalation_level");--> statement-breakpoint
CREATE INDEX "idx_dashboard_widgets_user_id" ON "dashboard_widgets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_dashboard_widgets_widget_type" ON "dashboard_widgets" USING btree ("widget_type");--> statement-breakpoint
CREATE INDEX "idx_document_storage_entity" ON "document_storage" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_document_storage_uploaded_by" ON "document_storage" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "idx_document_storage_document_type" ON "document_storage" USING btree ("document_type");--> statement-breakpoint
CREATE INDEX "idx_document_storage_parent" ON "document_storage" USING btree ("parent_document_id");--> statement-breakpoint
CREATE INDEX "idx_document_storage_current_version" ON "document_storage" USING btree ("is_current_version");--> statement-breakpoint
CREATE INDEX "idx_document_storage_checksum" ON "document_storage" USING btree ("checksum");--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_resident_id" ON "emergency_contacts" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_contact_type" ON "emergency_contacts" USING btree ("contact_type");--> statement-breakpoint
CREATE INDEX "idx_emergency_contacts_is_primary" ON "emergency_contacts" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "idx_feature_entitlements_organization_id" ON "feature_entitlements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_feature_entitlements_subscription_id" ON "feature_entitlements" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_feature_entitlements_feature_key" ON "feature_entitlements" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "idx_feature_entitlements_is_entitled" ON "feature_entitlements" USING btree ("is_entitled");--> statement-breakpoint
CREATE INDEX "idx_feature_entitlements_organization_feature" ON "feature_entitlements" USING btree ("organization_id","feature_key");--> statement-breakpoint
CREATE INDEX "idx_feature_toggles_organization_id" ON "feature_toggles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_feature_toggles_feature_key" ON "feature_toggles" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "idx_feature_toggles_is_enabled" ON "feature_toggles" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_feature_toggles_organization_feature" ON "feature_toggles" USING btree ("organization_id","feature_key");--> statement-breakpoint
CREATE INDEX "idx_file_access_logs_document_id" ON "file_access_logs" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_file_access_logs_user_id" ON "file_access_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_file_access_logs_action_type" ON "file_access_logs" USING btree ("action_type");--> statement-breakpoint
CREATE INDEX "idx_file_access_logs_created_at" ON "file_access_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_file_backup_records_backup_date" ON "file_backup_records" USING btree ("backup_date");--> statement-breakpoint
CREATE INDEX "idx_file_backup_records_backup_type" ON "file_backup_records" USING btree ("backup_type");--> statement-breakpoint
CREATE INDEX "idx_file_backup_records_backup_status" ON "file_backup_records" USING btree ("backup_status");--> statement-breakpoint
CREATE INDEX "idx_file_sharing_document_id" ON "file_sharing" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "idx_file_sharing_shared_by" ON "file_sharing" USING btree ("shared_by");--> statement-breakpoint
CREATE INDEX "idx_file_sharing_shared_with" ON "file_sharing" USING btree ("shared_with");--> statement-breakpoint
CREATE INDEX "idx_file_sharing_expires_at" ON "file_sharing" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_financial_records_property_id" ON "financial_records" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_financial_records_resident_id" ON "financial_records" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_financial_records_record_type" ON "financial_records" USING btree ("record_type");--> statement-breakpoint
CREATE INDEX "idx_financial_records_status" ON "financial_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_financial_records_date" ON "financial_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_financial_records_due_date" ON "financial_records" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_incidents_property_id" ON "incidents" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_incidents_resident_id" ON "incidents" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_incidents_reported_by" ON "incidents" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "idx_incidents_status" ON "incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_incidents_severity" ON "incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_incidents_incident_type" ON "incidents" USING btree ("incident_type");--> statement-breakpoint
CREATE INDEX "idx_incidents_created_at" ON "incidents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_incidents_status_severity" ON "incidents" USING btree ("status","severity");--> statement-breakpoint
CREATE INDEX "idx_inspections_property_id" ON "inspections" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_inspections_inspection_type" ON "inspections" USING btree ("inspection_type");--> statement-breakpoint
CREATE INDEX "idx_inspections_scheduled_date" ON "inspections" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "idx_inspections_status" ON "inspections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_inspections_pass_status" ON "inspections" USING btree ("pass_status");--> statement-breakpoint
CREATE INDEX "idx_insurance_records_policy_number" ON "insurance_records" USING btree ("policy_number");--> statement-breakpoint
CREATE INDEX "idx_insurance_records_property_id" ON "insurance_records" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_insurance_records_insurance_type" ON "insurance_records" USING btree ("insurance_type");--> statement-breakpoint
CREATE INDEX "idx_insurance_records_renewal_date" ON "insurance_records" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "idx_integration_logs_integration" ON "integration_logs" USING btree ("integration");--> statement-breakpoint
CREATE INDEX "idx_integration_logs_operation" ON "integration_logs" USING btree ("operation");--> statement-breakpoint
CREATE INDEX "idx_integration_logs_status" ON "integration_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_integration_logs_created_at" ON "integration_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_maintenance_windows_status" ON "maintenance_windows" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_maintenance_windows_scheduled_start" ON "maintenance_windows" USING btree ("scheduled_start");--> statement-breakpoint
CREATE INDEX "idx_maintenance_windows_maintenance_type" ON "maintenance_windows" USING btree ("maintenance_type");--> statement-breakpoint
CREATE INDEX "idx_move_records_resident_id" ON "move_records" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_move_records_move_date" ON "move_records" USING btree ("move_date");--> statement-breakpoint
CREATE INDEX "idx_move_records_move_type" ON "move_records" USING btree ("move_type");--> statement-breakpoint
CREATE INDEX "idx_move_records_from_property_id" ON "move_records" USING btree ("from_property_id");--> statement-breakpoint
CREATE INDEX "idx_move_records_to_property_id" ON "move_records" USING btree ("to_property_id");--> statement-breakpoint
CREATE INDEX "idx_multi_tenant_settings_organization_id" ON "multi_tenant_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_multi_tenant_settings_setting_key" ON "multi_tenant_settings" USING btree ("setting_key");--> statement-breakpoint
CREATE INDEX "idx_multi_tenant_settings_organization_key" ON "multi_tenant_settings" USING btree ("organization_id","setting_key");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_notifications_notification_type" ON "notifications" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "idx_notifications_priority" ON "notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_notifications_is_read" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "idx_notifications_created_at" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_organization_analytics_organization_id" ON "organization_analytics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_analytics_metric_type" ON "organization_analytics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_organization_analytics_period" ON "organization_analytics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_organization_analytics_period_date" ON "organization_analytics" USING btree ("period_date");--> statement-breakpoint
CREATE INDEX "idx_organization_analytics_org_metric_period" ON "organization_analytics" USING btree ("organization_id","metric_type","period_date");--> statement-breakpoint
CREATE INDEX "idx_organization_subscriptions_organization_id" ON "organization_subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_subscriptions_plan_id" ON "organization_subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_organization_subscriptions_status" ON "organization_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_organization_subscriptions_current_period_end" ON "organization_subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "idx_organization_subscriptions_stripe_subscription_id" ON "organization_subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_organizations_name" ON "organizations" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_organizations_organization_type" ON "organizations" USING btree ("organization_type");--> statement-breakpoint
CREATE INDEX "idx_organizations_parent_organization_id" ON "organizations" USING btree ("parent_organization_id");--> statement-breakpoint
CREATE INDEX "idx_outcomes_tracking_resident_id" ON "outcomes_tracking" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_outcomes_tracking_outcome_category" ON "outcomes_tracking" USING btree ("outcome_category");--> statement-breakpoint
CREATE INDEX "idx_outcomes_tracking_outcome_type" ON "outcomes_tracking" USING btree ("outcome_type");--> statement-breakpoint
CREATE INDEX "idx_outcomes_tracking_achievement_date" ON "outcomes_tracking" USING btree ("achievement_date");--> statement-breakpoint
CREATE INDEX "idx_overage_charges_organization_id" ON "overage_charges" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_overage_charges_subscription_id" ON "overage_charges" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_overage_charges_usage_type" ON "overage_charges" USING btree ("usage_type");--> statement-breakpoint
CREATE INDEX "idx_overage_charges_period_end" ON "overage_charges" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_overage_charges_status" ON "overage_charges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_organization_id" ON "payment_methods" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_is_default" ON "payment_methods" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_is_active" ON "payment_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_stripe_payment_method_id" ON "payment_methods" USING btree ("stripe_payment_method_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_organization_id" ON "payment_transactions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_subscription_id" ON "payment_transactions" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_invoice_id" ON "payment_transactions" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_status" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_transaction_type" ON "payment_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_stripe_payment_intent_id" ON "payment_transactions" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
CREATE INDEX "idx_payment_transactions_processed_at" ON "payment_transactions" USING btree ("processed_at");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_admin_user_id" ON "platform_audit_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_action" ON "platform_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_target_type" ON "platform_audit_logs" USING btree ("target_type");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_organization_id" ON "platform_audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_timestamp" ON "platform_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "idx_platform_audit_logs_risk_level" ON "platform_audit_logs" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "idx_platform_notifications_notification_type" ON "platform_notifications" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "idx_platform_notifications_priority" ON "platform_notifications" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_platform_notifications_target_audience" ON "platform_notifications" USING btree ("target_audience");--> statement-breakpoint
CREATE INDEX "idx_platform_notifications_is_active" ON "platform_notifications" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_platform_notifications_scheduled_for" ON "platform_notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "idx_platform_sessions_admin_user_id" ON "platform_sessions" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_sessions_expires_at" ON "platform_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_platform_sessions_last_activity" ON "platform_sessions" USING btree ("last_activity");--> statement-breakpoint
CREATE INDEX "idx_platform_users_user_id" ON "platform_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_platform_users_access_level" ON "platform_users" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "idx_platform_users_is_active" ON "platform_users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_properties_status" ON "properties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_properties_property_type" ON "properties" USING btree ("property_type");--> statement-breakpoint
CREATE INDEX "idx_properties_created_at" ON "properties" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_referrals_resident_id" ON "referrals" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_referred_by" ON "referrals" USING btree ("referred_by");--> statement-breakpoint
CREATE INDEX "idx_referrals_referral_type" ON "referrals" USING btree ("referral_type");--> statement-breakpoint
CREATE INDEX "idx_referrals_status" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referrals_referral_date" ON "referrals" USING btree ("referral_date");--> statement-breakpoint
CREATE INDEX "idx_rent_payments_resident_id" ON "rent_payments" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_rent_payments_property_id" ON "rent_payments" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_rent_payments_payment_date" ON "rent_payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "idx_rent_payments_due_date" ON "rent_payments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_rent_payments_payment_status" ON "rent_payments" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_report_templates_created_by" ON "report_templates" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_report_templates_report_type" ON "report_templates" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_report_templates_is_default" ON "report_templates" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "idx_residents_property_id" ON "residents" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_residents_key_worker_id" ON "residents" USING btree ("key_worker_id");--> statement-breakpoint
CREATE INDEX "idx_residents_status" ON "residents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_residents_risk_level" ON "residents" USING btree ("risk_level");--> statement-breakpoint
CREATE INDEX "idx_residents_move_in_date" ON "residents" USING btree ("move_in_date");--> statement-breakpoint
CREATE INDEX "idx_residents_name" ON "residents" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "idx_revenue_reports_report_type" ON "revenue_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_revenue_reports_period_start" ON "revenue_reports" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "idx_revenue_reports_period_end" ON "revenue_reports" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_revenue_reports_generated_at" ON "revenue_reports" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX "idx_risk_assessments_resident_id" ON "risk_assessments" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "idx_risk_assessments_assessor_id" ON "risk_assessments" USING btree ("assessor_id");--> statement-breakpoint
CREATE INDEX "idx_risk_assessments_overall_risk_level" ON "risk_assessments" USING btree ("overall_risk_level");--> statement-breakpoint
CREATE INDEX "idx_risk_assessments_review_date" ON "risk_assessments" USING btree ("review_date");--> statement-breakpoint
CREATE INDEX "idx_roles_permissions_role_name" ON "roles_permissions" USING btree ("role_name");--> statement-breakpoint
CREATE INDEX "idx_roles_permissions_organization_id" ON "roles_permissions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_subscription_analytics_organization_id" ON "subscription_analytics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_analytics_metric_type" ON "subscription_analytics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "idx_subscription_analytics_period" ON "subscription_analytics" USING btree ("period");--> statement-breakpoint
CREATE INDEX "idx_subscription_analytics_period_date" ON "subscription_analytics" USING btree ("period_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_analytics_metric_period_date" ON "subscription_analytics" USING btree ("metric_type","period_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_changes_organization_id" ON "subscription_changes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_changes_subscription_id" ON "subscription_changes" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_changes_change_type" ON "subscription_changes" USING btree ("change_type");--> statement-breakpoint
CREATE INDEX "idx_subscription_changes_effective_date" ON "subscription_changes" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_changes_status" ON "subscription_changes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_discounts_code" ON "subscription_discounts" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_subscription_discounts_is_active" ON "subscription_discounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_subscription_discounts_valid_from" ON "subscription_discounts" USING btree ("valid_from");--> statement-breakpoint
CREATE INDEX "idx_subscription_discounts_valid_until" ON "subscription_discounts" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "idx_subscription_features_plan_id" ON "subscription_features" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_features_feature_key" ON "subscription_features" USING btree ("feature_key");--> statement-breakpoint
CREATE INDEX "idx_subscription_features_is_enabled" ON "subscription_features" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_organization_id" ON "subscription_invoices" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_subscription_id" ON "subscription_invoices" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_invoice_number" ON "subscription_invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_status" ON "subscription_invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_due_date" ON "subscription_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_invoices_stripe_invoice_id" ON "subscription_invoices" USING btree ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_plan_name" ON "subscription_plans" USING btree ("plan_name");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_is_active" ON "subscription_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_subscription_plans_sort_order" ON "subscription_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_subscription_renewals_organization_id" ON "subscription_renewals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_renewals_subscription_id" ON "subscription_renewals" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_renewals_renewal_date" ON "subscription_renewals" USING btree ("renewal_date");--> statement-breakpoint
CREATE INDEX "idx_subscription_renewals_status" ON "subscription_renewals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_renewals_next_retry_date" ON "subscription_renewals" USING btree ("next_retry_date");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_organization_id" ON "support_tickets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_reported_by" ON "support_tickets" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_assigned_to" ON "support_tickets" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_category" ON "support_tickets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_priority" ON "support_tickets" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_status" ON "support_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_support_tickets_created_at" ON "support_tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_survey_responses_survey_id" ON "survey_responses" USING btree ("survey_id");--> statement-breakpoint
CREATE INDEX "idx_survey_responses_respondent_id" ON "survey_responses" USING btree ("respondent_id");--> statement-breakpoint
CREATE INDEX "idx_survey_responses_respondent_type" ON "survey_responses" USING btree ("respondent_type");--> statement-breakpoint
CREATE INDEX "idx_surveys_survey_type" ON "surveys" USING btree ("survey_type");--> statement-breakpoint
CREATE INDEX "idx_surveys_target_audience" ON "surveys" USING btree ("target_audience");--> statement-breakpoint
CREATE INDEX "idx_surveys_created_by" ON "surveys" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_surveys_is_active" ON "surveys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_system_configurations_config_key" ON "system_configurations" USING btree ("config_key");--> statement-breakpoint
CREATE INDEX "idx_system_configurations_category" ON "system_configurations" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_system_metrics_metric_name" ON "system_metrics" USING btree ("metric_name");--> statement-breakpoint
CREATE INDEX "idx_system_metrics_organization_id" ON "system_metrics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_system_metrics_recorded_at" ON "system_metrics" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_system_metrics_name_recorded_at" ON "system_metrics" USING btree ("metric_name","recorded_at");--> statement-breakpoint
CREATE INDEX "idx_training_records_staff_id" ON "training_records" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "idx_training_records_training_type" ON "training_records" USING btree ("training_type");--> statement-breakpoint
CREATE INDEX "idx_training_records_status" ON "training_records" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_training_records_expiry_date" ON "training_records" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_trial_periods_organization_id" ON "trial_periods" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_trial_periods_plan_id" ON "trial_periods" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_trial_periods_status" ON "trial_periods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_trial_periods_end_date" ON "trial_periods" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_organization_id" ON "usage_limits" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_limit_type" ON "usage_limits" USING btree ("limit_type");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_is_blocked" ON "usage_limits" USING btree ("is_blocked");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_organization_limit_type" ON "usage_limits" USING btree ("organization_id","limit_type");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_organization_id" ON "usage_tracking" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_usage_type" ON "usage_tracking" USING btree ("usage_type");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_period_end" ON "usage_tracking" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_usage_tracking_organization_usage_type" ON "usage_tracking" USING btree ("organization_id","usage_type");--> statement-breakpoint
CREATE INDEX "idx_user_auth_methods_user_id" ON "user_auth_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_auth_methods_provider" ON "user_auth_methods" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_user_auth_methods_provider_id" ON "user_auth_methods" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_token" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "idx_user_sessions_expires" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_utilities_property_id" ON "utilities" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "idx_utilities_utility_type" ON "utilities" USING btree ("utility_type");--> statement-breakpoint
CREATE INDEX "idx_utilities_provider" ON "utilities" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_workflows_workflow_type" ON "workflows" USING btree ("workflow_type");--> statement-breakpoint
CREATE INDEX "idx_workflows_created_by" ON "workflows" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_workflows_organization_id" ON "workflows" USING btree ("organization_id");