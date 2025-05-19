-- Add constraints for player names
ALTER TABLE players
ADD CONSTRAINT valid_first_name
  CHECK (length(trim(first_name)) > 0),
ADD CONSTRAINT valid_last_name
  CHECK (length(trim(last_name)) > 0);

-- Add constraint for team names
ALTER TABLE teams
ADD CONSTRAINT valid_team_name
  CHECK (length(trim(name)) > 0);

-- Add constraint for team category and season
ALTER TABLE teams
ADD CONSTRAINT valid_team_category
  CHECK (length(trim(category)) > 0),
ADD CONSTRAINT valid_team_season
  CHECK (length(trim(season)) > 0);

-- Add constraint for team colors
ALTER TABLE teams
ADD CONSTRAINT valid_team_colors
  CHECK (
    jsonb_typeof(colors) = 'object' AND
    colors ? 'primary' AND
    colors ? 'secondary' AND
    jsonb_typeof(colors->'primary') = 'string' AND
    jsonb_typeof(colors->'secondary') = 'string'
  );

-- Add constraint for team memberships
ALTER TABLE team_memberships
ADD CONSTRAINT valid_membership_dates
  CHECK (
    start_date <= CURRENT_DATE AND
    (end_date IS NULL OR end_date >= start_date)
  );

-- Create function to validate team member count
CREATE OR REPLACE FUNCTION validate_team_member_count()
RETURNS trigger AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM team_memberships
    WHERE team_id = NEW.team_id
    AND end_date IS NULL
  ) >= 30 THEN
    RAISE EXCEPTION 'Team cannot have more than 30 active members';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team member count validation
DROP TRIGGER IF EXISTS check_team_member_count ON team_memberships;
CREATE TRIGGER check_team_member_count
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_member_count();

-- Create function to validate overlapping memberships
CREATE OR REPLACE FUNCTION validate_overlapping_memberships()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM team_memberships
    WHERE player_id = NEW.player_id
    AND end_date IS NULL
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Player already has an active team membership';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for overlapping memberships validation
DROP TRIGGER IF EXISTS check_overlapping_memberships ON team_memberships;
CREATE TRIGGER check_overlapping_memberships
  BEFORE INSERT OR UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_overlapping_memberships();

-- Add comments
COMMENT ON CONSTRAINT valid_first_name ON players IS 'Ensures first name is not empty';
COMMENT ON CONSTRAINT valid_last_name ON players IS 'Ensures last name is not empty';
COMMENT ON CONSTRAINT valid_team_name ON teams IS 'Ensures team name is not empty';
COMMENT ON CONSTRAINT valid_team_category ON teams IS 'Ensures team category is not empty';
COMMENT ON CONSTRAINT valid_team_season ON teams IS 'Ensures team season is not empty';
COMMENT ON CONSTRAINT valid_team_colors ON teams IS 'Ensures team colors are properly formatted';
COMMENT ON CONSTRAINT valid_membership_dates ON team_memberships IS 'Ensures valid membership dates';