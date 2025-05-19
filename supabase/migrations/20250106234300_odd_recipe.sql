-- Drop problematic policies and simplify role management
DROP TABLE IF EXISTS user_roles CASCADE;

-- Modify users table to include role
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users ADD COLUMN role text NOT NULL DEFAULT 'user' 
  CHECK (role IN ('admin', 'user', 'coach', 'manager'));

-- Create simple policies for teams
DROP POLICY IF EXISTS "Allow authenticated access" ON teams;

-- Create separate policies for each operation
CREATE POLICY "Users can read teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "Users can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "Users can delete teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

-- Update user registration function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;