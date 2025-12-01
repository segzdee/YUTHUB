/*
  # Enhanced Safeguarding and Crisis Management System

  ## Overview
  Comprehensive incident reporting, risk assessments, crisis alerts, and escalation workflows.

  ## New Tables
  1. **incident_people** - People involved in incidents with roles
  2. **incident_attachments** - Evidence files and documents
  3. **incident_actions** - Follow-up actions with assignments
  4. **incident_notes** - Timeline and audit trail
  5. **risk_assessments_enhanced** - Comprehensive risk evaluations
  6. **risk_domains** - Domain-specific risk scoring
  7. **crisis_alerts** - Active emergency situations
  8. **escalation_logs** - Escalation workflow audit

  ## Security
  - RLS enabled on all tables
  - Access control for safeguarding data
  - Immutable audit trails
*/

-- ============================================================================
-- INCIDENT PEOPLE INVOLVED
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  person_type TEXT NOT NULL CHECK (person_type IN ('resident', 'staff', 'visitor', 'external')),
  resident_id UUID REFERENCES residents(id),
  staff_id UUID REFERENCES staff_members(id),
  external_person_name TEXT,
  external_person_details JSONB DEFAULT '{}'::jsonb,
  involvement_role TEXT NOT NULL CHECK (involvement_role IN (
    'subject', 'witness', 'reporter', 'first_responder', 
    'victim', 'perpetrator', 'other'
  )),
  involvement_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_people_incident ON incident_people(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_people_resident ON incident_people(resident_id);

-- ============================================================================
-- INCIDENT ATTACHMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'incident-evidence',
  virus_scanned BOOLEAN DEFAULT false,
  scan_result TEXT,
  scan_date TIMESTAMPTZ,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN (
    'photo_evidence', 'body_map', 'witness_statement',
    'medical_report', 'police_report', 'correspondence', 'other_document'
  )),
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES staff_members(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_incident_attachments_incident ON incident_attachments(incident_id);

-- ============================================================================
-- INCIDENT FOLLOW-UP ACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  action_title TEXT NOT NULL,
  action_description TEXT NOT NULL,
  action_priority TEXT NOT NULL CHECK (action_priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to_id UUID NOT NULL REFERENCES staff_members(id),
  assigned_by_id UUID NOT NULL REFERENCES staff_members(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
  )),
  completed_date DATE,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_actions_incident ON incident_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_actions_assigned ON incident_actions(assigned_to_id, status);

-- ============================================================================
-- INCIDENT NOTES (Timeline/Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS incident_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN (
    'status_change', 'investigation_update', 'escalation',
    'external_notification', 'general_note', 'resolution'
  )),
  note_text TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  created_by UUID NOT NULL REFERENCES staff_members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_incident_notes_incident ON incident_notes(incident_id, created_at DESC);

-- ============================================================================
-- ENHANCED RISK ASSESSMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_assessments_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  assessment_reference TEXT UNIQUE NOT NULL DEFAULT 'RISK-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'initial', 'routine', 'incident_triggered', 'review', 'discharge'
  )),
  assessed_by_id UUID NOT NULL REFERENCES staff_members(id),
  reviewed_by_id UUID REFERENCES staff_members(id),
  review_date DATE,
  overall_likelihood INTEGER CHECK (overall_likelihood BETWEEN 1 AND 5),
  overall_impact INTEGER CHECK (overall_impact BETWEEN 1 AND 5),
  overall_risk_score INTEGER GENERATED ALWAYS AS (overall_likelihood * overall_impact) STORED,
  risk_summary TEXT NOT NULL,
  protective_factors TEXT,
  trigger_factors TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'draft', 'active', 'superseded', 'archived'
  )),
  next_review_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_resident ON risk_assessments_enhanced(resident_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_org ON risk_assessments_enhanced(organization_id, status);

-- ============================================================================
-- RISK DOMAINS
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_assessment_id UUID NOT NULL REFERENCES risk_assessments_enhanced(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL CHECK (domain_name IN (
    'self_harm', 'harm_to_others', 'exploitation',
    'substance_misuse', 'missing_episodes', 'mental_health',
    'physical_health', 'criminal_activity', 'accommodation', 'financial'
  )),
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  evidence TEXT NOT NULL,
  current_controls TEXT,
  additional_controls_needed TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(risk_assessment_id, domain_name)
);

CREATE INDEX IF NOT EXISTS idx_risk_domains_assessment ON risk_domains(risk_assessment_id);

-- ============================================================================
-- CRISIS ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS crisis_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_reference TEXT UNIQUE NOT NULL DEFAULT 'CRISIS-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substr(md5(random()::text), 1, 4),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'medical_emergency', 'mental_health_crisis', 'missing_person',
    'violence_incident', 'fire_emergency', 'security_breach',
    'natural_disaster', 'other_emergency'
  )),
  alert_severity TEXT NOT NULL DEFAULT 'critical' CHECK (alert_severity IN ('high', 'critical')),
  property_id UUID REFERENCES properties(id),
  location_description TEXT NOT NULL,
  resident_id UUID REFERENCES residents(id),
  reported_by_id UUID NOT NULL REFERENCES staff_members(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'responding', 'contained', 'resolved', 'cancelled'
  )),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  alert_description TEXT NOT NULL,
  actions_taken TEXT,
  resolution_notes TEXT,
  notifications_sent JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crisis_alerts_org_status ON crisis_alerts(organization_id, status) 
  WHERE status IN ('active', 'responding');
