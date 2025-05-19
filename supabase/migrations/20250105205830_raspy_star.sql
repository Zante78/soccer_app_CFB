-- Create teams table with extended fields
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  season text,
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
  height integer,
  weight integer,
  photo_url text,
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

-- Create club_settings table
CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mein Verein',
  logo_url text,
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(language, key)
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access to teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to team_memberships"
  ON team_memberships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to club_settings"
  ON club_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read access to translations"
  ON translations FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial players
INSERT INTO players (first_name, last_name, position) VALUES
  ('Lion', 'Kritikos', 'Innenverteidiger'),
  ('Emil', 'Hillesheim', 'Innenverteidiger'),
  ('Can', 'Cina', 'Sturm');

-- Insert initial club settings
INSERT INTO club_settings (name) VALUES ('Mein Verein')
ON CONFLICT DO NOTHING;

-- Insert initial translations
INSERT INTO translations (language, key, value) VALUES
  ('de', 'common.save', 'Speichern'),
  ('de', 'common.cancel', 'Abbrechen'),
  ('de', 'common.delete', 'Löschen'),
  ('de', 'common.edit', 'Bearbeiten'),
  ('en', 'common.save', 'Save'),
  ('en', 'common.cancel', 'Cancel'),
  ('en', 'common.delete', 'Delete'),
  ('en', 'common.edit', 'Edit')
ON CONFLICT DO NOTHING;