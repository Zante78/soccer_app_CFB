-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(language, key)
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read translations"
  ON translations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage translations"
  ON translations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ));

-- Create updated_at trigger
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default translations
INSERT INTO translations (language, key, value) VALUES
  ('de', 'common.save', 'Speichern'),
  ('de', 'common.cancel', 'Abbrechen'),
  ('de', 'common.loading', 'Wird geladen...'),
  ('en', 'common.save', 'Save'),
  ('en', 'common.cancel', 'Cancel'),
  ('en', 'common.loading', 'Loading...')
ON CONFLICT DO NOTHING;