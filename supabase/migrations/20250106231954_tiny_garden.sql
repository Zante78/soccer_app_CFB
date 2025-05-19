-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON teams;

-- Create new policies that allow full access for authenticated users
CREATE POLICY "Allow authenticated access"
  ON teams
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);