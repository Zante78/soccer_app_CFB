-- Drop existing policies to start fresh
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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simplified storage policies
CREATE POLICY "teams_storage_read_policy"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

CREATE POLICY "teams_storage_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams'
);

CREATE POLICY "teams_storage_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'teams')
WITH CHECK (bucket_id = 'teams');

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