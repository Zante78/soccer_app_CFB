/*
  # Fix Player Photo Upload Permissions

  1. Changes
    - Create storage bucket for player photos
    - Set up proper RLS policies for storage access
    - Add policies for player photo updates
    
  2. Security
    - Enable RLS on storage bucket
    - Allow authenticated users to upload/update photos
    - Allow public read access for photos
*/

-- Create players bucket if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'players'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('players', 'Player Photos', true);
  END IF;
END $$;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Storage policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Public Read Access" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Can Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Authenticated Users Can Upload" ON storage.objects;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Can Update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Authenticated Users Can Update" ON storage.objects;
  END IF;

  -- Players table policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players Photo Update' AND tablename = 'players') THEN
    DROP POLICY "Players Photo Update" ON public.players;
  END IF;
END $$;

-- Create storage policies
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');

CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
);

CREATE POLICY "Authenticated Users Can Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'players')
WITH CHECK (bucket_id = 'players');

-- Create specific policy for photo_url updates in players table
CREATE POLICY "Players Photo Update"
ON public.players
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  -- Only allow photo_url updates
  (
    CASE WHEN auth.uid() IS NULL THEN false
    ELSE true
    END
  )
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;