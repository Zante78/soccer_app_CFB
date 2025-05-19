-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Recreate storage policies with unique names
CREATE POLICY "storage_objects_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('teams', 'players', 'logos'));

CREATE POLICY "storage_objects_select_policy"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('teams', 'players', 'logos'));

CREATE POLICY "storage_objects_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id IN ('teams', 'players', 'logos'));

-- Ensure all required buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('teams', 'teams', true),
  ('players', 'players', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure unique index for active memberships exists
DROP INDEX IF EXISTS unique_active_player_membership;
CREATE UNIQUE INDEX unique_active_player_membership 
ON team_memberships (player_id) 
WHERE end_date IS NULL;