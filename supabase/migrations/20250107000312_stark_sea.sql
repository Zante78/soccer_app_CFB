-- Create players table if not exists
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

-- Enable RLS on players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for players
CREATE POLICY "Allow authenticated access to players"
  ON players
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_players_updated_at'
  ) THEN
    CREATE TRIGGER update_players_updated_at
      BEFORE UPDATE ON players
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert some sample players if none exist
INSERT INTO players (first_name, last_name, position)
SELECT 'Max', 'Mustermann', 'Torwart'
WHERE NOT EXISTS (SELECT 1 FROM players);

INSERT INTO players (first_name, last_name, position)
SELECT 'John', 'Doe', 'Verteidiger'
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'John');

INSERT INTO players (first_name, last_name, position)
SELECT 'Jane', 'Smith', 'Mittelfeld'
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Jane');