/*
  # Storage Policies for Image Upload

  1. Changes
    - Enable RLS on storage buckets and objects
    - Configure storage access policies
    - Add photo URL validation policy
    
  2. Security
    - Public read access for player photos
    - Authenticated users can upload/update/delete photos
    - Restrict file types to images
    - Validate photo URLs
*/

-- Enable RLS on storage.buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
BEGIN
  -- Storage bucket policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Bucket Public Access' AND tablename = 'buckets' AND schemaname = 'storage') THEN
    DROP POLICY "Bucket Public Access" ON storage.buckets;
  END IF;

  -- Storage object policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Public Read Access" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Can Upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Authenticated Users Can Upload" ON storage.objects;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Can Update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Authenticated Users Can Update" ON storage.objects;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Can Delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Authenticated Users Can Delete" ON storage.objects;
  END IF;

  -- Players table policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Photo Updates' AND tablename = 'players' AND schemaname = 'public') THEN
    DROP POLICY "Allow Photo Updates" ON public.players;
  END IF;
END $$;

-- Create storage bucket for player photos if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('players', 'players')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Bucket policies
CREATE POLICY "Bucket Public Access"
ON storage.buckets
FOR SELECT
TO public
USING (name = 'players');

-- Object policies
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
);

CREATE POLICY "Authenticated Users Can Upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
  AND (lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif']))
);

CREATE POLICY "Authenticated Users Can Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
)
WITH CHECK (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
  AND (lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'gif']))
);

CREATE POLICY "Authenticated Users Can Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'players'
  AND (storage.foldername(name))[1] = 'players'
);

-- Create function to validate photo URL
CREATE OR REPLACE FUNCTION public.is_valid_photo_url(url text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    url IS NULL OR
    url LIKE 'https://%/storage/v1/object/public/players/players/%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Players table policy for photo updates
CREATE POLICY "Allow Photo Updates"
ON public.players
FOR UPDATE
TO authenticated
USING (
  -- Allow access to authenticated users
  auth.uid() IS NOT NULL
)
WITH CHECK (
  -- Only validate photo_url if it's being updated
  CASE 
    WHEN photo_url IS DISTINCT FROM (SELECT photo_url FROM public.players WHERE id = players.id)
    THEN public.is_valid_photo_url(photo_url)
    ELSE true
  END
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;