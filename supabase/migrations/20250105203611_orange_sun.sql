/*
  # Player Evaluation System Setup

  1. Tables
    - teams: Basic team information
    - players: Player profiles with team relationships
    - evaluations: Player evaluation records
    - evaluation_skills: Individual skill ratings for evaluations
  
  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    
  3. Functions
    - Automatic overall rating calculation
    - Evaluation history retrieval
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_teams table for team membership
CREATE TABLE IF NOT EXISTS user_teams (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, team_id)
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create evaluation context enum
CREATE TYPE evaluation_context AS ENUM ('training', 'match', 'test');

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  evaluator_id uuid NOT NULL REFERENCES auth.users(id),
  date timestamptz NOT NULL DEFAULT now(),
  context evaluation_context NOT NULL,
  overall_rating numeric NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 20),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create evaluation_skills table
CREATE TABLE IF NOT EXISTS evaluation_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id),
  value numeric NOT NULL CHECK (value >= 0 AND value <= 20),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(evaluation_id, skill_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS players_team_id_idx ON players(team_id);
CREATE INDEX IF NOT EXISTS evaluations_player_id_idx ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS evaluations_date_idx ON evaluations(date DESC);
CREATE INDEX IF NOT EXISTS evaluation_skills_evaluation_id_idx ON evaluation_skills(evaluation_id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for teams
CREATE POLICY "Authenticated users can read teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_teams
CREATE POLICY "Users can read own team associations"
  ON user_teams
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for players
CREATE POLICY "Team members can read players"
  ON players
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM user_teams WHERE user_id = auth.uid()
    )
  );

-- Create policies for evaluations
CREATE POLICY "Authenticated users can read evaluations"
  ON evaluations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = player_id
      AND p.team_id IN (
        SELECT team_id FROM user_teams WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can create evaluations"
  ON evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'headCoach', 'assistantCoach')
    )
  );

CREATE POLICY "Coaches can update own evaluations"
  ON evaluations
  FOR UPDATE
  TO authenticated
  USING (evaluator_id = auth.uid())
  WITH CHECK (evaluator_id = auth.uid());

-- Create policies for evaluation_skills
CREATE POLICY "Authenticated users can read evaluation skills"
  ON evaluation_skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN players p ON e.player_id = p.id
      WHERE e.id = evaluation_id
      AND p.team_id IN (
        SELECT team_id FROM user_teams WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can manage evaluation skills"
  ON evaluation_skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = evaluation_id
      AND e.evaluator_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate overall rating
CREATE OR REPLACE FUNCTION calculate_overall_rating(evaluation_id uuid)
RETURNS numeric AS $$
DECLARE
  weighted_sum numeric := 0;
  total_weight numeric := 0;
  overall numeric;
BEGIN
  SELECT 
    SUM(es.value * s.weight * sc.weight),
    SUM(s.weight * sc.weight)
  INTO weighted_sum, total_weight
  FROM evaluation_skills es
  JOIN skills s ON es.skill_id = s.id
  JOIN skill_categories sc ON s.category_id = sc.id
  WHERE es.evaluation_id = evaluation_id;

  overall := CASE 
    WHEN total_weight > 0 THEN weighted_sum / total_weight
    ELSE 0
  END;

  UPDATE evaluations
  SET overall_rating = overall
  WHERE id = evaluation_id;

  RETURN overall;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update overall rating
CREATE OR REPLACE FUNCTION update_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_overall_rating(NEW.evaluation_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evaluation_rating
  AFTER INSERT OR UPDATE OR DELETE ON evaluation_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_overall_rating();

-- Create function to get evaluation history
CREATE OR REPLACE FUNCTION get_evaluation_history(
  player_id_param uuid,
  start_date timestamptz,
  end_date timestamptz
)
RETURNS TABLE (
  date timestamptz,
  skill_id uuid,
  skill_name text,
  category_name text,
  value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.date,
    s.id as skill_id,
    s.name as skill_name,
    sc.name as category_name,
    es.value
  FROM evaluations e
  JOIN evaluation_skills es ON e.id = es.evaluation_id
  JOIN skills s ON es.skill_id = s.id
  JOIN skill_categories sc ON s.category_id = sc.id
  WHERE e.player_id = player_id_param
  AND e.date BETWEEN start_date AND end_date
  ORDER BY e.date ASC;
END;
$$ LANGUAGE plpgsql;