/*
  # Database Rollback Checkpoint

  1. Current State
    - Teams table with RLS policies
    - Storage configuration for team photos
    - User roles and permissions
    - Team membership management
    
  2. Rollback Support
    - Creates backup tables
    - Stores current RLS policies
    - Provides rollback functionality
*/

-- Create backup schema if not exists
CREATE SCHEMA IF NOT EXISTS checkpoint_20250313;

-- Create backup tables
CREATE TABLE IF NOT EXISTS checkpoint_20250313.database_settings (
  setting_name text PRIMARY KEY,
  setting_value text,
  created_at timestamptz DEFAULT now()
);

-- Store current settings
INSERT INTO checkpoint_20250313.database_settings
SELECT name, current_setting(name)
FROM pg_settings
WHERE name IN (
  'search_path',
  'timezone',
  'statement_timeout'
);

-- Create RLS policy backup table
CREATE TABLE IF NOT EXISTS checkpoint_20250313.rls_policies (
  id serial PRIMARY KEY,
  table_schema text NOT NULL,
  table_name text NOT NULL,
  policy_name text NOT NULL,
  policy_type text NOT NULL,
  roles text[],
  using_expr text,
  check_expr text,
  created_at timestamptz DEFAULT now()
);

-- Backup current RLS policies
INSERT INTO checkpoint_20250313.rls_policies (
  table_schema, table_name, policy_name, policy_type, roles, using_expr, check_expr
)
SELECT 
  n.nspname as table_schema,
  c.relname as table_name,
  p.polname as policy_name,
  CASE p.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END as policy_type,
  ARRAY(
    SELECT r.rolname::text
    FROM pg_roles r
    WHERE r.oid = ANY(p.polroles)
  ) as roles,
  pg_get_expr(p.polqual, p.polrelid) as using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) as check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'storage');

-- Create function to rollback to this checkpoint
CREATE OR REPLACE FUNCTION checkpoint_20250313.rollback()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
BEGIN
  -- Restore settings
  FOR r IN SELECT * FROM checkpoint_20250313.database_settings
  LOOP
    EXECUTE format('SET %I = %L', r.setting_name, r.setting_value);
  END LOOP;

  -- Restore RLS policies
  FOR r IN SELECT * FROM checkpoint_20250313.rls_policies
  LOOP
    -- Drop existing policy
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policy_name,
      r.table_schema,
      r.table_name
    );

    -- Recreate policy
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR %s TO %s %s %s',
      r.policy_name,
      r.table_schema,
      r.table_name,
      r.policy_type,
      array_to_string(r.roles, ','),
      CASE WHEN r.using_expr IS NOT NULL 
        THEN 'USING (' || r.using_expr || ')'
        ELSE ''
      END,
      CASE WHEN r.check_expr IS NOT NULL 
        THEN 'WITH CHECK (' || r.check_expr || ')'
        ELSE ''
      END
    );
  END LOOP;
END;
$$;

-- Verify current state
DO $$ 
BEGIN
  -- Verify tables exist
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'teams'), 
    'Teams table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'team_memberships'), 
    'Team memberships table not found';
  ASSERT EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'users'), 
    'Users table not found';

  -- Verify storage buckets exist
  ASSERT EXISTS(
    SELECT 1 FROM storage.buckets 
    WHERE name IN ('teams', 'players', 'logos')
  ), 'Required storage buckets not found';

  -- Verify RLS is enabled
  ASSERT (SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('teams', 'team_memberships', 'users')
    AND rowsecurity = true
  ) = 3, 'RLS not enabled on all required tables';

  -- Verify required functions exist
  ASSERT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('check_team_access', 'is_valid_image', 'cleanup_orphaned_files')
  ), 'Required functions not found';

END $$;

-- Add checkpoint marker
INSERT INTO checkpoint_20250313.database_settings (setting_name, setting_value)
VALUES ('checkpoint_version', '20250313');

-- Add comment
COMMENT ON SCHEMA checkpoint_20250313 IS 'Rollback checkpoint created on 2025-03-13';