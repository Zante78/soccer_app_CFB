/*
  # Fix Storage Permissions for Team Photos

  1. Storage Configuration
    - Creates teams storage bucket
    - Enables RLS on storage.objects
    - Sets up proper access policies
  
  2. Security
    - Public read access for team photos
    - Write access restricted to team owners
    - Proper bucket configuration and policies
*/

-- Create teams bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create helper function for team ownership check
CREATE OR REPLACE FUNCTION storage.is_team_owner(object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_id text;
BEGIN
  -- Extract team ID from filename (format: {teamId}-{timestamp}.{ext})
  team_id := SPLIT_PART(object_name, '-', 1);
  
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id::text = team_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow team owners to upload team photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow team owners to update team photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow team owners to delete team photos" ON storage.objects;
END $$;

-- Create new storage policies

-- Allow public read access for team photos
CREATE POLICY "teams_storage_read_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Allow team owners to upload photos
CREATE POLICY "teams_storage_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

-- Allow team owners to update their photos
CREATE POLICY "teams_storage_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

-- Allow team owners to delete their photos
CREATE POLICY "teams_storage_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);