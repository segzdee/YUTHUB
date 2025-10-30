/*
  # Initial Database Schema for YUTHUB Housing Platform

  1. Core Tables
    - users: User accounts with authentication and subscription details
    - sessions: Session management for authentication
    - organizations: Multi-tenant organization management
    - properties: Housing properties and facilities
    - property_rooms: Individual rooms within properties
    - residents: Resident information and tracking
    
  2. Billing & Subscriptions
    - subscription_plans: Available subscription tiers
    - subscription_invoices: Invoice management
    - billing_periods: Billing period tracking
    - government_clients: Government funding clients
    - invoices & invoice_line_items: Invoice generation
    - payment_transactions: Payment processing
    
  3. Support & Services
    - support_plans: Individual support plans for residents
    - progress_tracking: Goal and progress monitoring
    - assessment_forms: Various assessment types
    - incidents: Incident reporting and management
    - communication_logs: Resident communication tracking
    
  4. Operations
    - maintenance_requests: Property maintenance
    - financial_records: Financial tracking
    - staff_members: Staff management
    - calendar_events: Scheduling
    - document_storage: File management
    
  5. Security & Audit
    - audit_logs: System audit trail
    - platform_audit_logs: Platform admin actions
    - auth_audit_log: Authentication events
    - file_access_logs: Document access tracking
    
  6. Advanced Features
    - workflows: Automated workflow management
    - notifications: User notifications
    - dashboard_widgets: Customizable dashboards
    - integration_logs: Third-party integration tracking
    
  7. Security
    - All tables include timestamps (created_at, updated_at)
    - Proper foreign key constraints
    - Indexes on frequently queried columns
    - JSONB fields for flexible data storage
*/
