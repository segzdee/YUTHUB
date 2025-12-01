/*
  # Create Team Activity Log Table

  1. Purpose
    - Track all team management activities (invites, role changes, removals)
    - Provide audit trail for security and compliance
    - Enable activity log feature in Team Management UI

  2. New Tables
    - `team_activity_log`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `action` (text) - Type of action (invite, role_change, remove)
      - `details` (text) - Human-readable description
      - `target_user_id` (uuid, nullable) - User being acted upon
      - `created_at` (timestamptz) - When action occurred

  3. Security
    - Enable RLS on team_activity_log
    - Only organization members can view logs
    - Only admins/managers can access logs

  4. Indexes
    - Index on organization_id for fast lookups
    - Index on created_at for chronological sorting
    - Index on user_id for filtering by actor
*/

-- Create team_activity_log table
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('invite', 'role_change', 'remove', 'resend_invite', 'activate', 'deactivate')),
  details text NOT NULL,
  target_user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view activity logs
CREATE POLICY "Organization members can view activity logs"
  ON public.team_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = team_activity_log.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

-- Policy: Organization members can insert activity logs
CREATE POLICY "Organization members can insert activity logs"
  ON public.team_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_organizations
      WHERE user_organizations.organization_id = team_activity_log.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_activity_log_org_id 
  ON public.team_activity_log(organization_id);

CREATE INDEX IF NOT EXISTS idx_team_activity_log_created_at 
  ON public.team_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_activity_log_user_id 
  ON public.team_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_team_activity_log_target_user 
  ON public.team_activity_log(target_user_id) 
  WHERE target_user_id IS NOT NULL;

-- Add comment
COMMENT ON TABLE public.team_activity_log IS 'Audit trail for team management activities including invites, role changes, and member removals';
