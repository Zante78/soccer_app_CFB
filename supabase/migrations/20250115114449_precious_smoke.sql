-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS players_position_idx ON players(position);
CREATE INDEX IF NOT EXISTS players_jersey_number_idx ON players(jersey_number);
CREATE INDEX IF NOT EXISTS players_created_at_idx ON players(created_at DESC);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS players_name_position_idx 
ON players(last_name, first_name, position);

-- Add partial indexes for active players
CREATE INDEX IF NOT EXISTS active_players_idx 
ON team_memberships(player_id) 
WHERE end_date IS NULL;

-- Create materialized view for player statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS player_statistics AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.position,
  COUNT(DISTINCT tm.team_id) as total_teams,
  COUNT(DISTINCT e.id) as total_evaluations,
  COALESCE(AVG((e.overall_rating)::numeric), 0) as avg_rating,
  MAX(e.date) as last_evaluation_date
FROM players p
LEFT JOIN team_memberships tm ON p.id = tm.player_id
LEFT JOIN evaluations e ON p.id = e.player_id
GROUP BY p.id, p.first_name, p.last_name, p.position;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS player_statistics_id_idx 
ON player_statistics(id);

-- Create function to refresh player statistics
CREATE OR REPLACE FUNCTION refresh_player_statistics()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY player_statistics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh statistics
DROP TRIGGER IF EXISTS refresh_stats_on_player_change ON players;
CREATE TRIGGER refresh_stats_on_player_change
  AFTER INSERT OR UPDATE OR DELETE ON players
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_player_statistics();

DROP TRIGGER IF EXISTS refresh_stats_on_evaluation_change ON evaluations;
CREATE TRIGGER refresh_stats_on_evaluation_change
  AFTER INSERT OR UPDATE OR DELETE ON evaluations
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_player_statistics();

-- Create type for search results
CREATE TYPE player_search_result AS (
  id uuid,
  first_name text,
  last_name text,
  player_position text,
  avg_rating numeric,
  rank real
);

-- Create function for efficient player search
CREATE OR REPLACE FUNCTION search_players(
  search_term text,
  position_filter text DEFAULT NULL,
  min_rating numeric DEFAULT NULL,
  max_rating numeric DEFAULT NULL
) 
RETURNS SETOF player_search_result
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.position as player_position,
    ps.avg_rating,
    ts_rank(p.search_vector, to_tsquery('german', search_term)) as rank
  FROM players p
  JOIN player_statistics ps ON p.id = ps.id
  WHERE 
    p.search_vector @@ to_tsquery('german', search_term)
    AND (position_filter IS NULL OR p.position = position_filter)
    AND (min_rating IS NULL OR ps.avg_rating >= min_rating)
    AND (max_rating IS NULL OR ps.avg_rating <= max_rating)
  ORDER BY rank DESC, p.last_name, p.first_name;
END;
$$ LANGUAGE plpgsql;