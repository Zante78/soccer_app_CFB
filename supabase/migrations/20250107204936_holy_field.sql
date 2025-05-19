-- Add skills column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS players_skills_idx ON players USING gin(skills);

-- Update existing players with default skills
UPDATE players
SET skills = jsonb_build_array(
  jsonb_build_object('name', 'Ballkontrolle', 'value', 10, 'category', 'technical'),
  jsonb_build_object('name', 'Schusstechnik', 'value', 10, 'category', 'technical'),
  jsonb_build_object('name', 'Kopfballspiel', 'value', 10, 'category', 'technical'),
  jsonb_build_object('name', 'Freistöße', 'value', 10, 'category', 'technical'),
  jsonb_build_object('name', 'Eckbälle', 'value', 10, 'category', 'technical'),
  jsonb_build_object('name', 'Taktische Intelligenz', 'value', 10, 'category', 'mental'),
  jsonb_build_object('name', 'Schnelligkeit', 'value', 10, 'category', 'physical'),
  jsonb_build_object('name', 'Ausdauer', 'value', 10, 'category', 'physical'),
  jsonb_build_object('name', 'Kraft', 'value', 10, 'category', 'physical'),
  jsonb_build_object('name', 'Mentale Stärke', 'value', 10, 'category', 'mental'),
  jsonb_build_object('name', 'Teamfähigkeit', 'value', 10, 'category', 'social'),
  jsonb_build_object('name', 'Kommunikation', 'value', 10, 'category', 'social')
)
WHERE skills IS NULL OR skills = '[]'::jsonb;