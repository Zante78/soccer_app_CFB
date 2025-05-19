/*
  # Fix Teams Display Issues

  1. Changes
    - Drop and recreate teams RLS policies
    - Add user_id column if missing
    - Ensure proper team ownership tracking
    
  2. Security
    - Enable RLS on teams table
    - Add policies for team management
    - Maintain data integrity
*/

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Add user_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE teams ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "team_select_policy" ON teams;
  DROP POLICY IF EXISTS "team_insert_policy" ON teams;
  DROP POLICY IF EXISTS "team_update_policy" ON teams;
  DROP POLICY IF EXISTS "team_delete_policy" ON teams;
  DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
  DROP POLICY IF EXISTS "Team owners can insert teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create new policies
CREATE POLICY "team_select_policy"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "team_insert_policy"
ON teams FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
);

CREATE POLICY "team_update_policy"
ON teams FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "team_delete_policy"
ON teams FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Update existing teams to set user_id if null
UPDATE teams 
SET user_id = (
  SELECT id FROM users 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);

-- Add comment
COMMENT ON TABLE teams IS 'Teams with user ownership tracking';