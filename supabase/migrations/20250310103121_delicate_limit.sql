/*
  # Fix Team Memberships Schema and Policies

  1. Changes
    - Drop existing policies
    - Fix type inconsistencies
    - Add proper constraints and validation
    - Recreate policies with improved security

  2. Security
    - Improved RLS policies
    - Added validation triggers
    - Added membership constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Team members can read memberships" ON team_memberships;
DROP POLICY IF EXISTS "Users can view team memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can modify memberships" ON team_memberships;

-- Create temporary table for data migration
CREATE TABLE team_memberships_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  player_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('player', 'captain', 'viceCaptain')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_memberships_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT team_memberships_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Copy data to new table with proper type casting
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

-- Drop old table and rename new one
DROP TABLE team_memberships;
ALTER TABLE team_memberships_new RENAME TO team_memberships;

-- Create indexes
CREATE INDEX team_memberships_team_id_idx ON team_memberships(team_id);
CREATE INDEX team_memberships_player_id_idx ON team_memberships(player_id);
CREATE INDEX team_memberships_active_idx ON team_memberships(player_id) WHERE end_date IS NULL;

-- Create unique constraint for active memberships
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

  -- Set updated_at on update
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER validate_team_membership_trigger
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership();

-- Enable RLS
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "team_memberships_read_policy" 
  ON team_memberships
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "team_memberships_insert_policy"
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

CREATE POLICY "team_memberships_update_policy"
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

CREATE POLICY "team_memberships_delete_policy"
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

-- Add comment
COMMENT ON TABLE team_memberships IS 'Stores team membership information with improved validation and security';