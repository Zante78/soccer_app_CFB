-- First drop all existing indexes safely
DO $$ 
DECLARE
    _index record;
BEGIN
    -- Find and drop all team_memberships related indexes
    FOR _index IN (
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'team_memberships' 
        AND indexname LIKE 'idx_%'
        OR indexname LIKE 'unique_%'
    ) LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(_index.indexname) || ' CASCADE';
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error dropping indexes: %', SQLERRM;
END $$;

-- Create new indexes with unique names and proper checks
DO $$ 
BEGIN
    -- Create index for end date with version number
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'team_memberships_end_date_idx_v3'
    ) THEN
        CREATE INDEX team_memberships_end_date_idx_v3 
        ON team_memberships(player_id, end_date);
    END IF;

    -- Create index for team lookups with version number
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'team_memberships_team_idx_v3'
    ) THEN
        CREATE INDEX team_memberships_team_idx_v3
        ON team_memberships(team_id);
    END IF;

    -- Create composite index with version number
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'team_memberships_composite_idx_v3'
    ) THEN
        CREATE INDEX team_memberships_composite_idx_v3
        ON team_memberships(player_id, team_id, role);
    END IF;

    -- Create unique index for active memberships with version number
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'team_memberships_active_unique_idx_v3'
    ) THEN
        CREATE UNIQUE INDEX team_memberships_active_unique_idx_v3
        ON team_memberships(player_id) 
        WHERE end_date IS NULL;
    END IF;

EXCEPTION
    WHEN duplicate_table THEN 
        RAISE NOTICE 'Index already exists, skipping creation';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating index: %', SQLERRM;
END $$;

-- Add documentation
COMMENT ON INDEX team_memberships_end_date_idx_v3 IS 'Index for querying memberships by end date (v3)';
COMMENT ON INDEX team_memberships_team_idx_v3 IS 'Index for team lookups (v3)';
COMMENT ON INDEX team_memberships_composite_idx_v3 IS 'Composite index for common membership queries (v3)';
COMMENT ON INDEX team_memberships_active_unique_idx_v3 IS 'Ensures single active membership per player (v3)';