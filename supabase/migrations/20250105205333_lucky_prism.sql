/*
  # Add team details and memberships

  1. Changes
    - Add additional team details (category, season, colors)
    - Create team_memberships table for player-team relationships
    - Add RLS policies for team management
*/

-- Add new columns to teams table
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS season text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS colors jsonb DEFAULT '{"primary": "#000000", "secondary": "#ffffff"}'::jsonb;

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
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for team management
CREATE POLICY "Team members can read team details"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM user_teams WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage teams"
  ON teams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'headCoach')
    )
  );

CREATE POLICY "Team members can read memberships"
  ON team_memberships
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM user_teams WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage memberships"
  ON team_memberships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_teams ut ON ur.user_id = ut.user_id
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'headCoach')
      AND ut.team_id = team_memberships.team_id
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_team_memberships_updated_at
  BEFORE UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();