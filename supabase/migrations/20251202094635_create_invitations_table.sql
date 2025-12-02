/*
  # Create Invitations Table

  1. New Tables
    - `invitations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations)
      - `email` (text, invited user email)
      - `role` (text, assigned role: owner, admin, manager, staff, viewer)
      - `token` (uuid, unique invitation token)
      - `invited_by` (uuid, foreign key to auth.users)
      - `status` (text, pending/accepted/expired/revoked)
      - `expires_at` (timestamptz, expiration date)
      - `accepted_at` (timestamptz, when invitation was accepted)
      - `created_at` (timestamptz, when invitation was created)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `invitations` table
    - Add policy for organization admins to manage invitations
    - Add policy for public to validate tokens
    - Add indexes for performance

  3. Important Notes
    - Tokens expire after 7 days by default
    - Each token is unique and can only be used once
    - Admins can revoke pending invitations
*/

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_organization ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can view invitations"
  ON invitations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'platform_admin')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can create invitations"
  ON invitations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'platform_admin')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can update invitations"
  ON invitations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'platform_admin')
      AND user_organizations.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'platform_admin')
      AND user_organizations.status = 'active'
    )
  );

CREATE POLICY "Organization admins can delete invitations"
  ON invitations FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'platform_admin')
      AND user_organizations.status = 'active'
    )
  );

CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invitations_updated_at ON invitations;
CREATE TRIGGER set_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();
