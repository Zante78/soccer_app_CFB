-- Drop existing objects first
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS get_player_stats(uuid);
    DROP FUNCTION IF EXISTS search_players(text,text);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create simplified player stats function
CREATE OR REPLACE FUNCTION get_player_stats(player_id uuid)
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
  LEFT JOIN team_memberships tm ON p.id = player_id
  LEFT JOIN evaluations e ON p.id = player_id
  WHERE p.id = player_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create simplified search function
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
    COALESCE(AVG(e.overall_rating), 0)::numeric
  FROM players p
  LEFT JOIN evaluations e ON p.id = e.player_id
  WHERE 
    (position_filter IS NULL OR p.position = position_filter)
    AND (
      search_term IS NULL 
      OR p.first_name ILIKE '%' || search_term || '%'
      OR p.last_name ILIKE '%' || search_term || '%'
      OR p.position ILIKE '%' || search_term || '%'
    )
  GROUP BY p.id, p.first_name, p.last_name, p.position
  ORDER BY p.last_name, p.first_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_player_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;