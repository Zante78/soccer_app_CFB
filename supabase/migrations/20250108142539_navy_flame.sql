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

-- Enable RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_skills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read evaluations"
  ON evaluations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create evaluations"
  ON evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read evaluation skills"
  ON evaluation_skills
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create evaluation skills"
  ON evaluation_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_skills_updated_at
  BEFORE UPDATE ON evaluation_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();