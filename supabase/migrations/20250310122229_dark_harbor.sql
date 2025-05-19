/*
  # Team Management Authorization Policies

  1. New Policies
    - Add RLS policies for team memberships table
    - Add helper function for checking team management permissions
    - Add policies for different user roles (admin, coach, manager)

  2. Security
    - Enable RLS on team_memberships table
    - Add policies for read/write access based on user role
    - Add policies for team-specific access

  3. Changes
    - Add helper function for role checking
    - Add policies for CRUD operations
*/

-- Helper function to check if user has team management permissions
CREATE OR REPLACE FUNCTION can_manage_teams(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id 
    AND role IN ('admin', 'coach', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on team_memberships
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Policy for reading team memberships
CREATE POLICY "Team memberships are visible to authenticated users"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for creating team memberships
CREATE POLICY "Only admins, coaches and managers can add team members"
  ON team_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    can_manage_teams(auth.uid())
  );

-- Policy for updating team memberships
CREATE POLICY "Only admins, coaches and managers can update team members"
  ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (
    can_manage_teams(auth.uid())
  )
  WITH CHECK (
    can_manage_teams(auth.uid())
  );

-- Policy for deleting team memberships
CREATE POLICY "Only admins, coaches and managers can remove team members"
  ON team_memberships
  FOR DELETE
  TO authenticated
  USING (
    can_manage_teams(auth.uid())
  );

-- Add trigger to validate team membership changes
CREATE OR REPLACE FUNCTION validate_team_membership_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has permission
  IF NOT can_manage_teams(auth.uid()) THEN
    RAISE EXCEPTION 'Sie haben keine Berechtigung, Teammitglieder zu verwalten';
  END IF;

  -- For new memberships, check if player already has an active membership
  IF TG_OP = 'INSERT' THEN
    IF EXISTS (
      SELECT 1 FROM team_memberships
      WHERE player_id = NEW.player_id
      AND end_date IS NULL
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Spieler ist bereits Mitglied eines Teams';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_team_membership_changes
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership_changes();