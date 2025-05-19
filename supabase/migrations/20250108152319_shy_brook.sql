-- Create analysis_metrics table
CREATE TABLE IF NOT EXISTS analysis_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  metric_type text NOT NULL CHECK (metric_type IN ('performance', 'progress', 'comparison')),
  name text NOT NULL,
  value numeric NOT NULL,
  context jsonb,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create analysis_reports table
CREATE TABLE IF NOT EXISTS analysis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  content text NOT NULL,
  metrics jsonb DEFAULT '[]'::jsonb, -- Changed to jsonb array instead of foreign key array
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create analysis_goals table
CREATE TABLE IF NOT EXISTS analysis_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  metric_id uuid REFERENCES analysis_metrics(id),
  title text NOT NULL,
  description text,
  target_value numeric,
  current_value numeric,
  start_date date NOT NULL,
  target_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (target_date >= start_date)
);

-- Enable RLS
ALTER TABLE analysis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "metrics_read_policy"
  ON analysis_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "metrics_insert_policy"
  ON analysis_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "reports_read_policy"
  ON analysis_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "reports_insert_policy"
  ON analysis_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "goals_read_policy"
  ON analysis_goals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "goals_insert_policy"
  ON analysis_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX analysis_metrics_player_id_idx ON analysis_metrics(player_id);
CREATE INDEX analysis_metrics_date_idx ON analysis_metrics(date DESC);
CREATE INDEX analysis_metrics_type_idx ON analysis_metrics(metric_type);

CREATE INDEX analysis_reports_player_id_idx ON analysis_reports(player_id);
CREATE INDEX analysis_reports_author_id_idx ON analysis_reports(author_id);
CREATE INDEX analysis_reports_date_idx ON analysis_reports(report_date DESC);
CREATE INDEX analysis_reports_status_idx ON analysis_reports(status);

CREATE INDEX analysis_goals_player_id_idx ON analysis_goals(player_id);
CREATE INDEX analysis_goals_metric_id_idx ON analysis_goals(metric_id);
CREATE INDEX analysis_goals_status_idx ON analysis_goals(status);

-- Create triggers for updated_at
CREATE TRIGGER update_analysis_metrics_updated_at
  BEFORE UPDATE ON analysis_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_reports_updated_at
  BEFORE UPDATE ON analysis_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_goals_updated_at
  BEFORE UPDATE ON analysis_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate performance trends
CREATE OR REPLACE FUNCTION calculate_performance_trend(
  player_id uuid,
  metric_name text,
  days integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  value numeric,
  trend numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_metrics AS (
    SELECT 
      date::date,
      AVG(value) as avg_value
    FROM analysis_metrics
    WHERE 
      player_id = $1 AND
      name = $2 AND
      date >= NOW() - ($3 || ' days')::interval
    GROUP BY date::date
    ORDER BY date::date
  ),
  metrics_with_lag AS (
    SELECT
      date,
      avg_value as value,
      LAG(avg_value, 1) OVER (ORDER BY date) as prev_value
    FROM daily_metrics
  )
  SELECT
    date,
    value,
    CASE 
      WHEN prev_value IS NULL THEN 0
      ELSE ((value - prev_value) / prev_value) * 100
    END as trend
  FROM metrics_with_lag;
END;
$$ LANGUAGE plpgsql;

-- Create function to aggregate player statistics
CREATE OR REPLACE FUNCTION get_player_statistics(
  player_id uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  metric_name text,
  avg_value numeric,
  min_value numeric,
  max_value numeric,
  trend numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_metrics AS (
    SELECT 
      name,
      value,
      date
    FROM analysis_metrics
    WHERE 
      analysis_metrics.player_id = $1 AND
      ($2 IS NULL OR date::date >= $2) AND
      ($3 IS NULL OR date::date <= $3)
  ),
  metric_stats AS (
    SELECT
      name,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value
    FROM filtered_metrics
    GROUP BY name
  ),
  metric_trends AS (
    SELECT
      name,
      ((LAST_VALUE(value) OVER w - FIRST_VALUE(value) OVER w) / 
       NULLIF(FIRST_VALUE(value) OVER w, 0)) * 100 as trend
    FROM filtered_metrics
    WINDOW w AS (PARTITION BY name ORDER BY date)
  )
  SELECT
    s.name,
    s.avg_value,
    s.min_value,
    s.max_value,
    t.trend
  FROM metric_stats s
  LEFT JOIN metric_trends t ON s.name = t.name;
END;
$$ LANGUAGE plpgsql;