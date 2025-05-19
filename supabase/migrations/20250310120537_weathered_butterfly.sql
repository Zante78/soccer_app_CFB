/*
  # Row Level Security Implementation

  1. Security Updates
    - Enable RLS on all tables
    - Add helper function for team access
    - Create granular policies for each operation type
    
  2. Changes
    - Split combined policies into separate ones for each operation
    - Maintain same security rules and access controls
    - Keep all helper functions and RLS enablement
    
  3. Notes
    - Each table has separate policies for SELECT, INSERT, UPDATE, and DELETE
    - Policies follow principle of least privilege
    - Team access is properly controlled
*/

-- Enable RLS on all tables that need it
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has team access
CREATE OR REPLACE FUNCTION has_team_access(team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      role IN ('admin', 'coach', 'manager')
      OR EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_id = $1
        AND user_id = auth.uid()
        AND end_date IS NULL
      )
    )
  );
END;
$$;

-- Teams table policies
DROP POLICY IF EXISTS "Teams read policy" ON teams;
CREATE POLICY "Teams read policy" ON teams
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Teams insert policy" ON teams;
CREATE POLICY "Teams insert policy" ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Teams update policy" ON teams;
CREATE POLICY "Teams update policy" ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Teams delete policy" ON teams;
CREATE POLICY "Teams delete policy" ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Players table policies
DROP POLICY IF EXISTS "Players read policy" ON players;
CREATE POLICY "Players read policy" ON players
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Players insert policy" ON players;
CREATE POLICY "Players insert policy" ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Players update policy" ON players;
CREATE POLICY "Players update policy" ON players
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Players delete policy" ON players;
CREATE POLICY "Players delete policy" ON players
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Team memberships policies
DROP POLICY IF EXISTS "Team memberships read policy" ON team_memberships;
CREATE POLICY "Team memberships read policy" ON team_memberships
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Team memberships insert policy" ON team_memberships;
CREATE POLICY "Team memberships insert policy" ON team_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Team memberships update policy" ON team_memberships;
CREATE POLICY "Team memberships update policy" ON team_memberships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Team memberships delete policy" ON team_memberships;
CREATE POLICY "Team memberships delete policy" ON team_memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Notes policies
DROP POLICY IF EXISTS "Notes read policy" ON notes;
CREATE POLICY "Notes read policy" ON notes
  FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_memberships tm
      WHERE tm.player_id = notes.player_id
      AND has_team_access(tm.team_id)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Notes insert policy" ON notes;
CREATE POLICY "Notes insert policy" ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Notes update policy" ON notes;
CREATE POLICY "Notes update policy" ON notes
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Notes delete policy" ON notes;
CREATE POLICY "Notes delete policy" ON notes
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

-- Evaluations policies
DROP POLICY IF EXISTS "Evaluations read policy" ON evaluations;
CREATE POLICY "Evaluations read policy" ON evaluations
  FOR SELECT
  TO authenticated
  USING (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_memberships tm
      WHERE tm.player_id = evaluations.player_id
      AND has_team_access(tm.team_id)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'manager')
    )
  );

DROP POLICY IF EXISTS "Evaluations insert policy" ON evaluations;
CREATE POLICY "Evaluations insert policy" ON evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Evaluations update policy" ON evaluations;
CREATE POLICY "Evaluations update policy" ON evaluations
  FOR UPDATE
  TO authenticated
  USING (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

DROP POLICY IF EXISTS "Evaluations delete policy" ON evaluations;
CREATE POLICY "Evaluations delete policy" ON evaluations
  FOR DELETE
  TO authenticated
  USING (
    evaluator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- Analysis metrics policies
DROP POLICY IF EXISTS "Analysis metrics read policy" ON analysis_metrics;
CREATE POLICY "Analysis metrics read policy" ON analysis_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships tm
      WHERE tm.player_id = analysis_metrics.player_id
      AND has_team_access(tm.team_id)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis metrics insert policy" ON analysis_metrics;
CREATE POLICY "Analysis metrics insert policy" ON analysis_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis metrics update policy" ON analysis_metrics;
CREATE POLICY "Analysis metrics update policy" ON analysis_metrics
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis metrics delete policy" ON analysis_metrics;
CREATE POLICY "Analysis metrics delete policy" ON analysis_metrics
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

-- Analysis goals policies
DROP POLICY IF EXISTS "Analysis goals read policy" ON analysis_goals;
CREATE POLICY "Analysis goals read policy" ON analysis_goals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships tm
      WHERE tm.player_id = analysis_goals.player_id
      AND has_team_access(tm.team_id)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis goals insert policy" ON analysis_goals;
CREATE POLICY "Analysis goals insert policy" ON analysis_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis goals update policy" ON analysis_goals;
CREATE POLICY "Analysis goals update policy" ON analysis_goals
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis goals delete policy" ON analysis_goals;
CREATE POLICY "Analysis goals delete policy" ON analysis_goals
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

-- Analysis reports policies
DROP POLICY IF EXISTS "Analysis reports read policy" ON analysis_reports;
CREATE POLICY "Analysis reports read policy" ON analysis_reports
  FOR SELECT
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_memberships tm
      WHERE tm.player_id = analysis_reports.player_id
      AND has_team_access(tm.team_id)
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis reports insert policy" ON analysis_reports;
CREATE POLICY "Analysis reports insert policy" ON analysis_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis reports update policy" ON analysis_reports;
CREATE POLICY "Analysis reports update policy" ON analysis_reports
  FOR UPDATE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

DROP POLICY IF EXISTS "Analysis reports delete policy" ON analysis_reports;
CREATE POLICY "Analysis reports delete policy" ON analysis_reports
  FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach', 'analyst')
    )
  );

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION has_team_access TO authenticated;