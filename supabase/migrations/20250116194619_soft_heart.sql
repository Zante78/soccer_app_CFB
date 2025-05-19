-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_player_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_player_statistics(uuid) CASCADE;

-- Create single player stats function with clear parameter name
CREATE OR REPLACE FUNCTION get_player_stats(p_id uuid)
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
  LEFT JOIN team_memberships tm ON tm.player_id = p.id
  LEFT JOIN evaluations e ON e.player_id = p.id
  WHERE p.id = p_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_player_stats(uuid) TO authenticated;

-- Create index for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_evaluations_player_rating 
ON evaluations(player_id, overall_rating);

-- Ensure club_settings table exists and has initial data
CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mein Verein',
  logo_url text,
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policy for development
DROP POLICY IF EXISTS "authenticated_access_policy" ON club_settings;
CREATE POLICY "authenticated_access_policy"
ON club_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure initial settings exist
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);