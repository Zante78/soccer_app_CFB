-- Drop ALL existing policies first
DO $$ 
BEGIN
  -- Drop ALL versions of storage policies
  DROP POLICY IF EXISTS "storage_objects_exports_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v1" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v2" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v3" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v4" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v5" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v6" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v7" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v8" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v9" ON storage.objects;
  
  -- Drop other policies that might conflict
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v1" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v2" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v3" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v4" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v5" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create new storage policy with unique name
CREATE POLICY "storage_objects_exports_policy_v10"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add comment
COMMENT ON POLICY "storage_objects_exports_policy_v10" ON storage.objects IS 'Controls access to export files in storage';