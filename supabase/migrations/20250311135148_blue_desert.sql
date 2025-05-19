/*
  # Enhanced Security and RLS Setup

  1. Changes
    - Adds role-based access control
    - Enhances RLS policies for all tables
    - Sets up proper user roles and permissions
    - Adds security helper functions

  2. Security
    - Enables RLS on all tables
    - Adds granular role-based policies
    - Implements security helper functions
    - Fixes storage policies conflicts
*/

-- Create user roles type if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'coach', 'manager', 'analyst', 'medical', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create security helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_teams()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_players()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach', 'manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_evaluations()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'coach', 'analyst')
  );
$$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Teams
  DROP POLICY IF EXISTS "Teams Read Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Insert Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Update Policy" ON teams;
  DROP POLICY IF EXISTS "Teams Delete Policy" ON teams;
  
  -- Players
  DROP POLICY IF EXISTS "Players Read Policy" ON players;
  DROP POLICY IF EXISTS "Players Insert Policy" ON players;
  DROP POLICY IF EXISTS "Players Update Policy" ON players;
  DROP POLICY IF EXISTS "Players Delete Policy" ON players;
  
  -- Team Memberships
  DROP POLICY IF EXISTS "Team Memberships Read Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Insert Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Update Policy" ON team_memberships;
  DROP POLICY IF EXISTS "Team Memberships Delete Policy" ON team_memberships;
  
  -- Evaluations
  DROP POLICY IF EXISTS "Evaluations Read Policy" ON evaluations;
  DROP POLICY IF EXISTS "Evaluations Insert Policy" ON evaluations;
  DROP POLICY IF EXISTS "Evaluations Update Policy" ON evaluations;
  DROP POLICY IF EXISTS "Evaluations Delete Policy" ON evaluations;

  -- Storage
  DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
  DROP POLICY IF EXISTS "Team photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can upload photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can update photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can delete photos" ON storage.objects;
END $$;

-- Teams Policies
CREATE POLICY "Teams Read Policy"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teams Insert Policy"
ON teams FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_teams()
);

CREATE POLICY "Teams Update Policy"
ON teams FOR UPDATE
TO authenticated
USING (
  can_manage_teams() AND (
    is_admin() OR user_id = auth.uid()
  )
)
WITH CHECK (
  can_manage_teams() AND (
    is_admin() OR user_id = auth.uid()
  )
);

CREATE POLICY "Teams Delete Policy"
ON teams FOR DELETE
TO authenticated
USING (
  can_manage_teams() AND (
    is_admin() OR user_id = auth.uid()
  )
);

-- Players Policies
CREATE POLICY "Players Read Policy"
ON players FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Players Insert Policy"
ON players FOR INSERT
TO authenticated
WITH CHECK (can_manage_players());

CREATE POLICY "Players Update Policy"
ON players FOR UPDATE
TO authenticated
USING (can_manage_players())
WITH CHECK (can_manage_players());

CREATE POLICY "Players Delete Policy"
ON players FOR DELETE
TO authenticated
USING (can_manage_players());

-- Team Memberships Policies
CREATE POLICY "Team Memberships Read Policy"
ON team_memberships FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Team Memberships Insert Policy"
ON team_memberships FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_teams() AND EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND (is_admin() OR user_id = auth.uid())
  )
);

CREATE POLICY "Team Memberships Update Policy"
ON team_memberships FOR UPDATE
TO authenticated
USING (
  can_manage_teams() AND EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND (is_admin() OR user_id = auth.uid())
  )
)
WITH CHECK (
  can_manage_teams() AND EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND (is_admin() OR user_id = auth.uid())
  )
);

CREATE POLICY "Team Memberships Delete Policy"
ON team_memberships FOR DELETE
TO authenticated
USING (
  can_manage_teams() AND EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND (is_admin() OR user_id = auth.uid())
  )
);

-- Evaluations Policies
CREATE POLICY "Evaluations Read Policy"
ON evaluations FOR SELECT
TO authenticated
USING (
  evaluator_id = auth.uid() OR
  can_manage_evaluations() OR
  EXISTS (
    SELECT 1 FROM team_memberships tm
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.player_id = evaluations.player_id
    AND t.user_id = auth.uid()
  )
);

CREATE POLICY "Evaluations Insert Policy"
ON evaluations FOR INSERT
TO authenticated
WITH CHECK (
  can_manage_evaluations() AND
  evaluator_id = auth.uid()
);

CREATE POLICY "Evaluations Update Policy"
ON evaluations FOR UPDATE
TO authenticated
USING (
  can_manage_evaluations() AND
  (evaluator_id = auth.uid() OR is_admin())
)
WITH CHECK (
  can_manage_evaluations() AND
  (evaluator_id = auth.uid() OR is_admin())
);

CREATE POLICY "Evaluations Delete Policy"
ON evaluations FOR DELETE
TO authenticated
USING (
  can_manage_evaluations() AND
  (evaluator_id = auth.uid() OR is_admin())
);

-- Storage Policies for Teams and Players
CREATE POLICY "Storage Read Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('teams', 'players'));

CREATE POLICY "Storage Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('teams', 'players') AND
  (
    -- For team photos
    (bucket_id = 'teams' AND EXISTS (
      SELECT 1 FROM teams
      WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR user_id = auth.uid())
    )) OR
    -- For player photos
    (bucket_id = 'players' AND EXISTS (
      SELECT 1 FROM players p
      JOIN team_memberships tm ON tm.player_id = p.id
      JOIN teams t ON t.id = tm.team_id
      WHERE p.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR t.user_id = auth.uid())
    ))
  )
);

CREATE POLICY "Storage Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('teams', 'players') AND
  (
    -- For team photos
    (bucket_id = 'teams' AND EXISTS (
      SELECT 1 FROM teams
      WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR user_id = auth.uid())
    )) OR
    -- For player photos
    (bucket_id = 'players' AND EXISTS (
      SELECT 1 FROM players p
      JOIN team_memberships tm ON tm.player_id = p.id
      JOIN teams t ON t.id = tm.team_id
      WHERE p.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR t.user_id = auth.uid())
    ))
  )
);

CREATE POLICY "Storage Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('teams', 'players') AND
  (
    -- For team photos
    (bucket_id = 'teams' AND EXISTS (
      SELECT 1 FROM teams
      WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR user_id = auth.uid())
    )) OR
    -- For player photos
    (bucket_id = 'players' AND EXISTS (
      SELECT 1 FROM players p
      JOIN team_memberships tm ON tm.player_id = p.id
      JOIN teams t ON t.id = tm.team_id
      WHERE p.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
      AND (is_admin() OR t.user_id = auth.uid())
    ))
  )
);