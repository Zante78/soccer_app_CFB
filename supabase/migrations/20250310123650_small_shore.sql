/*
  # Team Member Management Improvements

  1. Security
    - Add helper function for team management permission checks
    - Enable RLS on team_memberships table
    - Add comprehensive RLS policies for team member management
    - Drop and recreate team member management functions with proper validation

  2. Changes
    - Add can_manage_teams() helper function
    - Update team membership policies
    - Improve team member management functions
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_memberships' AND policyname = 'Team managers can update memberships') THEN
    DROP POLICY "Team managers can update memberships" ON team_memberships;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_memberships' AND policyname = 'Team managers can create memberships') THEN
    DROP POLICY "Team managers can create memberships" ON team_memberships;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_memberships' AND policyname = 'Team managers can delete memberships') THEN
    DROP POLICY "Team managers can delete memberships" ON team_memberships;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'team_memberships' AND policyname = 'Users can view team memberships') THEN
    DROP POLICY "Users can view team memberships" ON team_memberships;
  END IF;
END $$;

-- Helper function to check if user can manage teams
CREATE OR REPLACE FUNCTION can_manage_teams()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach', 'manager')
  );
$$;

-- Enable RLS on team_memberships
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "team_memberships_insert_policy" 
  ON team_memberships
  FOR INSERT 
  TO authenticated
  WITH CHECK (can_manage_teams());

CREATE POLICY "team_memberships_update_policy" 
  ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (can_manage_teams())
  WITH CHECK (can_manage_teams());

CREATE POLICY "team_memberships_delete_policy" 
  ON team_memberships
  FOR DELETE
  TO authenticated
  USING (can_manage_teams());

CREATE POLICY "team_memberships_select_policy" 
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop existing functions
DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
DROP FUNCTION IF EXISTS end_team_membership(uuid);

-- Function to add a team member with proper validation
CREATE OR REPLACE FUNCTION add_team_member(
  p_team_id uuid,
  p_player_id uuid,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_id uuid;
BEGIN
  -- Check permissions using helper function
  IF NOT can_manage_teams() THEN
    RAISE EXCEPTION 'Sie haben keine Berechtigung, Teammitglieder zu verwalten';
  END IF;

  -- Validate role
  IF p_role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Ungültige Rolle. Erlaubte Rollen: player, captain, viceCaptain';
  END IF;

  -- Check if player already has an active membership
  IF EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = p_player_id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Spieler ist bereits Mitglied eines Teams';
  END IF;

  -- Insert new membership
  INSERT INTO team_memberships (
    team_id,
    player_id,
    role,
    start_date
  )
  VALUES (
    p_team_id,
    p_player_id,
    p_role,
    CURRENT_DATE
  )
  RETURNING id INTO v_membership_id;

  RETURN v_membership_id;
END;
$$;

-- Function to end a team membership
CREATE OR REPLACE FUNCTION end_team_membership(
  p_membership_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check permissions using helper function
  IF NOT can_manage_teams() THEN
    RAISE EXCEPTION 'Sie haben keine Berechtigung, Teammitglieder zu verwalten';
  END IF;

  -- Update membership end date
  UPDATE team_memberships
  SET end_date = CURRENT_DATE
  WHERE id = p_membership_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mitgliedschaft nicht gefunden';
  END IF;
END;
$$;