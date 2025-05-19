/*
  # Team Permissions Update

  1. Changes
    - Adds user_id column to teams table if not exists
    - Sets up RLS policies for team management
    - Updates storage policies for team photos

  2. Security
    - Enables RLS on teams table
    - Adds policies for team CRUD operations
    - Updates storage policies to use team ownership
*/

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

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Teams are viewable by authenticated users" ON teams;
  DROP POLICY IF EXISTS "Team owners can insert teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
  DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;
END $$;

-- Create new policies
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

-- Create teams storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teams', 'teams', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Team photos are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can upload photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can update photos" ON storage.objects;
  DROP POLICY IF EXISTS "Team owners can delete photos" ON storage.objects;
END $$;

-- Create new storage policies
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'teams');

CREATE POLICY "Team owners can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
    AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can update photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
    AND teams.user_id = auth.uid()
  )
);

CREATE POLICY "Team owners can delete photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teams' AND
  EXISTS (
    SELECT 1 FROM teams
    WHERE teams.id = CAST(SPLIT_PART(name, '-', 1) AS uuid)
    AND teams.user_id = auth.uid()
  )
);