/*
  # Fix Storage RLS Policies for Team Photos

  1. Changes
    - Drop existing storage policies
    - Create new policies with proper checks
    - Add helper function for team ownership
    
  2. Security
    - Public read access for team photos
    - Write access only for team owners
    - Proper file type validation
*/

-- Create teams bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "teams_storage_read_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete_policy" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create helper function for team ownership check
CREATE OR REPLACE FUNCTION storage.is_team_owner(object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  team_id text;
  file_team_id text;
BEGIN
  -- Extract team ID from filename (format: {teamId}-{timestamp}.{ext})
  file_team_id := split_part(object_name, '-', 1);
  
  -- Verify team ownership
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id::text = file_team_id
    AND (
      user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('admin', 'coach', 'manager')
      )
    )
  );
END;
$$;

-- Create storage policies

-- Allow public read access for team photos
CREATE POLICY "teams_storage_read_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Allow team owners to upload photos
CREATE POLICY "teams_storage_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' 
  AND storage.is_team_owner(name)
  AND (lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif']))
);

-- Allow team owners to update their photos
CREATE POLICY "teams_storage_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' 
  AND storage.is_team_owner(name)
)
WITH CHECK (
  bucket_id = 'teams' 
  AND storage.is_team_owner(name)
  AND (lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif']))
);

-- Allow team owners to delete their photos
CREATE POLICY "teams_storage_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' 
  AND storage.is_team_owner(name)
);

-- Add comment
COMMENT ON FUNCTION storage.is_team_owner(text) IS 'Checks if the current user owns the team associated with the file';