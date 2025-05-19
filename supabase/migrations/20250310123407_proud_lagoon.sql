/*
  # Team Management Permissions Update

  1. Changes
    - Drop and recreate team membership policies
    - Update helper functions for permission checks
    - Improve validation in stored procedures

  2. Security
    - Maintain RLS on team_memberships table
    - Recreate policies with proper checks
    - Update security definer functions

  3. Notes
    - Ensures clean policy recreation
    - Maintains existing security model
    - Improves error handling
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Team managers can create memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can update memberships" ON team_memberships;
DROP POLICY IF EXISTS "Team managers can delete memberships" ON team_memberships;
DROP POLICY IF EXISTS "Users can view team memberships" ON team_memberships;

-- Drop existing functions
DROP FUNCTION IF EXISTS can_manage_teams();
DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
DROP FUNCTION IF EXISTS end_team_membership(uuid);

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

-- Enable RLS on team_memberships (if not already enabled)
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Recreate policies for team_memberships
CREATE POLICY "Team managers can create memberships"
  ON team_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (can_manage_teams());

CREATE POLICY "Team managers can update memberships"
  ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (can_manage_teams())
  WITH CHECK (can_manage_teams());

CREATE POLICY "Team managers can delete memberships"
  ON team_memberships
  FOR DELETE
  TO authenticated
  USING (can_manage_teams());

CREATE POLICY "Users can view team memberships"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

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
  -- Check if player already has an active membership
  IF EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = p_player_id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Spieler ist bereits Mitglied eines Teams';
  END IF;

  -- Validate role
  IF p_role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Ungültige Rolle. Erlaubte Werte: player, captain, viceCaptain';
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
  -- Update membership end date
  UPDATE team_memberships
  SET end_date = CURRENT_DATE
  WHERE id = p_membership_id;

  -- Raise exception if membership not found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mitgliedschaft nicht gefunden';
  END IF;
END;
$$;