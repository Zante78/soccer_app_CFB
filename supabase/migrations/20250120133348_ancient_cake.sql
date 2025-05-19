-- Add 'export' to notification_type enum
DO $$ 
BEGIN
  -- Drop existing type if exists
  DROP TYPE IF EXISTS notification_type CASCADE;
  
  -- Recreate type with new value
  CREATE TYPE notification_type AS ENUM (
    'match',
    'training',
    'player',
    'team',
    'system',
    'export'
  );

  -- Recreate notifications table with new type
  CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text NOT NULL,
    type notification_type NOT NULL,
    read boolean NOT NULL DEFAULT false,
    data jsonb,
    priority notification_priority NOT NULL DEFAULT 'medium',
    created_at timestamptz NOT NULL DEFAULT now(),
    read_at timestamptz,
    expires_at timestamptz,
    CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
  );

  -- Enable RLS
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

  -- Recreate policies
  CREATE POLICY "Users can read own notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update own notifications"
    ON notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own notifications"
    ON notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "System can create notifications"
    ON notifications
    FOR INSERT
    TO service_role
    WITH CHECK (true);

EXCEPTION
  WHEN duplicate_object THEN null;
END $$;