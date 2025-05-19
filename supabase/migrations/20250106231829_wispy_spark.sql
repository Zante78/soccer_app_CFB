-- Drop and recreate policies with proper access
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON club_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON club_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON club_settings;

-- Create a single policy that allows full access to authenticated users
CREATE POLICY "Allow authenticated access"
  ON club_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure default settings exist
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);