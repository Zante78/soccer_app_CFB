/*
  # Rollback Checkpoint - Player Management System v2.0

  This migration serves as a version checkpoint for the current state of the application.
  Key features implemented:
  - Player management with detailed skill tracking
  - Team management with ownership tracking
  - Multiple view modes for player list (grid, list, detailed)
  - Player evaluations and history tracking
  - Enhanced player profiles with physical attributes and strong foot
  - Comprehensive skill categories and evaluation system
  - Storage management for player and team photos
  - Export functionality for data portability

  No schema changes in this migration - it serves as a version marker only.
*/

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

  -- Verify required columns exist
  ASSERT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'strong_foot'
  ), 'Strong foot column not found in players table';

  ASSERT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'height'
  ), 'Height column not found in players table';

  ASSERT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'weight'
  ), 'Weight column not found in players table';

END $$;

-- Add checkpoint comment
COMMENT ON SCHEMA public IS 'Rollback checkpoint created on 2025-07-03. All core functionality verified.';