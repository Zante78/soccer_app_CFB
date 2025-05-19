/*
  # Add Storage Policies for Player Photos

  1. Changes
    - Create storage bucket for player photos if it doesn't exist
    - Add RLS policies for player photos bucket
      - Authenticated users can upload photos
      - Authenticated users can read photos
      - Only admins and coaches can delete photos
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('players', 'players', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading photos
CREATE POLICY "Authenticated users can upload player photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players' AND
  (auth.role() IN ('admin', 'coach', 'manager') OR
   EXISTS (
     SELECT 1 FROM users
     WHERE users.id = auth.uid()
     AND users.role IN ('admin', 'coach', 'manager')
   ))
);

-- Policy for reading photos
CREATE POLICY "Anyone can view player photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'players');

-- Policy for deleting photos
CREATE POLICY "Only admins and coaches can delete player photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'players' AND
  (auth.role() IN ('admin', 'coach') OR
   EXISTS (
     SELECT 1 FROM users
     WHERE users.id = auth.uid()
     AND users.role IN ('admin', 'coach')
   ))
);

-- Policy for updating photos
CREATE POLICY "Only admins and coaches can update player photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'players' AND
  (auth.role() IN ('admin', 'coach') OR
   EXISTS (
     SELECT 1 FROM users
     WHERE users.id = auth.uid()
     AND users.role IN ('admin', 'coach')
   ))
);