-- Drop existing objects first
DROP VIEW IF EXISTS player_statistics CASCADE;
DROP FUNCTION IF EXISTS get_player_stats CASCADE;
DROP FUNCTION IF EXISTS search_players CASCADE;
DROP FUNCTION IF EXISTS get_player_base_stats CASCADE;
DROP FUNCTION IF EXISTS refresh_player_statistics CASCADE;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS refresh_stats_on_player_change ON players;
DROP TRIGGER IF EXISTS refresh_stats_on_evaluation_change ON evaluations;
DROP TRIGGER IF EXISTS refresh_stats_on_membership_change ON team_memberships;

-- Create base function for player statistics that doesn't depend on a view
CREATE OR REPLACE FUNCTION get_player_base_stats(p_id uuid)
RETURNS TABLE (
  total_teams bigint,
  total_evaluations bigint,
  avg_rating numeric,
  last_evaluation_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT tm.team_id) FILTER (WHERE tm.end_date IS NULL OR tm.end_date >= CURRENT_DATE), 0)::bigint as total_teams,
    COALESCE(COUNT(DISTINCT e.id), 0)::bigint as total_evaluations,
    COALESCE(AVG(e.overall_rating), 0)::numeric as avg_rating,
    MAX(e.date) as last_evaluation_date
  FROM players p
  LEFT JOIN team_memberships tm ON tm.player_id = p.id
  LEFT JOIN evaluations e ON e.player_id = p.id
  WHERE p.id = p_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized view for better performance
DROP MATERIALIZED VIEW IF EXISTS player_statistics;
CREATE MATERIALIZED VIEW player_statistics AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.position,
  stats.total_teams,
  stats.total_evaluations,
  stats.avg_rating,
  stats.last_evaluation_date
FROM players p
CROSS JOIN LATERAL get_player_base_stats(p.id) stats;

-- Create unique index for faster refreshes
DROP INDEX IF EXISTS player_statistics_id_idx;
CREATE UNIQUE INDEX player_statistics_id_idx ON player_statistics(id);

-- Create function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_player_statistics()
RETURNS trigger AS $$
BEGIN
  -- Use exception handling to avoid errors during concurrent refreshes
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY player_statistics;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't fail the transaction
      RAISE NOTICE 'Failed to refresh player_statistics: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh statistics
CREATE TRIGGER refresh_stats_on_player_change
  AFTER INSERT OR UPDATE OR DELETE ON players
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_player_statistics();

CREATE TRIGGER refresh_stats_on_evaluation_change
  AFTER INSERT OR UPDATE OR DELETE ON evaluations
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_player_statistics();

CREATE TRIGGER refresh_stats_on_membership_change
  AFTER INSERT OR UPDATE OR DELETE ON team_memberships
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_player_statistics();

-- Create search function that uses materialized view
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
    ps.id,
    ps.first_name,
    ps.last_name,
    ps.position as player_position,
    ps.avg_rating
  FROM player_statistics ps
  WHERE 
    (position_filter IS NULL OR ps.position = position_filter)
    AND (
      search_term IS NULL 
      OR ps.first_name ILIKE '%' || search_term || '%'
      OR ps.last_name ILIKE '%' || search_term || '%'
      OR ps.position ILIKE '%' || search_term || '%'
    )
  ORDER BY ps.last_name, ps.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON player_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_player_base_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Do initial refresh
REFRESH MATERIALIZED VIEW player_statistics;