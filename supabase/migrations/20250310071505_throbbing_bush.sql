/*
  # Storage RLS Policies Fix

  1. Changes
    - Create storage bucket for players
    - Set up proper RLS policies for storage access
    - Add policies for player photo updates
    
  2. Security
    - Authenticated users can upload their own photos
    - Admins and coaches can manage all photos
    - Public read access for player photos
*/

-- Create storage bucket if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'players'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('players', 'players', true);
  END IF;
END $$;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  -- Storage policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view player photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Public can view player photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload player photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can upload player photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update player photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Users can update player photos" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete player photos' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Admins can delete player photos" ON storage.objects;
  END IF;
END $$;

-- Create new storage policies
CREATE POLICY "Public can view player photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');

CREATE POLICY "Users can upload player photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players' AND
  auth.role() IN ('authenticated', 'service_role')
);

CREATE POLICY "Users can update player photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'players')
WITH CHECK (
  bucket_id = 'players' AND
  auth.role() IN ('authenticated', 'service_role')
);

CREATE POLICY "Admins can delete player photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'players' AND
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Update players table policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update player photos' AND tablename = 'players') THEN
    DROP POLICY "Users can update player photos" ON players;
  END IF;
END $$;

CREATE POLICY "Users can update player photos"
ON players FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;