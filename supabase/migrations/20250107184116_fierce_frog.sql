-- Add contact fields to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;

-- Update players service to match schema
CREATE OR REPLACE FUNCTION handle_player_insert()
RETURNS trigger AS $$
BEGIN
  NEW.first_name := COALESCE(NEW.first_name, '');
  NEW.last_name := COALESCE(NEW.last_name, '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new player validation
DROP TRIGGER IF EXISTS validate_player_insert ON players;
CREATE TRIGGER validate_player_insert
  BEFORE INSERT ON players
  FOR EACH ROW
  EXECUTE FUNCTION handle_player_insert();