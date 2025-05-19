-- Fix team table columns
ALTER TABLE teams 
  DROP COLUMN IF EXISTS photoUrl,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Ensure RLS is enabled with proper policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper error handling
DROP POLICY IF EXISTS "Allow authenticated access to teams" ON teams;

CREATE POLICY "Allow authenticated access to teams"
  ON teams
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);