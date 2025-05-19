-- Drop existing team policies
DROP POLICY IF EXISTS "Authenticated users can read teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can update teams" ON teams;
DROP POLICY IF EXISTS "Authenticated users can delete teams" ON teams;

-- Create a single policy for all operations
CREATE POLICY "Allow authenticated users full access"
  ON teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;