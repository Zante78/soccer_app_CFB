-- Drop existing objects if they exist
DROP VIEW IF EXISTS player_statistics CASCADE;
DROP FUNCTION IF EXISTS search_players CASCADE;
DROP FUNCTION IF EXISTS get_player_stats CASCADE;

-- Create function to get player statistics
CREATE OR REPLACE FUNCTION get_player_stats(player_id uuid)
RETURNS TABLE (
  total_teams bigint,
  total_evaluations bigint,
  avg_rating numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(DISTINCT tm.team_id), 0)::bigint,
    COALESCE(COUNT(DISTINCT e.id), 0)::bigint,
    COALESCE(AVG(e.overall_rating), 0)::numeric
  FROM players p
  LEFT JOIN team_memberships tm ON p.id = tm.player_id
  LEFT JOIN evaluations e ON p.id = e.player_id
  WHERE p.id = player_id
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
      (SELECT AVG(overall_rating) 
       FROM evaluations 
       WHERE player_id = p.id),
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
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player ON team_memberships(player_id);

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_player_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_players(text,text) TO authenticated;

-- Ensure club settings exist
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('teams', 'teams', true),
  ('players', 'players', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "storage_objects_upload_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_select_policy" ON storage.objects;
  DROP POLICY IF EXISTS "storage_objects_delete_policy" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "storage_objects_upload_policy"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('teams', 'players', 'logos'));

  CREATE POLICY "storage_objects_select_policy"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('teams', 'players', 'logos'));

  CREATE POLICY "storage_objects_delete_policy"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id IN ('teams', 'players', 'logos'));
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Ensure RLS is enabled on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for development
CREATE POLICY "authenticated_access_policy"
ON players FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_access_policy"
ON teams FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_access_policy"
ON team_memberships FOR ALL TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_access_policy"
ON club_settings FOR ALL TO authenticated
USING (true) WITH CHECK (true);