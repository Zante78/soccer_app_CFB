/*
  # Add Team Member Management Functions

  1. New Functions
    - add_team_member: Safely adds a new team member with validation
    - end_team_membership: Safely ends a team membership
    
  2. Security
    - Functions are security definer to run with elevated privileges
    - Input validation and error handling
    - Proper permission checks
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
DROP FUNCTION IF EXISTS end_team_membership(uuid);

-- Function to add a team member
CREATE FUNCTION add_team_member(
  p_team_id uuid,
  p_player_id uuid,
  p_role text
)
RETURNS team_memberships
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_role text;
  v_result team_memberships;
BEGIN
  -- Check user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = auth.uid();

  IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'coach', 'manager') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Check for existing active membership
  IF EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = p_player_id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
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
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to end a team membership
CREATE FUNCTION end_team_membership(
  p_membership_id uuid
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Check user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = auth.uid();

  IF v_user_role IS NULL OR v_user_role NOT IN ('admin', 'coach', 'manager') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Update membership
  UPDATE team_memberships
  SET 
    end_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = p_membership_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membership not found';
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION end_team_membership(uuid) TO authenticated;

-- Add RLS policies for team_memberships table
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Policy for inserting team memberships
CREATE POLICY "Users can create team memberships" ON team_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Policy for reading team memberships
CREATE POLICY "Users can read team memberships" ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for updating team memberships
CREATE POLICY "Users can update team memberships" ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Policy for deleting team memberships
CREATE POLICY "Users can delete team memberships" ON team_memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );