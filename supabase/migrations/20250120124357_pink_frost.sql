-- Create storage bucket for exports if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "storage_objects_upload_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_delete_policy" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated exports access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated exports upload" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated exports download" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated exports delete" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create storage policies with unique names
CREATE POLICY "storage_objects_exports_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_objects_exports_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_objects_exports_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'exports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add comments
COMMENT ON POLICY "storage_objects_exports_upload_policy" ON storage.objects IS 'Allow users to upload their own exports';
COMMENT ON POLICY "storage_objects_exports_select_policy" ON storage.objects IS 'Allow users to download their own exports';
COMMENT ON POLICY "storage_objects_exports_delete_policy" ON storage.objects IS 'Allow users to delete their own exports';