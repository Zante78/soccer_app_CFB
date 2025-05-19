-- Create export_jobs table
CREATE TABLE IF NOT EXISTS export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  config jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own export jobs"
  ON export_jobs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX export_jobs_user_id_idx ON export_jobs(user_id);
CREATE INDEX export_jobs_status_idx ON export_jobs(status);

-- Create trigger for updated_at
CREATE TRIGGER update_export_jobs_updated_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();