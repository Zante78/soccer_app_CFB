-- Drop existing policies
DROP POLICY IF EXISTS "teams_authenticated_access_policy" ON teams;
DROP POLICY IF EXISTS "metrics_read_policy" ON analysis_metrics;
DROP POLICY IF EXISTS "metrics_insert_policy" ON analysis_metrics;

-- Create more granular team policies
CREATE POLICY "teams_read_policy"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "teams_insert_policy"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "teams_update_policy"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "teams_delete_policy"
  ON teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach')
    )
  );

-- Create policies for players
CREATE POLICY "players_read_policy"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "players_insert_policy"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "players_update_policy"
  ON players FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "players_delete_policy"
  ON players FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach')
    )
  );

-- Create policies for evaluations
CREATE POLICY "evaluations_read_policy"
  ON evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "evaluations_insert_policy"
  ON evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

CREATE POLICY "evaluations_update_policy"
  ON evaluations FOR UPDATE
  TO authenticated
  USING (evaluator_id = auth.uid());

-- Create policies for team memberships
CREATE POLICY "memberships_read_policy"
  ON team_memberships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "memberships_write_policy"
  ON team_memberships FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'manager')
    )
  );

-- Create policies for analysis metrics
CREATE POLICY "metrics_read_policy"
  ON analysis_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "metrics_write_policy"
  ON analysis_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'coach', 'analyst')
    )
  );

-- Create policies for club settings
CREATE POLICY "settings_read_policy"
  ON club_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "settings_write_policy"
  ON club_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );