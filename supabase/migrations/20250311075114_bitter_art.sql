/*
  # Database Checkpoint System

  1. Overview
    Creates a complete database checkpoint system for safe rollbacks
    
  2. Changes
    - Creates checkpoint schema
    - Creates settings backup table
    - Adds functions for copying tables and functions
    - Creates rollback function
    - Handles generated columns correctly
    
  3. Security
    - Rollback function is security definer
    - Execute permission granted to postgres role
*/

-- Create checkpoint schema
CREATE SCHEMA IF NOT EXISTS checkpoint_20250310;

-- Create settings table
CREATE TABLE IF NOT EXISTS checkpoint_20250310.database_settings (
  setting_name text PRIMARY KEY,
  setting_value text
);

-- Store current settings
INSERT INTO checkpoint_20250310.database_settings
SELECT name, current_setting(name)
FROM pg_settings
WHERE name IN (
  'search_path',
  'timezone',
  'statement_timeout'
);

-- Function to copy table structure and data
CREATE OR REPLACE FUNCTION checkpoint_20250310.copy_table(source_schema text, target_schema text, table_name text)
RETURNS void AS $$
DECLARE
  column_list text;
BEGIN
  -- Create table structure including all except data
  EXECUTE format(
    'CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL)',
    target_schema, table_name,
    source_schema, table_name
  );
  
  -- Get list of columns excluding generated ones
  SELECT string_agg(quote_ident(attname), ', ')
  INTO column_list
  FROM pg_attribute a
  JOIN pg_class c ON a.attrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = source_schema
  AND c.relname = table_name
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND a.attgenerated = '';
  
  -- Copy data using only non-generated columns
  IF column_list IS NOT NULL THEN
    EXECUTE format(
      'INSERT INTO %I.%I (%s) SELECT %s FROM %I.%I',
      target_schema, table_name,
      column_list, column_list,
      source_schema, table_name
    );
  END IF;
END
$$ LANGUAGE plpgsql;

-- Function to copy function definitions
CREATE OR REPLACE FUNCTION checkpoint_20250310.copy_function(source_schema text, target_schema text, function_name text)
RETURNS void AS $$
DECLARE
  func_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid)
  INTO func_def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = source_schema AND p.proname = function_name;

  IF func_def IS NOT NULL THEN
    EXECUTE replace(func_def, source_schema || '.', target_schema || '.');
  END IF;
END
$$ LANGUAGE plpgsql;

-- Copy all public tables to checkpoint schema
DO $$ 
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    PERFORM checkpoint_20250310.copy_table('public', 'checkpoint_20250310', tbl);
  END LOOP;
END
$$;

-- Copy all public functions to checkpoint schema
DO $$ 
DECLARE
  func text;
BEGIN
  FOR func IN 
    SELECT proname 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    PERFORM checkpoint_20250310.copy_function('public', 'checkpoint_20250310', func);
  END LOOP;
END
$$;

-- Create rollback function
CREATE OR REPLACE FUNCTION public.rollback_to_checkpoint_20250310()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tbl text;
  func text;
  setting_record record;
BEGIN
  -- Drop public schema objects
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  
  -- Restore tables
  FOR tbl IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'checkpoint_20250310'
    AND tablename != 'database_settings'
  LOOP
    PERFORM checkpoint_20250310.copy_table('checkpoint_20250310', 'public', tbl);
  END LOOP;
  
  -- Restore functions
  FOR func IN 
    SELECT proname 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'checkpoint_20250310'
    AND proname NOT LIKE 'copy_%'
  LOOP
    PERFORM checkpoint_20250310.copy_function('checkpoint_20250310', 'public', func);
  END LOOP;
  
  -- Restore settings
  FOR setting_record IN 
    SELECT * FROM checkpoint_20250310.database_settings
  LOOP
    EXECUTE format(
      'SET %I = %L',
      setting_record.setting_name,
      setting_record.setting_value
    );
  END LOOP;
END
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.rollback_to_checkpoint_20250310() TO postgres;