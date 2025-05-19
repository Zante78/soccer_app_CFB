-- Drop existing constraints
DROP INDEX IF EXISTS unique_team_player_membership;

-- Create unique index for active memberships
CREATE UNIQUE INDEX unique_active_player_membership 
ON team_memberships (player_id) 
WHERE end_date IS NULL;