/*
  # Database Schema Update

  1. Core Tables
    - user_roles: User role management
    - teams: Team information
    - players: Player profiles
    - notifications: System notifications
  
  2. Evaluation System
    - skill_categories: Skill category definitions
    - skills: Individual skills
    - evaluations: Player evaluations
    - evaluation_skills: Detailed skill ratings
  
  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - User-specific data access controls
*/

-- Create evaluation context enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE evaluation_context AS ENUM ('training', 'match', 'test');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'headCoach', 'assistantCoach', 'medicalStaff', 'analyst', 'scout')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

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

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type notification_type NOT NULL,
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  priority notification_priority NOT NULL DEFAULT 'medium',
  group_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz,
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create skill_categories table
CREATE TABLE IF NOT EXISTS skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  weight numeric NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  customizable boolean NOT NULL DEFAULT true,
  applicable_positions text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS players_team_id_idx ON players(team_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS skills_category_id_idx ON skills(category_id);
CREATE INDEX IF NOT EXISTS skills_applicable_positions_idx ON skills USING gin(applicable_positions);
CREATE INDEX IF NOT EXISTS evaluations_player_id_idx ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS evaluations_date_idx ON evaluations(date DESC);
CREATE INDEX IF NOT EXISTS evaluation_skills_evaluation_id_idx ON evaluation_skills(evaluation_id);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_skills ENABLE ROW LEVEL SECURITY;

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
DROP TRIGGER IF EXISTS update_skill_categories_updated_at ON skill_categories;
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_categories_updated_at
  BEFORE UPDATE ON skill_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Authenticated users can read user roles" ON user_roles;
    DROP POLICY IF EXISTS "Admin can manage user roles" ON user_roles;
    DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can create notifications" ON notifications;
    DROP POLICY IF EXISTS "Authenticated users can read skill categories" ON skill_categories;
    DROP POLICY IF EXISTS "Coaches can manage skill categories" ON skill_categories;
    DROP POLICY IF EXISTS "Authenticated users can read skills" ON skills;
    DROP POLICY IF EXISTS "Coaches can manage skills" ON skills;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create RLS policies
CREATE POLICY "Authenticated users can read user roles"
  ON user_roles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can manage user roles"
  ON user_roles FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read skill categories"
  ON skill_categories FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage skill categories"
  ON skill_categories FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'headCoach')
  ));

CREATE POLICY "Authenticated users can read skills"
  ON skills FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage skills"
  ON skills FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'headCoach')
  ));

-- Insert default skill categories
INSERT INTO skill_categories (name, description, weight) VALUES
  ('Technische Fähigkeiten', 'Grundlegende und fortgeschrittene technische Fähigkeiten', 1.0),
  ('Taktische Fähigkeiten', 'Spielverständnis und taktisches Verhalten', 1.0),
  ('Körperliche Fähigkeiten', 'Athletische und physische Eigenschaften', 1.0),
  ('Mentale Fähigkeiten', 'Psychologische und mentale Aspekte', 1.0),
  ('Soziale Fähigkeiten', 'Teamverhalten und Kommunikation', 0.8)
ON CONFLICT DO NOTHING;