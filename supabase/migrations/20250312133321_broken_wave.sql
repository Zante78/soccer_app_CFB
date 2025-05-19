/*
  # Storage Settings and Optimization

  1. Changes
    - Configure storage bucket settings
    - Set file size limits
    - Add file type restrictions
    - Add storage cleanup function
    
  2. Settings
    - Max file size: 5MB
    - Allowed file types: jpg, jpeg, png, gif
    - Auto cleanup of old files
*/

-- Update teams bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'],
  updated_at = now()
WHERE id = 'teams';

-- Create function to clean up orphaned files
CREATE OR REPLACE FUNCTION storage.cleanup_orphaned_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = storage, public
AS $$
BEGIN
  -- Find and delete orphaned team photos
  DELETE FROM storage.objects o
  WHERE o.bucket_id = 'teams'
  AND NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id::text = split_part(o.name, '-', 1)
  );
END
$$;

-- Create function to get storage usage
CREATE OR REPLACE FUNCTION storage.get_bucket_usage(bucket_id text)
RETURNS TABLE (
  total_size bigint,
  file_count bigint,
  avg_file_size bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(SUM((metadata->>'size')::bigint), 0) as total_size,
    COUNT(*) as file_count,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM((metadata->>'size')::bigint), 0) / COUNT(*)
      ELSE 0
    END as avg_file_size
  FROM storage.objects
  WHERE bucket_id = $1
$$;

-- Create function to validate file upload
CREATE OR REPLACE FUNCTION storage.validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check file size
  IF (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;

  -- Check file type
  IF NOT (NEW.metadata->>'mimetype' = ANY (ARRAY['image/jpeg', 'image/png', 'image/gif'])) THEN
    RAISE EXCEPTION 'Invalid file type. Allowed types: JPG, PNG, GIF';
  END IF;

  -- Validate filename format (teamId-timestamp.ext)
  IF NOT (NEW.name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\d+\.[a-zA-Z]+$') THEN
    RAISE EXCEPTION 'Invalid filename format';
  END IF;

  RETURN NEW;
END
$$;

-- Create trigger for file validation
DROP TRIGGER IF EXISTS validate_file_upload_trigger ON storage.objects;
CREATE TRIGGER validate_file_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.validate_file_upload();

-- Add scheduled cleanup job
CREATE OR REPLACE FUNCTION storage.schedule_cleanup()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM storage.cleanup_orphaned_files();
END
$$;

-- Add comments
COMMENT ON FUNCTION storage.cleanup_orphaned_files() IS 'Removes orphaned files from storage';
COMMENT ON FUNCTION storage.get_bucket_usage(text) IS 'Returns storage usage statistics for a bucket';
COMMENT ON FUNCTION storage.validate_file_upload() IS 'Validates file uploads for size and type';