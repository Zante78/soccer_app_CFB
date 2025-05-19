/*
  # Notifications System Setup

  1. New Types
    - notification_type enum
    - notification_priority enum
  
  2. Tables
    - notifications table with user references and metadata
  
  3. Security
    - RLS enabled
    - Policies for user access control
    
  4. Automation
    - Trigger for marking notifications as read
    - Function for cleaning expired notifications
*/

-- Create custom types
CREATE TYPE notification_type AS ENUM (
  'match',
  'training',
  'player',
  'team',
  'system'
);

CREATE TYPE notification_priority AS ENUM (
  'low',
  'medium',
  'high'
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type notification_type NOT NULL,
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  priority notification_priority NOT NULL DEFAULT 'medium',
  group_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  expires_at timestamptz,
  
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for marking notifications as read
CREATE TRIGGER mark_notification_read_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_as_read();

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;