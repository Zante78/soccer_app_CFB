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
  COALESCE(
    (SELECT COUNT(DISTINCT team_id) 
     FROM team_memberships 
     WHERE player_id = p.id
     AND (end_date IS NULL OR end_date >= CURRENT_DATE)),
    0
  ) as active_teams,
  COALESCE(
    (SELECT COUNT(*) 
     FROM evaluations 
     WHERE player_id = p.id),
    0
  ) as total_evaluations,
  COALESCE(
    (SELECT AVG(overall_rating) 
     FROM evaluations 
     WHERE player_id = p.id),
    0
  ) as avg_rating,
  COALESCE(
    (SELECT MAX(date)
     FROM evaluations
     WHERE player_id = p.id),
    NULL
  ) as last_evaluation_date
FROM players p;

-- Create basic search function
CREATE OR REPLACE FUNCTION search_players(
  search_term text DEFAULT NULL,
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
    COALESCE(ps.avg_rating, 0) as avg_rating
  FROM players p
  LEFT JOIN player_statistics ps ON p.id = ps.id
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
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);

-- Grant permissions
GRANT SELECT ON player_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Add validation for team memberships
DROP INDEX IF EXISTS unique_active_membership;
CREATE UNIQUE INDEX unique_active_membership 
ON team_memberships (player_id) 
WHERE end_date IS NULL;

-- Create function to validate team membership
CREATE OR REPLACE FUNCTION validate_team_membership()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = NEW.player_id
    AND id != COALESCE(NEW.id, -1)
    AND end_date IS NULL
    AND NEW.end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team membership validation
DROP TRIGGER IF EXISTS validate_team_membership_trigger ON team_memberships;
CREATE TRIGGER validate_team_membership_trigger
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership();