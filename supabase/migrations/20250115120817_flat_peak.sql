-- Drop existing policies
DROP POLICY IF EXISTS "teams_read_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;
DROP POLICY IF EXISTS "teams_authenticated_access_policy" ON teams;
DROP POLICY IF EXISTS "teams_policy" ON teams;
DROP POLICY IF EXISTS "Allow authenticated access to teams" ON teams;

-- Create a single permissive policy for development
CREATE POLICY "allow_all_teams"
ON teams
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Ensure we have at least one team for testing
INSERT INTO teams (name, category, season)
SELECT 'Test Team', 'Test Category', '2024'
WHERE NOT EXISTS (SELECT 1 FROM teams);