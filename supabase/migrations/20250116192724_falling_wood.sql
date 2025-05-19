-- Drop existing objects if they exist
DROP VIEW IF EXISTS player_statistics CASCADE;
DROP FUNCTION IF EXISTS search_players CASCADE;
DROP FUNCTION IF EXISTS get_player_stats CASCADE;

-- Ensure all required tables exist
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  position text,
  date_of_birth date,
  photo_url text,
  email text,
  phone text,
  skills jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  season text NOT NULL,
  photo_url text,
  colors jsonb DEFAULT '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'captain', 'viceCaptain')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mein Verein',
  logo_url text,
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies for development
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "authenticated_access_policy" ON players;
  DROP POLICY IF EXISTS "authenticated_access_policy" ON teams;
  DROP POLICY IF EXISTS "authenticated_access_policy" ON team_memberships;
  DROP POLICY IF EXISTS "authenticated_access_policy" ON club_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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