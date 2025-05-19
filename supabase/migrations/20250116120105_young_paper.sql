-- Drop existing objects first
DROP FUNCTION IF EXISTS search_players(text,text,numeric,numeric);
DROP VIEW IF EXISTS player_statistics;

-- Create simplified player statistics view
CREATE VIEW player_statistics AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p."position", -- Quote position as it's a reserved word
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
  player_position text, -- Renamed to avoid keyword conflict
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
    p."position" as player_position, -- Quote position and alias
    COALESCE(AVG(e.overall_rating), 0) as avg_rating
  FROM players p
  LEFT JOIN evaluations e ON p.id = e.player_id
  WHERE 
    to_tsvector('german', 
      coalesce(p.first_name, '') || ' ' || 
      coalesce(p.last_name, '') || ' ' || 
      coalesce(p."position", '') -- Quote position
    ) @@ plainto_tsquery('german', search_term)
    AND (position_filter IS NULL OR p."position" = position_filter) -- Quote position
  GROUP BY p.id, p.first_name, p.last_name, p."position"
  ORDER BY p.last_name, p.first_name;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Create efficient indexes
CREATE INDEX IF NOT EXISTS idx_player_search ON players USING gin(
  to_tsvector('german', 
    coalesce(first_name, '') || ' ' || 
    coalesce(last_name, '') || ' ' || 
    coalesce("position", '') -- Quote position
  )
);

CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);