-- Create club_settings table
CREATE TABLE IF NOT EXISTS club_settings (
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

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read club settings" ON club_settings;
  DROP POLICY IF EXISTS "Anyone can update club settings" ON club_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Anyone can read club settings"
  ON club_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can update club settings"
  ON club_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_club_settings_updated_at ON club_settings;

-- Create trigger for updated_at
CREATE TRIGGER update_club_settings_updated_at
  BEFORE UPDATE ON club_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial settings if none exist
INSERT INTO club_settings (name)
SELECT 'Mein Verein'
WHERE NOT EXISTS (SELECT 1 FROM club_settings);