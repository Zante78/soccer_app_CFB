/*
  # Schema Improvements Migration
  
  1. Data Validation
    - Email and phone validation
    - Physical attributes validation
    - Age validation
  
  2. Computed Columns
    - Full name
    - Search capabilities
  
  3. Skills Validation
    - JSON structure validation
    - Value ranges
    - Category validation
*/

-- First clean up invalid data
UPDATE players 
SET email = NULL 
WHERE email IS NOT NULL 
  AND email !~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}';

UPDATE players 
SET phone = NULL 
WHERE phone IS NOT NULL 
  AND phone !~ '[0-9+() -]{8,}';

-- Now add constraints
ALTER TABLE players 
ADD CONSTRAINT valid_email 
  CHECK (email IS NULL OR email ~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}');

ALTER TABLE players 
ADD CONSTRAINT valid_phone
  CHECK (phone IS NULL OR phone ~ '[0-9+() -]{8,}');

-- Add physical attribute validation
ALTER TABLE players 
ADD CONSTRAINT valid_height
  CHECK (height IS NULL OR (height >= 100 AND height <= 250)),
ADD CONSTRAINT valid_weight
  CHECK (weight IS NULL OR (weight >= 30 AND weight <= 150));

-- Add jersey number validation
ALTER TABLE players
ADD CONSTRAINT valid_jersey_number
  CHECK (jersey_number IS NULL OR (jersey_number >= 1 AND jersey_number <= 99));

-- Create function to validate player age
CREATE OR REPLACE FUNCTION validate_player_age()
RETURNS trigger AS $$
BEGIN
  IF NEW.date_of_birth IS NOT NULL AND 
     NEW.date_of_birth > CURRENT_DATE - INTERVAL '5 years' THEN
    RAISE EXCEPTION 'Player must be at least 5 years old';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for age validation
DROP TRIGGER IF EXISTS check_player_age ON players;
CREATE TRIGGER check_player_age
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION validate_player_age();

-- Add full name computed column
CREATE OR REPLACE FUNCTION get_full_name(first_name text, last_name text)
RETURNS text AS $$
BEGIN
  RETURN trim(first_name || ' ' || last_name);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE players 
DROP COLUMN IF EXISTS full_name CASCADE;

ALTER TABLE players 
ADD COLUMN full_name text 
GENERATED ALWAYS AS (get_full_name(first_name, last_name)) STORED;

-- Create function to validate skills JSON
CREATE OR REPLACE FUNCTION validate_skills()
RETURNS trigger AS $$
DECLARE
  skill jsonb;
BEGIN
  IF NEW.skills IS NOT NULL THEN
    -- Check if skills is a valid JSON array
    IF NOT (jsonb_typeof(NEW.skills) = 'array') THEN
      RAISE EXCEPTION 'Skills must be a JSON array';
    END IF;

    -- Validate each skill object
    FOR skill IN SELECT * FROM jsonb_array_elements(NEW.skills)
    LOOP
      IF NOT (
        jsonb_typeof(skill->'name') = 'string' AND
        jsonb_typeof(skill->'value') = 'number' AND
        jsonb_typeof(skill->'category') = 'string' AND
        (skill->>'value')::numeric BETWEEN 0 AND 20 AND
        skill->>'category' IN ('technical', 'physical', 'mental', 'social')
      ) THEN
        RAISE EXCEPTION 'Invalid skill format';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for skills validation
DROP TRIGGER IF EXISTS validate_player_skills ON players;
CREATE TRIGGER validate_player_skills
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION validate_skills();

-- Create indexes for computed columns and frequently queried fields
CREATE INDEX IF NOT EXISTS players_full_name_idx ON players(full_name);
CREATE INDEX IF NOT EXISTS players_email_idx ON players(email);
CREATE INDEX IF NOT EXISTS players_date_of_birth_idx ON players(date_of_birth);

-- Add text search capabilities
ALTER TABLE players 
DROP COLUMN IF EXISTS search_vector CASCADE;

ALTER TABLE players 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('german', coalesce(first_name, '')), 'A') ||
  setweight(to_tsvector('german', coalesce(last_name, '')), 'A') ||
  setweight(to_tsvector('german', coalesce(position, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS players_search_idx ON players USING gin(search_vector);

-- Add comments
COMMENT ON TABLE players IS 'Players with all relevant information';
COMMENT ON COLUMN players.full_name IS 'Full name (first and last name)';
COMMENT ON COLUMN players.search_vector IS 'Search vector for full text search';