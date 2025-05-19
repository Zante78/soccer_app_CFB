-- Create player_history table if not exists
CREATE TABLE IF NOT EXISTS player_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('evaluation', 'statistics', 'medical')),
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE player_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read history" ON player_history;
DROP POLICY IF EXISTS "Users can create history" ON player_history;

-- Create policies
CREATE POLICY "Users can read history"
  ON player_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create history"
  ON player_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS history_player_id_idx;
DROP INDEX IF EXISTS history_date_idx;
DROP INDEX IF EXISTS history_type_idx;

-- Create indexes
CREATE INDEX IF NOT EXISTS history_player_id_idx ON player_history(player_id);
CREATE INDEX IF NOT EXISTS history_date_idx ON player_history(date DESC);
CREATE INDEX IF NOT EXISTS history_type_idx ON player_history(type);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_player_history_updated_at ON player_history;

-- Create trigger for updated_at
CREATE TRIGGER update_player_history_updated_at
  BEFORE UPDATE ON player_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();