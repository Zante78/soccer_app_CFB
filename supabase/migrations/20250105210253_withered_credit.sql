-- Drop existing club_settings table and related objects
DROP TABLE IF EXISTS club_settings CASCADE;

-- Create club_settings table with proper constraints
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

-- Create policies
CREATE POLICY "Authenticated users can read club settings"
  ON club_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage club settings"
  ON club_settings FOR ALL
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

-- Insert initial settings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM club_settings LIMIT 1) THEN
    INSERT INTO club_settings (name) VALUES ('Mein Verein');
  END IF;
END $$;