CREATE INDEX IF NOT EXISTS idx_crisis_alerts_activated ON crisis_alerts(activated_at DESC);

-- ============================================================================
-- ESCALATION LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS escalation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('incident', 'risk_assessment', 'crisis_alert')),
  source_id UUID NOT NULL,
  escalation_level INTEGER NOT NULL CHECK (escalation_level BETWEEN 1 AND 4),
  escalation_reason TEXT NOT NULL,
  auto_escalated BOOLEAN NOT NULL DEFAULT false,
  notified_staff_ids UUID[] NOT NULL,
  notification_methods TEXT[] NOT NULL,
  acknowledged_by UUID[],
  escalated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_acknowledgment_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_escalation_logs_source ON escalation_logs(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_level ON escalation_logs(escalation_level, escalated_at DESC);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE incident_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Incident People
CREATE POLICY "Organization members can access incident people"
  ON incident_people FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_people.incident_id
      AND i.organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Incident Attachments
CREATE POLICY "Organization members can access incident attachments"
  ON incident_attachments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_attachments.incident_id
      AND i.organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Incident Actions
CREATE POLICY "Organization members can access incident actions"
  ON incident_actions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_actions.incident_id
      AND i.organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Incident Notes
CREATE POLICY "Organization members can view incident notes"
  ON incident_notes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_notes.incident_id
      AND i.organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "Staff can create incident notes"
  ON incident_notes FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_members sm
      JOIN incidents i ON i.id = incident_notes.incident_id
      WHERE sm.user_id = auth.uid()
      AND sm.organization_id = i.organization_id
      AND sm.employment_status = 'active'
    )
  );

-- Risk Assessments Enhanced
CREATE POLICY "Organization members can access risk assessments"
  ON risk_assessments_enhanced FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Risk Domains
CREATE POLICY "Organization members can access risk domains"
  ON risk_domains FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM risk_assessments_enhanced ra
      WHERE ra.id = risk_domains.risk_assessment_id
      AND ra.organization_id IN (
        SELECT organization_id FROM user_organizations
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Crisis Alerts
CREATE POLICY "Organization members can access crisis alerts"
  ON crisis_alerts FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Escalation Logs (read-only)
CREATE POLICY "Organization staff can view escalation logs"
  ON escalation_logs FOR SELECT TO authenticated
  USING (
    auth.uid() = ANY(notified_staff_ids) OR
    EXISTS (
      SELECT 1 FROM staff_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.employment_status = 'active'
      AND sm.staff_role IN ('manager', 'coordinator', 'admin')
    )
  );

-- ============================================================================
-- ADD ADDITIONAL COLUMNS TO EXISTING INCIDENTS TABLE
-- ============================================================================
DO $$
BEGIN
  -- Add body map data if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'body_map_data'
  ) THEN
    ALTER TABLE incidents ADD COLUMN body_map_data JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add harm level if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'harm_level'
  ) THEN
    ALTER TABLE incidents ADD COLUMN harm_level TEXT 
      CHECK (harm_level IN ('none', 'minor', 'moderate', 'severe', 'life_threatening'));
  END IF;

  -- Add injuries sustained flag if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'injuries_sustained'
  ) THEN
    ALTER TABLE incidents ADD COLUMN injuries_sustained BOOLEAN DEFAULT false;
  END IF;

  -- Add external location if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'external_location'
  ) THEN
    ALTER TABLE incidents ADD COLUMN external_location TEXT;
  END IF;

  -- Add escalation level if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'escalation_level'
  ) THEN
    ALTER TABLE incidents ADD COLUMN escalation_level INTEGER DEFAULT 0;
  END IF;

  -- Add escalated at if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'escalated_at'
  ) THEN
    ALTER TABLE incidents ADD COLUMN escalated_at TIMESTAMPTZ;
  END IF;

  -- Add debrief completed if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'debrief_completed'
  ) THEN
    ALTER TABLE incidents ADD COLUMN debrief_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add debrief date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'debrief_date'
  ) THEN
    ALTER TABLE incidents ADD COLUMN debrief_date DATE;
  END IF;

  -- Add ofsted notified if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'ofsted_notified'
  ) THEN
    ALTER TABLE incidents ADD COLUMN ofsted_notified BOOLEAN DEFAULT false;
  END IF;

  -- Add ofsted notified date if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'ofsted_notified_date'
  ) THEN
    ALTER TABLE incidents ADD COLUMN ofsted_notified_date DATE;
  END IF;
END $$;
