/*
  # Fix Storage Permissions

  1. Changes
    - Adds storage bucket for team photos
    - Sets up proper RLS policies for storage access
    - Optimizes policy creation to avoid timeouts
    
  2. Security
    - Enables RLS on storage.objects
    - Adds scoped access policies for team photos
    - Enforces team ownership verification
*/

-- Create teams bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('teams', 'teams')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies one by one to avoid lock contention
DROP POLICY IF EXISTS "Give users authenticated access to folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow team owners to upload team photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow team owners to update team photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow team owners to delete team photos" ON storage.objects;
DROP POLICY IF EXISTS "storage_teams_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_teams_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_teams_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "storage_teams_delete_policy" ON storage.objects;

-- Create helper function for team ownership check
CREATE OR REPLACE FUNCTION storage.is_team_owner(object_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams
    WHERE id::text = SPLIT_PART(object_name, '-', 1)
    AND user_id = auth.uid()
  );
END;
$$;

-- Create optimized storage policies
CREATE POLICY "storage_teams_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

CREATE POLICY "storage_teams_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

CREATE POLICY "storage_teams_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);

CREATE POLICY "storage_teams_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  storage.is_team_owner(name)
);