/*
  # Fix Storage Policies

  1. Changes
    - Safely drops and recreates storage policies
    - Adds proper team ownership checks
    - Implements secure file access controls
    
  2. Security
    - Public read access for uploaded files
    - Restricted upload/modify access to team owners
    - Proper path validation
*/

-- First check and drop existing policies safely
DO $$ 
DECLARE
  policy_name text;
  policy_names text[] := ARRAY[
    'Allow public read access',
    'Allow team owners to upload team photos',
    'Allow team owners to update team photos',
    'Allow team owners to delete team photos',
    'Public Read Access',
    'Authenticated Upload Access',
    'Authenticated Update Access',
    'Authenticated Delete Access',
    'Storage Read Access',
    'Storage Upload Access',
    'Storage Update Access',
    'Storage Delete Access'
  ];
BEGIN
  FOREACH policy_name IN ARRAY policy_names
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = policy_name
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    END IF;
  END LOOP;
END $$;

-- Enable RLS on storage.objects if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create new storage policies with unique names
CREATE POLICY "storage_public_read_20250311"
ON storage.objects FOR SELECT
USING (bucket_id IN ('teams', 'players'));

CREATE POLICY "storage_team_upload_20250311"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'teams' 
  AND (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id::text = SPLIT_PART(name, '-', 1)
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "storage_team_update_20250311"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams'
  AND (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id::text = SPLIT_PART(name, '-', 1)
      AND user_id = auth.uid()
    )
  )
);

CREATE POLICY "storage_team_delete_20250311"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams'
  AND (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE id::text = SPLIT_PART(name, '-', 1)
      AND user_id = auth.uid()
    )
  )
);