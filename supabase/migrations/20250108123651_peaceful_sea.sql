-- Drop the unique constraint and index that prevents multiple active memberships
DROP INDEX IF EXISTS unique_active_membership;

-- Add a new constraint that only prevents duplicate memberships within the same team
ALTER TABLE team_memberships
DROP CONSTRAINT IF EXISTS unique_team_player_membership;

-- Create a partial unique index instead of a constraint with WHERE clause
CREATE UNIQUE INDEX unique_team_player_membership 
ON team_memberships (team_id, player_id) 
WHERE end_date IS NULL;