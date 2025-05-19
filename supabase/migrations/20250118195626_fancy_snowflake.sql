-- Drop indexes safely if they exist
DO $$ 
BEGIN
  -- Drop old indexes if they exist
  DROP INDEX IF EXISTS unique_active_membership;
  DROP INDEX IF EXISTS idx_team_memberships_active;
  DROP INDEX IF EXISTS idx_team_memberships_end_date;
  DROP INDEX IF EXISTS idx_team_memberships_team;
  DROP INDEX IF EXISTS idx_team_memberships_composite;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new indexes with proper naming and checks
DO $$ 
BEGIN
  -- Create index for end date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_team_memberships_end_date_v2'
  ) THEN
    CREATE INDEX idx_team_memberships_end_date_v2 
    ON team_memberships(player_id, end_date);
  END IF;

  -- Create index for team lookups if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_team_memberships_team_v2'
  ) THEN
    CREATE INDEX idx_team_memberships_team_v2
    ON team_memberships(team_id);
  END IF;

  -- Create composite index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_team_memberships_composite_v2'
  ) THEN
    CREATE INDEX idx_team_memberships_composite_v2
    ON team_memberships(player_id, team_id, role);
  END IF;

  -- Create unique index for active memberships if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'unique_active_membership_v2'
  ) THEN
    CREATE UNIQUE INDEX unique_active_membership_v2
    ON team_memberships(player_id) 
    WHERE end_date IS NULL;
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add comments for documentation
COMMENT ON INDEX idx_team_memberships_end_date_v2 IS 'Index for finding active/inactive memberships';
COMMENT ON INDEX idx_team_memberships_team_v2 IS 'Index for team member lookups';
COMMENT ON INDEX idx_team_memberships_composite_v2 IS 'Composite index for common membership queries';
COMMENT ON INDEX unique_active_membership_v2 IS 'Ensures players can only have one active team membership';