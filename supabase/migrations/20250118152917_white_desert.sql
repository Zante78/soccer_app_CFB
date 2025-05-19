-- Drop existing functions if they exist
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create helper function for adding team members with proper type handling
CREATE OR REPLACE FUNCTION add_team_member(
  in_team_id uuid,
  in_player_id uuid,
  in_role text
)
RETURNS TABLE (
  id uuid,
  team_id uuid,
  player_id uuid,
  role text,
  start_date date,
  end_date date,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
DECLARE
  v_membership record;
BEGIN
  -- Validate input parameters
  IF in_team_id IS NULL THEN
    RAISE EXCEPTION 'Team ID cannot be null';
  END IF;
  
  IF in_player_id IS NULL THEN
    RAISE EXCEPTION 'Player ID cannot be null';
  END IF;
  
  IF in_role IS NULL OR in_role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- First check if player already has an active membership
  IF EXISTS (
    SELECT 1 FROM team_memberships 
    WHERE player_id = in_player_id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;

  -- Insert new membership
  RETURN QUERY
  INSERT INTO team_memberships (
    team_id,
    player_id,
    role,
    start_date
  )
  VALUES (
    in_team_id,
    in_player_id,
    in_role,
    CURRENT_DATE
  )
  RETURNING *;

EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Invalid team or player ID';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding team member: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION add_team_member(uuid, uuid, text) IS 'Adds a player to a team with input validation and error handling';