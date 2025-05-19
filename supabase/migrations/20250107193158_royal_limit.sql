-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated access to teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can read teams" ON teams;

-- Create simplified policy for development
CREATE POLICY "teams_policy"
ON teams
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;