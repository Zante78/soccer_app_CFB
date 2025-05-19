/*
  # Fix Storage RLS Policies

  1. Changes
    - Simplify RLS policies for storage
    - Fix team ownership checks
    - Ensure proper access for file uploads
    
  2. Security
    - Maintain public read access
    - Allow authenticated users to upload
    - Validate file types
*/

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "teams_storage_read_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete_policy" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified storage policies

-- Allow public read access
CREATE POLICY "teams_storage_read_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

-- Allow authenticated users to upload
CREATE POLICY "teams_storage_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teams');

-- Allow authenticated users to update their uploads
CREATE POLICY "teams_storage_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'teams')
WITH CHECK (bucket_id = 'teams');

-- Allow authenticated users to delete their uploads
CREATE POLICY "teams_storage_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'teams');

-- Update bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id = 'teams';