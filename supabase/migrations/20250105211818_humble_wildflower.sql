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

-- Create RLS policies with proper permissions
CREATE POLICY "Enable read access for all users"
  ON club_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON club_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM club_settings)  -- Only allow insert if no settings exist
  );

CREATE POLICY "Enable update for authenticated users"
  ON club_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_club_settings_updated_at
  BEFORE UPDATE ON club_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial settings
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);