/*
  # Storage Security Implementation
  
  1. Storage Configuration
    - Configure storage buckets
    - Set up RLS policies
    - Add helper functions
    
  2. Security Features
    - Role-based access control
    - Team ownership validation
    - File type restrictions
*/

-- Create storage buckets if not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('teams', 'teams', true),
  ('players', 'players', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Configure bucket settings
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id IN ('teams', 'players', 'logos');

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "teams_storage_read_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete_policy" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Helper function to check team access
CREATE OR REPLACE FUNCTION storage.check_team_access(object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_id text;
BEGIN
  -- Extract team ID from filename (format: {teamId}-{timestamp}.{ext})
  team_id := split_part(object_name, '-', 1);
  
  RETURN EXISTS (
    SELECT 1 FROM teams t
    LEFT JOIN users u ON u.id = auth.uid()
    WHERE t.id::text = team_id
    AND (
      -- User owns the team
      t.user_id = auth.uid()
      OR
      -- User has admin/coach role
      u.role IN ('admin', 'coach')
    )
  );
END;
$$;

-- Helper function to validate file type
CREATE OR REPLACE FUNCTION storage.is_valid_image(metadata jsonb)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (metadata->>'mimetype')::text = ANY(ARRAY['image/jpeg', 'image/png', 'image/gif']);
$$;

-- Create comprehensive storage policies

-- Read policy - public access for team photos
CREATE POLICY "teams_storage_read_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Insert policy - team owners and admins/coaches can upload
CREATE POLICY "teams_storage_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  storage.check_team_access(name) AND
  storage.is_valid_image(metadata)
);

-- Update policy - team owners and admins/coaches can update
CREATE POLICY "teams_storage_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.check_team_access(name)
)
WITH CHECK (
  bucket_id = 'teams' AND
  storage.check_team_access(name) AND
  storage.is_valid_image(metadata)
);

-- Delete policy - team owners and admins/coaches can delete
CREATE POLICY "teams_storage_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.check_team_access(name)
);

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION storage.cleanup_orphaned_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete files without corresponding team
  DELETE FROM storage.objects o
  WHERE o.bucket_id = 'teams'
  AND NOT EXISTS (
    SELECT 1 FROM teams t
    WHERE t.id::text = split_part(o.name, '-', 1)
  );
END;
$$;

-- Add comments
COMMENT ON FUNCTION storage.check_team_access IS 'Validates if user has access to team photo';
COMMENT ON FUNCTION storage.is_valid_image IS 'Checks if file is a valid image type';
COMMENT ON FUNCTION storage.cleanup_orphaned_files IS 'Removes orphaned team photos';