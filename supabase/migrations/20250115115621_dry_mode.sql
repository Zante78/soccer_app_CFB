-- First clean up any invalid data
UPDATE teams 
SET name = COALESCE(NULLIF(trim(name), ''), 'Unbenanntes Team')
WHERE length(trim(name)) < 2;

UPDATE teams 
SET category = COALESCE(NULLIF(trim(category), ''), 'Sonstige')
WHERE length(trim(category)) < 2;

-- Add validation for player skills
CREATE OR REPLACE FUNCTION validate_player_skills()
RETURNS trigger AS $$
DECLARE
  skill_record record;
BEGIN
  IF NEW.skills IS NOT NULL THEN
    -- Check if skills is a valid JSON array
    IF NOT (jsonb_typeof(NEW.skills) = 'array') THEN
      RAISE EXCEPTION 'Skills must be a JSON array';
    END IF;

    -- Validate each skill object
    FOR skill_record IN SELECT * FROM jsonb_array_elements(NEW.skills)
    LOOP
      IF NOT (
        jsonb_typeof(skill_record.value->'name') = 'string' AND
        jsonb_typeof(skill_record.value->'value') = 'number' AND
        jsonb_typeof(skill_record.value->'category') = 'string' AND
        (skill_record.value->>'value')::numeric BETWEEN 0 AND 20 AND
        skill_record.value->>'category' IN ('technical', 'physical', 'mental', 'social')
      ) THEN
        RAISE EXCEPTION 'Invalid skill format';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for skills validation
DROP TRIGGER IF EXISTS validate_player_skills_trigger ON players;
CREATE TRIGGER validate_player_skills_trigger
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION validate_player_skills();

-- Add validation for team data
CREATE OR REPLACE FUNCTION validate_team_data()
RETURNS trigger AS $$
BEGIN
  -- Set default values for empty strings
  NEW.name = COALESCE(NULLIF(trim(NEW.name), ''), 'Unbenanntes Team');
  NEW.category = COALESCE(NULLIF(trim(NEW.category), ''), 'Sonstige');
  
  -- Validate season format
  IF NEW.season IS NOT NULL AND NOT (NEW.season ~ '^\d{4}(/\d{2,4})?$') THEN
    RAISE EXCEPTION 'Invalid season format. Use YYYY or YYYY/YY';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team validation
DROP TRIGGER IF EXISTS validate_team_data_trigger ON teams;
CREATE TRIGGER validate_team_data_trigger
  BEFORE INSERT OR UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_data();

-- Add validation for team membership
CREATE OR REPLACE FUNCTION validate_team_membership()
RETURNS trigger AS $$
BEGIN
  -- Check for overlapping active memberships
  IF EXISTS (
    SELECT 1 FROM team_memberships
    WHERE player_id = NEW.player_id
    AND id != COALESCE(NEW.id, -1)
    AND end_date IS NULL
    AND NEW.end_date IS NULL
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;

  -- Validate dates
  IF NEW.end_date IS NOT NULL AND NEW.end_date < NEW.start_date THEN
    RAISE EXCEPTION 'End date cannot be before start date';
  END IF;

  -- Validate role
  IF NEW.role NOT IN ('player', 'captain', 'viceCaptain') THEN
    RAISE EXCEPTION 'Invalid team role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for membership validation
DROP TRIGGER IF EXISTS validate_team_membership_trigger ON team_memberships;
CREATE TRIGGER validate_team_membership_trigger
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_membership();

-- Add validation for evaluations
CREATE OR REPLACE FUNCTION validate_evaluation()
RETURNS trigger AS $$
BEGIN
  -- Validate rating range
  IF NEW.overall_rating < 0 OR NEW.overall_rating > 20 THEN
    RAISE EXCEPTION 'Overall rating must be between 0 and 20';
  END IF;

  -- Validate evaluation context
  IF NEW.context NOT IN ('training', 'match', 'test') THEN
    RAISE EXCEPTION 'Invalid evaluation context';
  END IF;

  -- Validate evaluation date
  IF NEW.date > CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Evaluation date cannot be in the future';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for evaluation validation
DROP TRIGGER IF EXISTS validate_evaluation_trigger ON evaluations;
CREATE TRIGGER validate_evaluation_trigger
  BEFORE INSERT OR UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION validate_evaluation();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_search 
ON players USING gin(to_tsvector('german', first_name || ' ' || last_name));

CREATE INDEX IF NOT EXISTS idx_team_search
ON teams USING gin(to_tsvector('german', name || ' ' || category));

CREATE INDEX IF NOT EXISTS idx_evaluation_date
ON evaluations(date DESC);

-- Add comments for documentation
COMMENT ON FUNCTION validate_player_skills() IS 'Validates player skills data structure and values';
COMMENT ON FUNCTION validate_team_data() IS 'Validates team data including name, category and season format';
COMMENT ON FUNCTION validate_team_membership() IS 'Validates team membership data and prevents overlapping active memberships';
COMMENT ON FUNCTION validate_evaluation() IS 'Validates evaluation data including rating range and context';