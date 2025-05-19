-- Drop existing notes table if it exists
DROP TABLE IF EXISTS notes CASCADE;

-- Create notes table with correct schema
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('general', 'performance', 'tactical', 'technical', 'physical', 'medical', 'disciplinary', 'development')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create indexes
CREATE INDEX notes_player_id_idx ON notes(player_id);
CREATE INDEX notes_author_id_idx ON notes(author_id);
CREATE INDEX notes_date_idx ON notes(date DESC);
CREATE INDEX notes_category_idx ON notes(category);

-- Create trigger for updated_at
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE notes IS 'Player notes and observations';
COMMENT ON COLUMN notes.player_id IS 'The player this note is about';
COMMENT ON COLUMN notes.author_id IS 'The user who created this note';
COMMENT ON COLUMN notes.category IS 'The type/category of the note';
COMMENT ON COLUMN notes.tags IS 'Optional tags for better organization';