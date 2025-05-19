/*
  # Storage Bucket and Policies Setup

  1. Changes
    - Create players storage bucket if not exists
    - Set up RLS policies for storage.objects
    - Add policy for players table photo updates
    
  2. Security
    - Authenticated users can view and upload photos
    - Admins and coaches can delete photos
    - Users can update their own photos
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'players'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('players', 'players', true);
  END IF;
END $$;

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$
BEGIN
  -- Drop view policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can view player photos'
  ) THEN
    DROP POLICY "Authenticated users can view player photos" ON storage.objects;
  END IF;

  -- Drop upload policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload player photos'
  ) THEN
    DROP POLICY "Authenticated users can upload player photos" ON storage.objects;
  END IF;

  -- Drop delete policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Admins and coaches can delete player photos'
  ) THEN
    DROP POLICY "Admins and coaches can delete player photos" ON storage.objects;
  END IF;

  -- Drop update policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can update their own photos'
  ) THEN
    DROP POLICY "Users can update their own photos" ON storage.objects;
  END IF;

  -- Drop player photo update policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'players' 
    AND schemaname = 'public' 
    AND policyname = 'Users can update player photos'
  ) THEN
    DROP POLICY "Users can update player photos" ON players;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Authenticated users can view player photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'players');

CREATE POLICY "Authenticated users can upload player photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);

CREATE POLICY "Admins and coaches can delete player photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'coach')
  ))
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'players')
WITH CHECK (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);

-- Add policy to players table for photo_url updates
CREATE POLICY "Users can update player photos"
ON players FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);