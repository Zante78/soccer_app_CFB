-- Drop all existing team policies to start fresh
DO $$ 
BEGIN
    -- Drop all policies on the teams table
    DROP POLICY IF EXISTS "teams_policy" ON teams;
    DROP POLICY IF EXISTS "authenticated_users_policy" ON teams;
    DROP POLICY IF EXISTS "Allow authenticated access" ON teams;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create new policy with a unique name
CREATE POLICY "teams_authenticated_access_policy"
ON teams
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;