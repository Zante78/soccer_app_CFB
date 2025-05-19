-- Drop existing objects safely
DO $$ 
BEGIN
  -- Drop ALL existing policies
  DROP POLICY IF EXISTS "export_jobs_user_access_policy_v5" ON export_jobs;
  DROP POLICY IF EXISTS "storage_objects_exports_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_access_policy_v5" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v1" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v2" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v3" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v4" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v5" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v6" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_exports_policy_v7" ON storage.objects;
  
  -- Drop tables
  DROP TABLE IF EXISTS export_jobs CASCADE;
  DROP TABLE IF EXISTS notifications CASCADE;
  
  -- Drop type
  DROP TYPE IF EXISTS notification_type CASCADE;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create notification type enum if not exists
DO $$ 
BEGIN
  CREATE TYPE notification_type AS ENUM (
    'match',
    'training',
    'player',
    'team',
    'system',
    'export'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create export_jobs table with required progress column
CREATE TABLE export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for export_jobs
CREATE POLICY "export_jobs_access_policy"
  ON export_jobs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX export_jobs_user_id_idx ON export_jobs(user_id);
CREATE INDEX export_jobs_status_idx ON export_jobs(status);
CREATE INDEX export_jobs_created_at_idx ON export_jobs(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Create new storage policy with unique name
CREATE POLICY "storage_objects_exports_policy_v8"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type notification_type NOT NULL,
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  priority notification_priority NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz,
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "notifications_select_policy"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_policy"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_policy"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_policy"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create notification indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);

-- Add comments
COMMENT ON TABLE export_jobs IS 'Stores export job information and status';
COMMENT ON COLUMN export_jobs.config IS 'Export configuration including type, format, and filters';
COMMENT ON COLUMN export_jobs.result IS 'Export result including download URL or error details';
COMMENT ON COLUMN export_jobs.progress IS 'Export progress percentage (0-100)';
COMMENT ON TABLE notifications IS 'Stores user notifications including export status updates';