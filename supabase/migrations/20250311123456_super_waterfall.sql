/*
  # Team Storage Policies Update

  1. Storage Setup
    - Creates teams storage bucket if not exists
    - Ensures RLS is enabled
  
  2. Storage Policies
    - Updates existing policies or creates new ones for team photos
    - Handles policy conflicts gracefully
*/

-- Create teams storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Team photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can upload photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can update photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can delete photos" ON storage.objects;
END $$;

-- Policy for reading team photos (public)
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Policy for uploading team photos
CREATE POLICY "Team owners can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = SPLIT_PART(name, '-', 1)::uuid
    AND teams.user_id = auth.uid()
  )
);

-- Policy for updating team photos
CREATE POLICY "Team owners can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = SPLIT_PART(name, '-', 1)::uuid
    AND teams.user_id = auth.uid()
  )
);

-- Policy for deleting team photos
CREATE POLICY "Team owners can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = SPLIT_PART(name, '-', 1)::uuid
    AND teams.user_id = auth.uid()
  )
);