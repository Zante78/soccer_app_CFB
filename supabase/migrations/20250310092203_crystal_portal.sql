/*
  # Complete Storage and Player Photo RLS Setup
  
  1. Storage Configuration
    - Create and configure players bucket
    - Enable RLS on storage tables
    - Set up bucket and object policies
  
  2. Player Photo Policies
    - Allow photo URL updates
    - Validate photo URLs
    - Secure file access
    
  3. Security
    - Restrict file types to images
    - Enforce path structure
    - Validate photo URLs
*/

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('players', 'players', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean state
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
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Players Photo Update Policy' AND tablename = 'players' AND schemaname = 'public') THEN
    DROP POLICY "Players Photo Update Policy" ON public.players;
  END IF;
END $$;

-- Storage bucket policies
CREATE POLICY "Bucket Public Access"
ON storage.buckets
FOR SELECT
TO public
USING (name = 'players');

-- Storage object policies
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

-- Create helper function for URL validation
CREATE OR REPLACE FUNCTION public.is_valid_player_photo(url text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    url IS NULL OR
    url LIKE 'https://%/storage/v1/object/public/players/players/%'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Players table policies
CREATE POLICY "Players Photo Update Policy"
ON public.players
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (
  CASE 
    WHEN photo_url IS DISTINCT FROM (SELECT photo_url FROM public.players WHERE id = players.id)
    THEN public.is_valid_player_photo(photo_url)
    ELSE true
  END
);

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Ensure public access to buckets
ALTER TABLE storage.buckets FORCE ROW LEVEL SECURITY;