-- Drop existing functions if they exist
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create helper function for adding team members with proper type handling
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
  updated_at timestamptz
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

  -- Insert new membership
  RETURN QUERY
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
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;

-- Add comment
COMMENT ON FUNCTION add_team_member(uuid, uuid, text) IS 'Adds a player to a team with proper type handling';