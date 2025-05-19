-- Remove the unique constraint that prevents players from being in multiple teams
ALTER TABLE team_memberships
DROP CONSTRAINT IF EXISTS unique_player_membership;

-- Add constraint to only prevent duplicate active memberships
ALTER TABLE team_memberships
DROP CONSTRAINT IF EXISTS unique_active_membership;

CREATE UNIQUE INDEX unique_active_membership 
ON team_memberships (player_id) 
WHERE end_date IS NULL;