/*
  # Fix Team Memberships RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Add new comprehensive RLS policies
    - Fix permission checks for team managers
    
  2. Security
    - Enable RLS
    - Add policies for read/write access
    - Add role-based access control
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Users can view team memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can modify memberships" ON team_memberships;
DROP POLICY IF EXISTS "Authenticated users can view team memberships" ON team_memberships;

-- Enable RLS
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow read access to team memberships"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow team managers to insert memberships"
  ON team_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "Allow team managers to update memberships"
  ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "Allow team managers to delete memberships"
  ON team_memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_role ON users(role) WHERE role IN ('admin', 'coach', 'manager');