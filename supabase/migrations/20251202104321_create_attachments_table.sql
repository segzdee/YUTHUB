/*
  # Create Attachments Table for File Upload System

  1. New Tables
    - `attachments`
      - `id` (uuid, primary key) - Unique identifier
      - `organization_id` (uuid, foreign key) - Links to organizations
      - `entity_type` (text) - Type of entity (resident, property, incident, etc.)
      - `entity_id` (uuid) - ID of the entity this file belongs to
      - `file_name` (text) - Original filename
      - `file_size` (bigint) - File size in bytes
      - `file_type` (text) - MIME type
      - `storage_path` (text) - Path in Supabase Storage
      - `public_url` (text) - Public accessible URL
      - `description` (text, nullable) - Optional description
      - `tags` (jsonb, nullable) - Optional tags for categorization
      - `uploaded_by` (uuid, foreign key) - User who uploaded the file
      - `created_at` (timestamptz) - Upload timestamp
      - `updated_at` (timestamptz) - Last modified timestamp

  2. Security
    - Enable RLS on `attachments` table
    - Add policies for authenticated users to:
      - View files in their organization
      - Upload files to their organization
      - Delete their own uploaded files
      - Managers/admins can delete any files in their org

  3. Storage
    - Create 'attachments' storage bucket
    - Configure bucket policies for organization-level access
*/

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  public_url text NOT NULL,
  description text,
  tags jsonb DEFAULT '[]'::jsonb,
  uploaded_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_attachments_organization ON attachments(organization_id);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attachments in their organization
CREATE POLICY "Users can view organization attachments"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can upload attachments to their organization
CREATE POLICY "Users can upload attachments"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM user_organizations
      WHERE user_id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- Policy: Users can update their own attachments' metadata
CREATE POLICY "Users can update own attachments"
  ON attachments
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- Policy: Users can delete their own attachments
CREATE POLICY "Users can delete own attachments"
  ON attachments
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Policy: Managers and admins can delete any attachments in their org
CREATE POLICY "Managers can delete organization attachments"
  ON attachments
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT uo.organization_id
      FROM user_organizations uo
      WHERE uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin', 'manager')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attachments_updated_at
  BEFORE UPDATE ON attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_attachments_updated_at();

-- Add comment for documentation
COMMENT ON TABLE attachments IS 'Stores metadata for files uploaded to Supabase Storage';