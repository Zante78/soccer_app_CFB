-- Create teams table with extended fields
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

-- Create players table with extended fields
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  position text,
  jersey_number integer,
  date_of_birth date,
  height integer, -- in cm
  weight integer, -- in kg
  photo_url text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create team_memberships table for player-team relationships
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
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all authenticated users"
  ON teams FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all authenticated users"
  ON players FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all authenticated users"
  ON team_memberships FOR SELECT TO authenticated
  USING (true);

-- Insert sample data
INSERT INTO teams (name, category, season) VALUES
  ('U19 Team', 'U19', '2023/24'),
  ('Erste Mannschaft', 'Senioren', '2023/24'),
  ('U17 Team', 'U17', '2023/24')
ON CONFLICT DO NOTHING;

-- Insert sample players
INSERT INTO players (first_name, last_name, position) VALUES
  ('Max', 'Mustermann', 'Torwart'),
  ('John', 'Doe', 'Verteidiger'),
  ('Jane', 'Smith', 'Mittelfeld')
ON CONFLICT DO NOTHING;