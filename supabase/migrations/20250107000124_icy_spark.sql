-- Drop existing team table and recreate with proper structure
DROP TABLE IF EXISTS teams CASCADE;

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  season text NOT NULL,
  photo_url text,
  colors jsonb DEFAULT '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create team_memberships table
CREATE TABLE IF NOT EXISTS team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'captain', 'viceCaptain')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  UNIQUE(team_id, player_id)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated access to teams"
  ON teams
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to team_memberships"
  ON team_memberships
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Only create team_memberships trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_team_memberships_updated_at'
  ) THEN
    CREATE TRIGGER update_team_memberships_updated_at
      BEFORE UPDATE ON team_memberships
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;