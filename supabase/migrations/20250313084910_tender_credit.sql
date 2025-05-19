-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "teams_storage_read_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_insert_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_update_policy" ON storage.objects;
  DROP POLICY IF EXISTS "teams_storage_delete_policy" ON storage.objects;
  DROP POLICY IF EXISTS "authenticated_storage_access" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create separate policies for each operation type
CREATE POLICY "storage_teams_select"
ON storage.objects FOR SELECT
USING (true);

CREATE POLICY "storage_teams_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "storage_teams_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "storage_teams_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (true);

-- Update bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id = 'teams';