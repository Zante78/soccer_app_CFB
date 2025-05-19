/*
  # Fix Storage Access Policies

  1. Changes
    - Create storage bucket for players if not exists
    - Set up proper RLS policies for storage access
    - Add policies for player photo updates
    
  2. Security
    - Enable public read access for player photos
    - Allow authenticated users to upload and update photos
    - Ensure proper bucket configuration
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
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Allow public read access" ON storage.objects;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated uploads' AND tablename = 'objects' AND schemaname = 'storage') THEN
    DROP POLICY "Allow authenticated uploads" ON storage.objects;
  END IF;
END $$;

-- Create new storage policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'players');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Update players table policy for photo updates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow photo updates' AND tablename = 'players') THEN
    DROP POLICY "Allow photo updates" ON players;
  END IF;
END $$;

CREATE POLICY "Allow photo updates"
ON players FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);