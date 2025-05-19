-- Drop existing objects first
DROP FUNCTION IF EXISTS search_players(text,text,numeric,numeric);
DROP MATERIALIZED VIEW IF EXISTS player_statistics;
DROP VIEW IF EXISTS player_statistics;

-- Create regular view for player statistics
CREATE VIEW player_statistics AS
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

-- Grant proper permissions
GRANT SELECT ON player_statistics TO authenticated;

-- Create efficient indexes for the view's underlying query
CREATE INDEX IF NOT EXISTS idx_team_memberships_player_id 
ON team_memberships(player_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_player_id_date 
ON evaluations(player_id, date);

-- Create search function with SECURITY DEFINER to avoid permission issues
CREATE FUNCTION search_players(
  search_term text,
  position_filter text DEFAULT NULL,
  min_rating numeric DEFAULT NULL,
  max_rating numeric DEFAULT NULL
) 
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  player_position text,
  avg_rating numeric,
  rank real
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.position as player_position,
    COALESCE(ps.avg_rating, 0) as avg_rating,
    ts_rank(
      to_tsvector('german', 
        coalesce(p.first_name, '') || ' ' || 
        coalesce(p.last_name, '') || ' ' || 
        coalesce(p.position, '')
      ),
      to_tsquery('german', search_term)
    ) as rank
  FROM players p
  LEFT JOIN player_statistics ps ON p.id = ps.id
  WHERE 
    to_tsvector('german', 
      coalesce(p.first_name, '') || ' ' || 
      coalesce(p.last_name, '') || ' ' || 
      coalesce(p.position, '')
    ) @@ to_tsquery('german', search_term)
    AND (position_filter IS NULL OR p.position = position_filter)
    AND (min_rating IS NULL OR ps.avg_rating >= min_rating)
    AND (max_rating IS NULL OR ps.avg_rating <= max_rating)
  ORDER BY rank DESC, p.last_name, p.first_name;
END;
$$;

-- Grant execute permission on the search function
GRANT EXECUTE ON FUNCTION search_players(text,text,numeric,numeric) TO authenticated;

-- Create index for text search
CREATE INDEX IF NOT EXISTS players_search_idx ON players USING gin(
  to_tsvector('german', 
    coalesce(first_name, '') || ' ' || 
    coalesce(last_name, '') || ' ' || 
    coalesce(position, '')
  )
);