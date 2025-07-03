/*
  # Fix Storage Filename Validation

  1. Changes
    - Updates the storage.validate_file_upload function to support different filename formats
    - Adds conditional validation based on bucket ID
    - Supports all required filename patterns for different buckets
    
  2. Security
    - Maintains file size validation
    - Maintains file type validation
    - Uses appropriate regex patterns for each bucket
*/

-- Drop existing validation function and trigger
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;
DROP FUNCTION IF EXISTS storage.validate_file_upload();

-- Create improved validation function with bucket-specific filename patterns
CREATE OR REPLACE FUNCTION storage.validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid_filename boolean;
BEGIN
  -- Check file size (5MB limit)
  IF (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;

  -- Check file type
  IF NOT (NEW.metadata->>'mimetype' = ANY (ARRAY['image/jpeg', 'image/png', 'image/gif'])) THEN
    RAISE EXCEPTION 'Invalid file type. Allowed types: JPG, PNG, GIF';
  END IF;

  -- Validate filename format based on bucket
  CASE NEW.bucket_id
    -- Players bucket: players/{playerId}-{timestamp}.{ext}
    WHEN 'players' THEN
      is_valid_filename := NEW.name ~ '^players/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\d+\.[a-zA-Z]+$';
    
    -- Teams bucket: {teamId}-{timestamp}.{ext}
    WHEN 'teams' THEN
      is_valid_filename := NEW.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\d+\.[a-zA-Z]+$';
    
    -- Logos bucket: club_logos/club-logo-{timestamp}.{ext}
    WHEN 'logos' THEN
      is_valid_filename := NEW.name ~ '^club_logos/club-logo-\d+\.[a-zA-Z]+$';
    
    -- Exports bucket: export-{timestamp}.{ext}
    WHEN 'exports' THEN
      is_valid_filename := NEW.name ~ '^export-\d+\.[a-zA-Z]+$';
    
    -- Default case for any other buckets
    ELSE
      is_valid_filename := true;
  END CASE;

  IF NOT is_valid_filename THEN
    RAISE EXCEPTION 'Invalid filename format for bucket %', NEW.bucket_id;
  END IF;

  RETURN NEW;
END
$$;

-- Create trigger for file validation
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.validate_file_upload();

-- Add comment
COMMENT ON FUNCTION storage.validate_file_upload() IS 'Validates file uploads for size, type, and filename format based on bucket';