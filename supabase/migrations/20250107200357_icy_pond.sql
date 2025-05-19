-- Add constraint to prevent players from being in multiple teams
ALTER TABLE team_memberships
ADD CONSTRAINT unique_player_membership 
UNIQUE (player_id);

-- Add trigger to enforce end_date when removing from team
CREATE OR REPLACE FUNCTION set_membership_end_date()
RETURNS trigger AS $$
BEGIN
  NEW.end_date = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_membership_end_date_trigger
  BEFORE UPDATE ON team_memberships
  FOR EACH ROW
  WHEN (NEW.end_date IS NULL AND OLD.end_date IS NULL)
  EXECUTE FUNCTION set_membership_end_date();