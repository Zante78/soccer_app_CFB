-- Drop existing functions if they exist
DO $$ 
BEGIN
    DROP FUNCTION IF EXISTS get_player_stats(uuid);
    DROP FUNCTION IF EXISTS search_players(text,text);
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create base player stats function
CREATE OR REPLACE FUNCTION get_player_stats(p_id uuid)
RETURNS TABLE (
  total_teams bigint,
  total_evaluations bigint,
  avg_rating numeric,
  last_evaluation_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT tm.team_id) FILTER (WHERE tm.end_date IS NULL), 0)::bigint as total_teams,
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

-- Create search function
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
      (SELECT AVG(e.overall_rating) 
       FROM evaluations e 
       WHERE e.player_id = p.id),
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_evaluations_player_rating 
ON evaluations(player_id, overall_rating);

CREATE INDEX IF NOT EXISTS idx_team_memberships_end_date
ON team_memberships(player_id, end_date);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_player_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;