/*
  # RLS and Audit Infrastructure

  Creates audit logging and RLS helper functions
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT TO authenticated
USING (organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND status = 'active'));

CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Audit function
CREATE OR REPLACE FUNCTION create_audit_log() RETURNS TRIGGER AS $$
DECLARE org_id uuid; changed_fields_array text[];
BEGIN
  IF TG_OP = 'DELETE' THEN org_id := OLD.organization_id;
    INSERT INTO audit_logs (organization_id, user_id, action, table_name, record_id, old_values)
    VALUES (org_id, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  ELSIF TG_OP = 'UPDATE' THEN org_id := NEW.organization_id;
    SELECT array_agg(key) INTO changed_fields_array FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key;
    INSERT INTO audit_logs (organization_id, user_id, action, table_name, record_id, old_values, new_values, changed_fields)
    VALUES (org_id, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), changed_fields_array);
  ELSE org_id := NEW.organization_id;
    INSERT INTO audit_logs (organization_id, user_id, action, table_name, record_id, new_values)
    VALUES (org_id, COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS audit_residents_trigger ON residents;
DROP TRIGGER IF EXISTS audit_incidents_trigger ON incidents;
DROP TRIGGER IF EXISTS audit_support_plans_trigger ON support_plans;

CREATE TRIGGER audit_residents_trigger AFTER INSERT OR UPDATE OR DELETE ON residents FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_incidents_trigger AFTER INSERT OR UPDATE OR DELETE ON incidents FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_support_plans_trigger AFTER INSERT OR UPDATE OR DELETE ON support_plans FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- RLS helpers
CREATE OR REPLACE FUNCTION current_user_organization_id() RETURNS uuid AS $$
  SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND status = 'active' LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_any_role(required_roles text[]) RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM user_organizations WHERE user_id = auth.uid() AND status = 'active' AND role = ANY(required_roles));
$$ LANGUAGE sql STABLE SECURITY DEFINER;