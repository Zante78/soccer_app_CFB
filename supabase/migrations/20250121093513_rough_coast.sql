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
  DROP POLICY IF EXISTS "storage_objects_exports_select_20250121" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_insert_20250121" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_delete_20250121" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create separate policies for each operation type with proper error handling
DO $$ 
BEGIN
  -- Create SELECT policy
  CREATE POLICY "exports_select_policy_20250121"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

  -- Create INSERT policy
  CREATE POLICY "exports_insert_policy_20250121"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

  -- Create UPDATE policy
  CREATE POLICY "exports_update_policy_20250121"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

  -- Create DELETE policy
  CREATE POLICY "exports_delete_policy_20250121"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'exports' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Policy already exists, skipping creation';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating storage policies: %', SQLERRM;
END $$;

-- Add comments
COMMENT ON POLICY "exports_select_policy_20250121" ON storage.objects 
IS 'Allows users to read their own export files (created 2025-01-21)';

COMMENT ON POLICY "exports_insert_policy_20250121" ON storage.objects 
IS 'Allows users to create export files in their own folder (created 2025-01-21)';

COMMENT ON POLICY "exports_update_policy_20250121" ON storage.objects 
IS 'Allows users to update their own export files (created 2025-01-21)';

COMMENT ON POLICY "exports_delete_policy_20250121" ON storage.objects 
IS 'Allows users to delete their own export files (created 2025-01-21)';

-- Ensure export_jobs table has proper structure
ALTER TABLE export_jobs 
ALTER COLUMN progress SET DEFAULT 0,
ALTER COLUMN progress SET NOT NULL;

-- Create function to handle export job status updates
CREATE OR REPLACE FUNCTION handle_export_job_update()
RETURNS trigger AS $$
BEGIN
  -- Update updated_at timestamp
  NEW.updated_at = now();
  
  -- Validate progress value
  IF NEW.progress < 0 OR NEW.progress > 100 THEN
    RAISE EXCEPTION 'Progress must be between 0 and 100';
  END IF;

  -- Set status based on progress
  IF NEW.progress = 100 THEN
    NEW.status = 'completed';
  ELSIF NEW.progress > 0 THEN
    NEW.status = 'processing';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for export job updates
DROP TRIGGER IF EXISTS export_job_update_trigger ON export_jobs;
CREATE TRIGGER export_job_update_trigger
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_export_job_update();

-- Add comments
COMMENT ON FUNCTION handle_export_job_update() 
IS 'Handles export job updates including progress validation and status changes';

COMMENT ON TRIGGER export_job_update_trigger ON export_jobs 
IS 'Trigger to handle export job updates (created 2025-01-21)';