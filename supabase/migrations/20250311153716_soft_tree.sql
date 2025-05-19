/*
  # Fix Team Storage Permissions

  1. Storage Configuration
    - Creates teams storage bucket
    - Enables RLS on storage.objects
    - Sets up proper access policies
  
  2. Security
    - Public read access for team photos
    - Write access only for team owners
    - Proper cleanup policies
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
  -- Extract team ID from filename (assumes format: {teamId}-{timestamp}.{ext})
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
  DROP POLICY IF EXISTS "teams_storage_select" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_insert" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete" ON storage.objects;
END $$;

-- Create new storage policies

-- Allow public read access for team photos
CREATE POLICY "teams_storage_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Allow team owners to upload photos
CREATE POLICY "teams_storage_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

-- Allow team owners to update their photos
CREATE POLICY "teams_storage_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

-- Allow team owners to delete their photos
CREATE POLICY "teams_storage_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);