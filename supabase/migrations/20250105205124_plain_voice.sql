/*
  # Add initial players

  1. New Data
    - Add three players:
      - Lion Kritikos (Innenverteidiger)
      - Emil Hillesheim (Innenverteidiger)
      - Can Cina (Sturm)
*/

-- Insert players
INSERT INTO players (first_name, last_name, team_id) VALUES
  ('Lion', 'Kritikos', NULL),
  ('Emil', 'Hillesheim', NULL),
  ('Can', 'Cina', NULL);

-- Add player details
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS position text,
ADD COLUMN IF NOT EXISTS jersey_number integer,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS height integer,
ADD COLUMN IF NOT EXISTS weight integer,
ADD COLUMN IF NOT EXISTS photo_url text;

-- Update player positions
UPDATE players 
SET position = 'Innenverteidiger'
WHERE first_name = 'Lion' AND last_name = 'Kritikos';

UPDATE players 
SET position = 'Innenverteidiger'
WHERE first_name = 'Emil' AND last_name = 'Hillesheim';

UPDATE players 
SET position = 'Sturm'
WHERE first_name = 'Can' AND last_name = 'Cina';