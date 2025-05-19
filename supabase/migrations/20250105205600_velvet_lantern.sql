/*
  # Add club settings

  1. New Tables
    - `club_settings` for storing club-wide settings including logo
  2. Security
    - Enable RLS
    - Add policies for admin access
*/

CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read club settings"
  ON club_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage club settings"
  ON club_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_club_settings_updated_at
  BEFORE UPDATE ON club_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();