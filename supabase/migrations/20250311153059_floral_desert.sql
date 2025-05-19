/*
  # Fix Team Policies

  1. Changes
    - Updates team and membership policies
    - Adds team ownership function
    - Fixes policy naming conflicts
    
  2. Security
    - Maintains proper RLS
    - Ensures consistent access control
    - Handles team ownership verification
*/

-- Drop all existing policies first
DO $$ 
BEGIN
  -- Drop team policies
  DROP POLICY IF EXISTS "teams_read_policy" ON teams;
  DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
  DROP POLICY IF EXISTS "teams_update_policy" ON teams;
  DROP POLICY IF EXISTS "teams_delete_policy" ON teams;
  DROP POLICY IF EXISTS "Teams Read Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Insert Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Update Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Delete Policy" ON teams;
  
  -- Drop team membership policies
  DROP POLICY IF EXISTS "team_memberships_read_policy" ON team_memberships;
  DROP POLICY IF EXISTS "team_memberships_insert_policy" ON team_memberships;
  DROP POLICY IF EXISTS "team_memberships_update_policy" ON team_memberships;
  DROP POLICY IF EXISTS "team_memberships_delete_policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Read Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Insert Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Update Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Delete Policy" ON team_memberships;
END $$;

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Create helper function for team ownership check
CREATE OR REPLACE FUNCTION public.owns_team(team_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND user_id = auth.uid()
  );
$$;

-- Create new team policies with unique names
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
  owns_team(id) OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  owns_team(id) OR
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
  owns_team(id) OR
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Enable RLS on team_memberships table
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Create new team membership policies with unique names
CREATE POLICY "membership_select_policy"
ON team_memberships FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "membership_insert_policy"
ON team_memberships FOR INSERT
TO authenticated
WITH CHECK (
  owns_team(team_id)
);

CREATE POLICY "membership_update_policy"
ON team_memberships FOR UPDATE
TO authenticated
USING (
  owns_team(team_id)
)
WITH CHECK (
  owns_team(team_id)
);

CREATE POLICY "membership_delete_policy"
ON team_memberships FOR DELETE
TO authenticated
USING (
  owns_team(team_id)
);