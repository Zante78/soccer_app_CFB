/*
  # Fix Team Memberships Table and Policies

  1. Changes
    - Drop existing policies and constraints
    - Recreate table with proper types
    - Add proper constraints and indexes
    - Add comprehensive RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add role-based access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view team memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can modify memberships" ON team_memberships;
DROP POLICY IF EXISTS "Allow read access to team memberships" ON team_memberships;
DROP POLICY IF EXISTS "Allow team managers to insert memberships" ON team_memberships;
DROP POLICY IF EXISTS "Allow team managers to update memberships" ON team_memberships;
DROP POLICY IF EXISTS "Allow team managers to delete memberships" ON team_memberships;

-- Recreate table with proper types
DROP TABLE IF EXISTS team_memberships;

CREATE TABLE team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('player', 'captain', 'viceCaptain')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date CHECK (end_date IS NULL OR end_date >= start_date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX team_memberships_team_id_idx ON team_memberships(team_id);
CREATE INDEX team_memberships_player_id_idx ON team_memberships(player_id);
CREATE INDEX team_memberships_active_idx ON team_memberships(player_id) WHERE end_date IS NULL;
CREATE UNIQUE INDEX team_memberships_active_unique_idx ON team_memberships(player_id) WHERE end_date IS NULL;

-- Add updated_at trigger
CREATE TRIGGER update_team_memberships_updated_at
  BEFORE UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Authenticated users can read team memberships"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team managers can insert memberships"
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

CREATE POLICY "Team managers can update memberships"
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

CREATE POLICY "Team managers can delete memberships"
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

-- Add validation function
CREATE OR REPLACE FUNCTION validate_team_membership()
RETURNS trigger AS $$
BEGIN
  -- Check for existing active membership
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.player_id != NEW.player_id) THEN
    IF EXISTS (
      SELECT 1 FROM team_memberships
      WHERE player_id = NEW.player_id
      AND end_date IS NULL
      AND id != COALESCE(NEW.id, -1)
    ) THEN
      RAISE EXCEPTION 'Player already has an active team membership';
    END IF;
  END IF;

  -- Validate dates
  IF NEW.start_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Start date cannot be in the future';
  END IF;

  IF NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;

  -- Validate role
  IF NEW.role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
CREATE TRIGGER validate_team_membership_trigger
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership();

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_role 
  ON users(role) 
  WHERE role IN ('admin', 'coach', 'manager');

-- Grant necessary permissions
GRANT SELECT ON team_memberships TO authenticated;
GRANT INSERT, UPDATE, DELETE ON team_memberships TO authenticated;