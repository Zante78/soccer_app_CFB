-- Drop ALL existing storage policies first to ensure clean slate
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
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v10" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_20250121" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_20250121_v2" ON storage.objects;
  
  -- Drop other policy variations
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v1" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v2" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v3" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v4" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v5" ON storage.objects;
  
  -- Drop any other potential variations
  DROP POLICY IF EXISTS "exports_policy" ON storage.objects;
  DROP POLICY IF EXISTS "exports_access_policy" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create separate policies for each operation type
CREATE POLICY "storage_objects_exports_select_20250121"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "storage_objects_exports_insert_20250121"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "storage_objects_exports_delete_20250121"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add comments
COMMENT ON POLICY "storage_objects_exports_select_20250121" ON storage.objects 
IS 'Allows users to read their own export files (created 2025-01-21)';

COMMENT ON POLICY "storage_objects_exports_insert_20250121" ON storage.objects 
IS 'Allows users to create export files in their own folder (created 2025-01-21)';

COMMENT ON POLICY "storage_objects_exports_delete_20250121" ON storage.objects 
IS 'Allows users to delete their own export files (created 2025-01-21)';