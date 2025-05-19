/*
  # Database Rollback Checkpoint

  1. Current State
    - Teams table with RLS policies
    - Team memberships with RLS policies
    - Storage configuration for team photos
    - User permissions and roles

  2. Rollback Support
    - Creates backup tables for RLS policies
    - Provides rollback functionality
    - Maintains data integrity
*/

-- Create backup tables if they don't exist
CREATE TABLE IF NOT EXISTS _rls_backup (
  id serial PRIMARY KEY,
  table_name text NOT NULL,
  policy_name text NOT NULL,
  command text NOT NULL,
  roles text[],
  using_expr text,
  check_expr text,
  with_check_expr text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS _db_checkpoints (
  id serial PRIMARY KEY,
  checkpoint_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Function to save RLS state
CREATE OR REPLACE FUNCTION save_rls_state()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_record record;
BEGIN
  -- Clear previous backup
  DELETE FROM _rls_backup;

  -- Backup current RLS policies
  FOR policy_record IN 
    SELECT 
      nsp.nspname || '.' || pc.relname as table_name,
      pol.polname as policy_name,
      CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
      END as command,
      ARRAY(
        SELECT rolname::text 
        FROM pg_roles 
        WHERE oid = ANY(pol.polroles)
      ) as roles,
      pol.polqual::text as using_expr,
      pol.polwithcheck::text as check_expr
    FROM pg_policy pol
    JOIN pg_class pc ON pc.oid = pol.polrelid
    JOIN pg_namespace nsp ON nsp.oid = pc.relnamespace
    WHERE nsp.nspname IN ('public', 'storage')
  LOOP
    INSERT INTO _rls_backup (
      table_name, 
      policy_name, 
      command,
      roles,
      using_expr,
      check_expr
    )
    VALUES (
      policy_record.table_name,
      policy_record.policy_name,
      policy_record.command,
      policy_record.roles,
      policy_record.using_expr,
      policy_record.check_expr
    );
  END LOOP;
END;
$$;

-- Function to rollback to checkpoint
CREATE OR REPLACE FUNCTION rollback_to_checkpoint()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN SELECT * FROM _rls_backup
  LOOP
    -- Drop existing policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %s', 
      policy_record.policy_name, 
      policy_record.table_name
    );

    -- Recreate policy
    EXECUTE format(
      'CREATE POLICY %I ON %s FOR %s TO %s %s %s',
      policy_record.policy_name,
      policy_record.table_name,
      policy_record.command,
      array_to_string(policy_record.roles, ','),
      CASE 
        WHEN policy_record.using_expr IS NOT NULL 
        THEN 'USING (' || policy_record.using_expr || ')'
        ELSE ''
      END,
      CASE 
        WHEN policy_record.check_expr IS NOT NULL 
        THEN 'WITH CHECK (' || policy_record.check_expr || ')'
        ELSE ''
      END
    );
  END LOOP;
END;
$$;

-- Save current state
SELECT save_rls_state();

-- Create checkpoint marker
INSERT INTO _db_checkpoints (checkpoint_name, metadata)
VALUES (
  'team_management_checkpoint',
  jsonb_build_object(
    'timestamp', now(),
    'description', 'Team management system checkpoint',
    'tables', ARRAY['teams', 'team_memberships', 'storage.objects']
  )
);

-- Verify current permissions
DO $$ 
DECLARE
  table_record record;
BEGIN
  FOR table_record IN 
    SELECT n.nspname as schema_name, c.relname as table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('public', 'storage')
    AND c.relname IN ('teams', 'team_memberships', 'objects')
    AND c.relkind = 'r'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = table_record.schema_name
      AND c.relname = table_record.table_name
      AND c.relrowsecurity = true
    ) THEN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
        table_record.schema_name, 
        table_record.table_name
      );
    END IF;
  END LOOP;
END $$;