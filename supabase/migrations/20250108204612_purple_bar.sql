-- Drop existing policies
DROP POLICY IF EXISTS "teams_policy" ON teams;
DROP POLICY IF EXISTS "Allow authenticated access" ON teams;

-- Create new policy that allows authenticated users to manage teams
CREATE POLICY "authenticated_users_policy"
ON teams
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Add user_id column to teams if it doesn't exist
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS teams_user_id_idx ON teams(user_id);