-- Drop existing objects if they exist
DROP VIEW IF EXISTS player_statistics CASCADE;
DROP FUNCTION IF EXISTS search_players CASCADE;

-- Create simplified player statistics view
CREATE VIEW player_statistics AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.position,
  COALESCE(tm.team_count, 0) as total_teams,
  COALESCE(e.eval_count, 0) as total_evaluations,
  COALESCE(e.avg_rating, 0) as avg_rating,
  e.last_evaluation_date
FROM players p
LEFT JOIN (
  SELECT 
    player_id,
    COUNT(DISTINCT team_id) as team_count
  FROM team_memberships
  GROUP BY player_id
) tm ON p.id = tm.player_id
LEFT JOIN (
  SELECT 
    player_id,
    COUNT(*) as eval_count,
    AVG(overall_rating) as avg_rating,
    MAX(date) as last_evaluation_date
  FROM evaluations
  GROUP BY player_id
) e ON p.id = e.player_id;

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
    COALESCE(AVG(e.overall_rating), 0) as avg_rating
  FROM players p
  LEFT JOIN evaluations e ON p.id = e.player_id
  WHERE 
    (
      position_filter IS NULL 
      OR p.position = position_filter
    )
    AND (
      search_term IS NULL 
      OR p.first_name ILIKE '%' || search_term || '%'
      OR p.last_name ILIKE '%' || search_term || '%'
      OR p.position ILIKE '%' || search_term || '%'
    )
  GROUP BY p.id, p.first_name, p.last_name, p.position
  ORDER BY p.last_name, p.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);

-- Grant permissions
GRANT SELECT ON player_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;