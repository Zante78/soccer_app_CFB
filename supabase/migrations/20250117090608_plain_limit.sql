-- Create rollback checkpoint
-- This migration serves as a checkpoint and consolidates previous changes

-- Drop existing functions and indexes for clean slate
DO $$ 
BEGIN
    -- Drop functions
    DROP FUNCTION IF EXISTS add_team_member(uuid, uuid, text);
    DROP FUNCTION IF EXISTS get_player_stats(uuid);
    DROP FUNCTION IF EXISTS search_players(text,text);
    
    -- Drop indexes
    DROP INDEX IF EXISTS unique_active_membership;
    DROP INDEX IF EXISTS idx_team_memberships_active;
    DROP INDEX IF EXISTS idx_team_memberships_end_date;
    DROP INDEX IF EXISTS idx_team_memberships_team;
    DROP INDEX IF EXISTS idx_team_memberships_composite;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Recreate add_team_member function with proper parameter naming
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
  -- Check for existing active membership
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

-- Recreate player stats function
CREATE OR REPLACE FUNCTION get_player_stats(p_id uuid)
RETURNS TABLE (
  total_teams bigint,
  total_evaluations bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT tm.team_id)::bigint,
    COUNT(DISTINCT e.id)::bigint,
    COALESCE(AVG(e.overall_rating), 0)::numeric
  FROM players p
  LEFT JOIN team_memberships tm ON tm.player_id = p.id
  LEFT JOIN evaluations e ON e.player_id = p.id
  WHERE p.id = p_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Recreate search function
CREATE OR REPLACE FUNCTION search_players(
  search_term text,
  position_filter text DEFAULT NULL
) 
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  player_position text,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.position,
    COALESCE(
      (SELECT AVG(e.overall_rating)::numeric 
       FROM evaluations e 
       WHERE e.player_id = p.id),
      0::numeric
    ) as avg_rating
  FROM players p
  WHERE 
    (position_filter IS NULL OR p.position = position_filter)
    AND (
      search_term IS NULL 
      OR p.first_name ILIKE '%' || search_term || '%'
      OR p.last_name ILIKE '%' || search_term || '%'
      OR p.position ILIKE '%' || search_term || '%'
    )
  ORDER BY p.last_name, p.first_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_end_date ON team_memberships(player_id, end_date);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_composite ON team_memberships(player_id, team_id, role);

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_team_member(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_player_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Add documentation
COMMENT ON FUNCTION add_team_member(uuid, uuid, text) IS 'Adds a player to a team with proper parameter naming and returns full membership data with player details';
COMMENT ON FUNCTION get_player_stats(uuid) IS 'Returns player statistics including teams, evaluations and ratings';
COMMENT ON FUNCTION search_players(text,text) IS 'Search players by name or position with optional filtering';
COMMENT ON INDEX idx_team_memberships_end_date IS 'Index for finding active/inactive memberships';
COMMENT ON INDEX idx_team_memberships_team IS 'Index for team member lookups';
COMMENT ON INDEX idx_team_memberships_composite IS 'Composite index for common membership queries';