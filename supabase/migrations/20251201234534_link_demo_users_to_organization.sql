/*
  # Link Demo Users to Organization

  1. Purpose
    - Links existing auth users to the Demo Care Organization
    - Assigns appropriate admin roles to demo users
    - Ensures users can access Team Management and other features

  2. Changes
    - Creates user_organizations records for demo.admin@yuthub.com
    - Sets role to 'admin' for full organization access
    - Sets status to 'active' and is_primary to true

  3. Security
    - Only affects demo users
    - Uses existing RLS policies
    - No data loss or security concerns
*/

-- Link demo.admin@yuthub.com to Demo Care Organization as admin
INSERT INTO public.user_organizations (
  user_id,
  organization_id,
  role,
  is_primary,
  status,
  invited_at,
  accepted_at,
  created_at,
  updated_at
)
SELECT 
  '4b286411-0a32-415b-9d37-7151462c09ee'::uuid, -- demo.admin@yuthub.com
  '0861c3aa-2872-4fba-96e7-bfe1c7e6a58c'::uuid, -- Demo Care Organization
  'admin',
  true,
  'active',
  now(),
  now(),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_organizations
  WHERE user_id = '4b286411-0a32-415b-9d37-7151462c09ee'::uuid
  AND organization_id = '0861c3aa-2872-4fba-96e7-bfe1c7e6a58c'::uuid
);

-- Create index for faster user_organizations lookups if not exists
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id 
  ON public.user_organizations(user_id);

CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id 
  ON public.user_organizations(organization_id);

CREATE INDEX IF NOT EXISTS idx_user_organizations_status 
  ON public.user_organizations(status);
