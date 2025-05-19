/*
  # Add Storage Bucket Policies

  1. New Policies
    - Adds RLS policies for team photo uploads
    - Ensures users can only upload/access photos for their own teams
  
  2. Changes
    - Creates storage bucket for team photos if not exists
    - Enables RLS on storage.objects table
    - Adds policies for CRUD operations on team photos
*/

-- Create teams bucket if not exists
INSERT INTO storage.buckets (id, name)
VALUES ('teams', 'teams')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop old policy names
  DROP POLICY IF EXISTS "Anyone can view team photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload team photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their team photos" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their team photos" ON storage.objects;
  
  -- Drop new policy names
  DROP POLICY IF EXISTS "teams_storage_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_select_policy" ON storage.objects;
  
  -- Drop any other potential variations
  DROP POLICY IF EXISTS "storage_teams_insert" ON storage.objects;
  DROP POLICY IF EXISTS "storage_teams_update" ON storage.objects;
  DROP POLICY IF EXISTS "storage_teams_delete" ON storage.objects;
  DROP POLICY IF EXISTS "storage_teams_select" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create new policies with unique timestamped names
CREATE POLICY "teams_storage_insert_20250312"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id::text = split_part(name, '/', 1)
    AND user_id = auth.uid()
  )
);

CREATE POLICY "teams_storage_update_20250312"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id::text = split_part(name, '/', 1)
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id::text = split_part(name, '/', 1)
    AND user_id = auth.uid()
  )
);

CREATE POLICY "teams_storage_delete_20250312"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE id::text = split_part(name, '/', 1)
    AND user_id = auth.uid()
  )
);

CREATE POLICY "teams_storage_select_20250312"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'teams');