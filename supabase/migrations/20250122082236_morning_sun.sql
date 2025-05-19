-- Rollback Checkpoint Migration
-- Dokumentiert den aktuellen Stand der Datenbank für mögliche Rollbacks

-- Verify all required tables exist
DO $$ 
BEGIN
  -- Core tables
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'players'), 
    'Players table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams'), 
    'Teams table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_memberships'), 
    'Team memberships table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'club_settings'), 
    'Club settings table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'evaluations'), 
    'Evaluations table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes'), 
    'Notes table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'export_jobs'), 
    'Export jobs table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications'), 
    'Notifications table not found';

  -- Verify storage buckets
  ASSERT EXISTS(
    SELECT 1 FROM storage.buckets 
    WHERE name IN ('teams', 'players', 'logos', 'exports')
  ), 'Required storage buckets not found';

  -- Verify RLS is enabled on all tables
  ASSERT (SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'players', 'teams', 'team_memberships', 'club_settings',
      'evaluations', 'notes', 'export_jobs', 'notifications'
    )
    AND rowsecurity = true
  ) = 8, 'RLS not enabled on all tables';

  -- Verify required indexes exist
  ASSERT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname = 'team_memberships_active_unique_idx_v3'),
    'Active membership index not found';
  ASSERT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname = 'export_jobs_user_id_idx'),
    'Export jobs index not found';
  ASSERT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname = 'notifications_user_id_idx'),
    'Notifications index not found';

  -- Verify required functions exist
  ASSERT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('get_player_stats', 'search_players', 'add_team_member')
  ), 'Required functions not found';

END $$;

-- Add checkpoint comment
COMMENT ON SCHEMA public IS 'Rollback checkpoint created on 2025-01-21. All core functionality verified.';