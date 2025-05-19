-- Drop existing club_settings table and related objects
DROP TABLE IF EXISTS club_settings CASCADE;

-- Create club_settings table
CREATE TABLE club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mein Verein',
  logo_url text,
  primary_color text DEFAULT '#000000',
  secondary_color text DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policy for development
CREATE POLICY "Allow authenticated access to club_settings"
  ON club_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_club_settings_updated_at
  BEFORE UPDATE ON club_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial settings if none exist
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);