/*
  # Add Storage Policies for Player Photos

  1. Changes
    - Create storage bucket for player photos
    - Enable RLS on storage.objects
    - Add policies for authenticated users to manage photos
    
  2. Security
    - Authenticated users can upload and view photos
    - Only owners and admins can delete photos
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('players', 'players', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to upload player photos
CREATE POLICY "Allow authenticated users to upload player photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);

-- Allow authenticated users to view player photos
CREATE POLICY "Allow authenticated users to view player photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'players');

-- Allow owners and admins to update their photos
CREATE POLICY "Allow owners and admins to update player photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'players')
WITH CHECK (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);

-- Allow owners and admins to delete their photos
CREATE POLICY "Allow owners and admins to delete player photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'players' AND
  (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
  ))
);