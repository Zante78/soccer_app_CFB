-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage own export jobs" ON export_jobs;
  DROP POLICY IF EXISTS "export_jobs_user_access_policy" ON export_jobs;
  DROP POLICY IF EXISTS "export_jobs_user_access_policy_v1" ON export_jobs;
  DROP POLICY IF EXISTS "export_jobs_user_access_policy_v2" ON export_jobs;
  DROP POLICY IF EXISTS "export_jobs_user_access_policy_v3" ON export_jobs;
  DROP POLICY IF EXISTS "export_jobs_user_access_policy_v4" ON export_jobs;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop existing table if exists
DROP TABLE IF EXISTS export_jobs CASCADE;

-- Create export_jobs table with all columns
CREATE TABLE export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer CHECK (progress IS NULL OR (progress >= 0 AND progress <= 100)),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies with unique names
CREATE POLICY "export_jobs_user_access_policy_v5"
  ON export_jobs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS export_jobs_user_id_idx ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS export_jobs_status_idx ON export_jobs(status);
CREATE INDEX IF NOT EXISTS export_jobs_created_at_idx ON export_jobs(created_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_export_jobs_updated_at ON export_jobs;
CREATE TRIGGER update_export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for exports if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v1" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v2" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v3" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v4" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create storage policies with unique names
CREATE POLICY "storage_objects_exports_access_policy_v5"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add comments
COMMENT ON TABLE export_jobs IS 'Stores export job information and status';
COMMENT ON COLUMN export_jobs.config IS 'Export configuration including type, format, and filters';
COMMENT ON COLUMN export_jobs.result IS 'Export result including download URL or error details';
COMMENT ON COLUMN export_jobs.progress IS 'Export progress percentage (0-100)';