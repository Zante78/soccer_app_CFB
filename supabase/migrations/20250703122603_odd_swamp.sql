/*
  # Add Player Attributes

  1. New Fields
    - strong_foot (text): Player's dominant foot (left, right, both)
    - Add constraints for height and weight
  
  2. Changes
    - Add validation for new fields
    - Update existing constraints
*/

-- Add strong_foot column if it doesn't exist
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS strong_foot text;

-- Add constraint for strong_foot
ALTER TABLE players
ADD CONSTRAINT valid_strong_foot
  CHECK (strong_foot IS NULL OR strong_foot IN ('left', 'right', 'both'));

-- Add constraints for height and weight if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'players' AND column_name = 'height'
  ) THEN
    ALTER TABLE players 
    ADD CONSTRAINT valid_height
      CHECK (height IS NULL OR (height >= 100 AND height <= 250));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'players' AND column_name = 'weight'
  ) THEN
    ALTER TABLE players 
    ADD CONSTRAINT valid_weight
      CHECK (weight IS NULL OR (weight >= 30 AND weight <= 150));
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN players.strong_foot IS 'Player''s dominant foot (left, right, both)';
COMMENT ON COLUMN players.height IS 'Player height in centimeters';
COMMENT ON COLUMN players.weight IS 'Player weight in kilograms';

-- Create function to calculate age from date of birth
CREATE OR REPLACE FUNCTION calculate_player_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, birth_date))::integer;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION calculate_player_age(date) IS 'Calculates player age from date of birth';