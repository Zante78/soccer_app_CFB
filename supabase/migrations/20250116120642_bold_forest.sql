-- Drop existing objects first
DROP FUNCTION IF EXISTS search_players(text,text,numeric,numeric);
DROP VIEW IF EXISTS player_statistics;

-- Create simplified player statistics view
CREATE VIEW player_statistics AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p."position",
  COALESCE(t.team_count, 0) as total_teams,
  COALESCE(e.eval_count, 0) as total_evaluations,
  COALESCE(e.avg_rating, 0) as avg_rating,
  e.last_evaluation_date
FROM players p
LEFT JOIN (
  SELECT 
    player_id,
    COUNT(DISTINCT team_id) as team_count
  FROM team_memberships
  WHERE end_date IS NULL OR end_date >= CURRENT_DATE
  GROUP BY player_id
) t ON p.id = t.player_id
LEFT JOIN (
  SELECT 
    player_id,
    COUNT(*) as eval_count,
    AVG(overall_rating) as avg_rating,
    MAX(date) as last_evaluation_date
  FROM evaluations
  GROUP BY player_id
) e ON p.id = e.player_id;

-- Grant access to authenticated users
GRANT SELECT ON player_statistics TO authenticated;

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
    p."position" as player_position,
    COALESCE(ps.avg_rating, 0) as avg_rating
  FROM players p
  LEFT JOIN player_statistics ps ON p.id = ps.id
  WHERE 
    (
      position_filter IS NULL 
      OR p."position" = position_filter
    )
    AND (
      search_term IS NULL 
      OR p.first_name ILIKE '%' || search_term || '%'
      OR p.last_name ILIKE '%' || search_term || '%'
      OR p."position" ILIKE '%' || search_term || '%'
    )
  ORDER BY p.last_name, p.first_name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Create efficient indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players("position");
CREATE INDEX IF NOT EXISTS idx_evaluations_player_date ON evaluations(player_id, date);

-- Create index for active memberships using a stable condition
CREATE INDEX IF NOT EXISTS idx_team_memberships_active 
ON team_memberships(player_id, team_id) 
WHERE end_date IS NULL;

-- Create index for expired memberships
CREATE INDEX IF NOT EXISTS idx_team_memberships_expired
ON team_memberships(player_id, team_id, end_date) 
WHERE end_date IS NOT NULL;