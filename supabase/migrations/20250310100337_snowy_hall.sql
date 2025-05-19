/*
  # Team Data Validation and Security

  1. Changes
    - Enable RLS on teams table
    - Add validation function and trigger
    - Update RLS policies
    - Add data validation constraints
    - Create storage bucket and policies for team photos
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add data validation
    - Configure storage access
*/

-- Enable RLS on teams table if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create validation function for team data
CREATE OR REPLACE FUNCTION public.validate_team_data()
RETURNS trigger AS $$
BEGIN
  -- Validate team name
  IF length(TRIM(BOTH FROM NEW.name)) = 0 THEN
    RAISE EXCEPTION 'Team name cannot be empty';
  END IF;

  -- Validate category
  IF length(TRIM(BOTH FROM NEW.category)) = 0 THEN
    RAISE EXCEPTION 'Team category cannot be empty';
  END IF;

  -- Validate season
  IF length(TRIM(BOTH FROM NEW.season)) = 0 THEN
    RAISE EXCEPTION 'Team season cannot be empty';
  END IF;

  -- Validate colors
  IF NEW.colors IS NOT NULL AND (
    jsonb_typeof(NEW.colors) != 'object' OR
    NOT (NEW.colors ? 'primary') OR
    NOT (NEW.colors ? 'secondary') OR
    jsonb_typeof(NEW.colors->'primary') != 'string' OR
    jsonb_typeof(NEW.colors->'secondary') != 'string'
  ) THEN
    RAISE EXCEPTION 'Invalid team colors format';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
DROP TRIGGER IF EXISTS validate_team_data_trigger ON public.teams;
CREATE TRIGGER validate_team_data_trigger
  BEFORE INSERT OR UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION validate_team_data();

-- Drop existing policies to ensure clean state
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teams Read Policy' AND tablename = 'teams') THEN
    DROP POLICY "Teams Read Policy" ON public.teams;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teams Insert Policy' AND tablename = 'teams') THEN
    DROP POLICY "Teams Insert Policy" ON public.teams;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teams Update Policy' AND tablename = 'teams') THEN
    DROP POLICY "Teams Update Policy" ON public.teams;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teams Delete Policy' AND tablename = 'teams') THEN
    DROP POLICY "Teams Delete Policy" ON public.teams;
  END IF;
END $$;

-- Create comprehensive RLS policies
CREATE POLICY "Teams Read Policy"
ON public.teams
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teams Insert Policy"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Teams Update Policy"
ON public.teams
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Teams Delete Policy"
ON public.teams
FOR DELETE
TO authenticated
USING (true);

-- Drop existing constraints if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_team_name' 
    AND table_name = 'teams'
  ) THEN
    ALTER TABLE public.teams DROP CONSTRAINT valid_team_name;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_team_category' 
    AND table_name = 'teams'
  ) THEN
    ALTER TABLE public.teams DROP CONSTRAINT valid_team_category;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_team_season' 
    AND table_name = 'teams'
  ) THEN
    ALTER TABLE public.teams DROP CONSTRAINT valid_team_season;
  END IF;

  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_team_colors' 
    AND table_name = 'teams'
  ) THEN
    ALTER TABLE public.teams DROP CONSTRAINT valid_team_colors;
  END IF;
END $$;

-- Add constraints for data validation
ALTER TABLE public.teams
  ADD CONSTRAINT valid_team_name 
  CHECK (length(TRIM(BOTH FROM name)) > 0) 
  NOT VALID;

ALTER TABLE public.teams
  ADD CONSTRAINT valid_team_category 
  CHECK (length(TRIM(BOTH FROM category)) > 0) 
  NOT VALID;

ALTER TABLE public.teams
  ADD CONSTRAINT valid_team_season 
  CHECK (length(TRIM(BOTH FROM season)) > 0) 
  NOT VALID;

ALTER TABLE public.teams
  ADD CONSTRAINT valid_team_colors 
  CHECK (
    (colors IS NULL) OR
    (
      jsonb_typeof(colors) = 'object' AND
      colors ? 'primary' AND
      colors ? 'secondary' AND
      jsonb_typeof(colors->'primary') = 'string' AND
      jsonb_typeof(colors->'secondary') = 'string'
    )
  ) NOT VALID;

-- Validate existing data
ALTER TABLE public.teams VALIDATE CONSTRAINT valid_team_name;
ALTER TABLE public.teams VALIDATE CONSTRAINT valid_team_category;
ALTER TABLE public.teams VALIDATE CONSTRAINT valid_team_season;
ALTER TABLE public.teams VALIDATE CONSTRAINT valid_team_colors;

-- Create storage bucket for team photos if it doesn't exist
INSERT INTO storage.buckets (id, name)
SELECT 'teams', 'teams'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'teams'
);

-- Set up storage bucket configuration
UPDATE storage.buckets
SET public = false,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif']
WHERE id = 'teams';

-- Create storage policies for team photos
CREATE POLICY "Authenticated users can upload team photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teams' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update team photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teams' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view team photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'teams');

CREATE POLICY "Team photo owners can delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'teams');