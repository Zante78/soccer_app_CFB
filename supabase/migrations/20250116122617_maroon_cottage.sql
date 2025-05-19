-- Drop existing objects if they exist
DROP VIEW IF EXISTS player_statistics CASCADE;
DROP FUNCTION IF EXISTS search_players CASCADE;

-- Create base tables indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);

-- Create function to calculate player statistics
CREATE OR REPLACE FUNCTION get_player_statistics(player_id uuid)
RETURNS TABLE (
  total_teams bigint,
  total_evaluations bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT tm.team_id), 0)::bigint as total_teams,
    COALESCE(COUNT(DISTINCT e.id), 0)::bigint as total_evaluations,
    COALESCE(AVG(e.overall_rating), 0)::numeric as avg_rating
  FROM players p
  LEFT JOIN team_memberships tm ON p.id = tm.player_id
  LEFT JOIN evaluations e ON p.id = e.player_id
  WHERE p.id = player_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create basic search function
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
    p.position as player_position,
    COALESCE(
      (SELECT avg_rating FROM get_player_statistics(p.id)),
      0
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_player_statistics(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;