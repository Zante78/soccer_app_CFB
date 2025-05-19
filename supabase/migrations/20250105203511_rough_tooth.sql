/*
  # Skills and Categories System Setup

  1. Tables
    - user_roles: User role management
    - skill_categories: Categories for grouping skills
    - skills: Individual skills with category relationships
  
  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    
  3. Automation
    - Triggers for updated_at timestamps
    - Default skill categories
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'headCoach', 'assistantCoach', 'medicalStaff', 'analyst', 'scout')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS skills_category_id_idx ON skills(category_id);
CREATE INDEX IF NOT EXISTS skills_applicable_positions_idx ON skills USING gin(applicable_positions);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Authenticated users can read user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage user roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policies for skill_categories
CREATE POLICY "Authenticated users can read skill categories"
  ON skill_categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage skill categories"
  ON skill_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'headCoach')
    )
  );

-- Create policies for skills
CREATE POLICY "Authenticated users can read skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'headCoach')
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
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

-- Insert default skill categories
INSERT INTO skill_categories (name, description, weight) VALUES
  ('Technische Fähigkeiten', 'Grundlegende und fortgeschrittene technische Fähigkeiten', 1.0),
  ('Taktische Fähigkeiten', 'Spielverständnis und taktisches Verhalten', 1.0),
  ('Körperliche Fähigkeiten', 'Athletische und physische Eigenschaften', 1.0),
  ('Mentale Fähigkeiten', 'Psychologische und mentale Aspekte', 1.0),
  ('Soziale Fähigkeiten', 'Teamverhalten und Kommunikation', 0.8)
ON CONFLICT DO NOTHING;