/*
  # Comprehensive RLS and Permissions Setup

  1. Changes
    - Sets up RLS for all tables
    - Adds role-based access control
    - Configures storage permissions
    - Updates team ownership model

  2. Security
    - Enables RLS on all tables
    - Adds granular access policies
    - Sets up proper storage bucket permissions
*/

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('teams', 'teams', true),
    ('players', 'players', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Teams policies
  DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
  DROP POLICY IF EXISTS "Team owners can insert teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;
  
  -- Storage policies
  DROP POLICY IF EXISTS "Team photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can upload photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can update photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can delete photos" ON storage.objects;
  DROP POLICY IF EXISTS "Player photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Player photos access control" ON storage.objects;
END $$;

-- Teams Policies
CREATE POLICY "Teams are viewable by authenticated users"
ON teams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Team owners can insert teams"
ON teams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team owners can update their teams"
ON teams FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team owners can delete their teams"
ON teams FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Storage Policies for Teams
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

CREATE POLICY "Team owners can upload team photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  (
    SELECT user_id FROM teams 
    WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
  ) = auth.uid()
);

CREATE POLICY "Team owners can update team photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  (
    SELECT user_id FROM teams 
    WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
  ) = auth.uid()
);

CREATE POLICY "Team owners can delete team photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  (
    SELECT user_id FROM teams 
    WHERE id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
  ) = auth.uid()
);

-- Storage Policies for Players
CREATE POLICY "Player photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'players');

CREATE POLICY "Player photos access control"
ON storage.objects 
FOR ALL 
TO authenticated
USING (
  bucket_id = 'players' AND
  EXISTS (
    SELECT 1 FROM teams t
    JOIN team_memberships tm ON t.id = tm.team_id
    WHERE t.user_id = auth.uid()
    AND tm.player_id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
  )
)
WITH CHECK (
  bucket_id = 'players' AND
  EXISTS (
    SELECT 1 FROM teams t
    JOIN team_memberships tm ON t.id = tm.team_id
    WHERE t.user_id = auth.uid()
    AND tm.player_id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
  )
);

-- Function to check team access
CREATE OR REPLACE FUNCTION public.has_team_access(team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams
    WHERE id = team_id
    AND user_id = auth.uid()
  );
END;
$$;