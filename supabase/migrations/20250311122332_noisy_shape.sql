/*
  # Storage Bucket and RLS Policies for Team Photos

  1. Storage Setup
    - Creates 'teams' storage bucket for team photos
    - Enables RLS on storage objects

  2. Security
    - Public read access for team photos
    - Write/update/delete access only for team owners
    - Uses proper RLS policies with team ownership validation
*/

-- Create teams storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for reading team photos (public)
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Policy for uploading/updating team photos
CREATE POLICY "Team owners can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id::text = split_part(name, '/', 1)
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
    WHERE teams.id::text = split_part(name, '/', 1)
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
    WHERE teams.id::text = split_part(name, '/', 1)
    AND teams.user_id = auth.uid()
  )
);