/*
  # Team Memberships Improvements

  1. Changes
    - Drop existing policies and constraints
    - Recreate table with correct data types
    - Add improved constraints and validations
    - Add new RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add role-based access control
*/

-- First drop existing policies
DROP POLICY IF EXISTS "Users can view team memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can modify memberships" ON team_memberships;

-- Drop existing triggers
DROP TRIGGER IF EXISTS validate_team_membership_trigger ON team_memberships;

-- Drop existing functions
DROP FUNCTION IF EXISTS validate_team_membership();

-- Create temporary table and migrate data
CREATE TABLE team_memberships_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  player_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('player', 'captain', 'viceCaptain')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date CHECK (end_date IS NULL OR end_date >= start_date),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Copy data from old table
INSERT INTO team_memberships_new (
  id, team_id, player_id, role, start_date, end_date, created_at, updated_at
)
SELECT 
  id, 
  team_id::uuid, 
  player_id::uuid, 
  role, 
  start_date, 
  end_date, 
  created_at, 
  updated_at
FROM team_memberships;

-- Drop old table
DROP TABLE team_memberships;

-- Rename new table
ALTER TABLE team_memberships_new RENAME TO team_memberships;

-- Add indexes
CREATE INDEX team_memberships_team_id_idx ON team_memberships(team_id);
CREATE INDEX team_memberships_player_id_idx ON team_memberships(player_id);
CREATE INDEX team_memberships_active_idx ON team_memberships(player_id) WHERE end_date IS NULL;

-- Add unique constraint for active memberships
CREATE UNIQUE INDEX team_memberships_active_unique_idx ON team_memberships (player_id) 
WHERE end_date IS NULL;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_team_membership()
RETURNS trigger AS $$
BEGIN
  -- Validate dates
  IF NEW.start_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Start date cannot be in the future';
  END IF;
  
  IF NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'End date must be after start date';
  END IF;

  -- Check for overlapping active memberships
  IF NEW.end_date IS NULL AND EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = NEW.player_id 
    AND id != NEW.id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_team_membership_trigger
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership();

-- Enable RLS
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Authenticated users can view team memberships"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team managers can modify memberships"
  ON team_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );