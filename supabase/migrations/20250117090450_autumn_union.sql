-- Drop existing function if it exists
DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);

-- Create improved version with renamed parameters
CREATE OR REPLACE FUNCTION add_team_member(
  p_team_id uuid,
  p_player_id uuid,
  p_role text
)
RETURNS TABLE (
  id uuid,
  team_id uuid,
  player_id uuid,
  role text,
  start_date date,
  end_date date,
  created_at timestamptz,
  updated_at timestamptz,
  player jsonb
) AS $$
BEGIN
  -- First check if player already has an active membership
  IF EXISTS (
    SELECT 1 FROM team_memberships 
    WHERE player_id = p_player_id
    AND end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;

  -- Insert new membership and return with player data
  RETURN QUERY
  WITH new_membership AS (
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
    RETURNING *
  )
  SELECT 
    m.*,
    to_jsonb(p.*) as player
  FROM new_membership m
  LEFT JOIN players p ON p.id = m.player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION add_team_member(uuid, uuid, text) IS 'Adds a player to a team with proper parameter naming and returns full membership data with player details';