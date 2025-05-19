/*
  # Team Member Management Functions

  1. New Functions
    - add_team_member: Adds a new team member with role validation
    - end_team_membership: Ends an existing team membership
    - has_team_management_permission: Helper function to check permissions

  2. Security
    - Functions run with security definer
    - Role-based access control
    - Business rule validation

  3. Changes
    - Drop existing functions if they exist
    - Create helper function for permission checks
    - Create main team member management functions
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
DROP FUNCTION IF EXISTS end_team_membership(uuid);
DROP FUNCTION IF EXISTS has_team_management_permission();

-- Helper function to check if user has team management permission
CREATE OR REPLACE FUNCTION has_team_management_permission()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Get current user's role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = auth.uid();

  -- Return true if user has appropriate role
  RETURN v_user_role IN ('admin', 'coach', 'manager');
END;
$$;

-- Function to add a team member with proper validation
CREATE OR REPLACE FUNCTION add_team_member(
  p_team_id uuid,
  p_player_id uuid,
  p_role text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_id uuid;
BEGIN
  -- Check if user has permission
  IF NOT has_team_management_permission() THEN
    RAISE EXCEPTION 'Sie haben keine Berechtigung, Teammitglieder zu verwalten';
  END IF;

  -- Validate role
  IF p_role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Ungültige Rolle: %', p_role;
  END IF;

  -- Check if player exists
  IF NOT EXISTS (SELECT 1 FROM players WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Spieler existiert nicht';
  END IF;

  -- Check if team exists
  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_team_id) THEN
    RAISE EXCEPTION 'Team existiert nicht';
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

  -- Return the new membership ID
  RETURN json_build_object(
    'id', v_membership_id
  );
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
  -- Check if user has permission
  IF NOT has_team_management_permission() THEN
    RAISE EXCEPTION 'Sie haben keine Berechtigung, Teammitglieder zu verwalten';
  END IF;

  -- Check if membership exists
  IF NOT EXISTS (SELECT 1 FROM team_memberships WHERE id = p_membership_id) THEN
    RAISE EXCEPTION 'Mitgliedschaft existiert nicht';
  END IF;

  -- Update membership end date
  UPDATE team_memberships
  SET 
    end_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = p_membership_id
  AND end_date IS NULL;

  -- Raise exception if no row was updated (already ended)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mitgliedschaft wurde bereits beendet';
  END IF;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION end_team_membership(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_team_management_permission() TO authenticated;