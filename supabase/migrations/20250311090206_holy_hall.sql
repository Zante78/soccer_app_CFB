/*
  # Add additional team fields
  
  1. New Fields
    - venue (text, nullable): Training/match venue
    - training_time (text, nullable): Regular training schedule
    - contact_email (text, nullable): Team contact email
    - contact_phone (text, nullable): Team contact phone number

  2. Changes
    - Added validation for email format
    - Added validation for phone format
*/

-- Add new columns to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS venue text,
ADD COLUMN IF NOT EXISTS training_time text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text;

-- Add email format validation
ALTER TABLE teams
ADD CONSTRAINT valid_contact_email 
CHECK (
  contact_email IS NULL OR 
  contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Add phone format validation
ALTER TABLE teams
ADD CONSTRAINT valid_contact_phone 
CHECK (
  contact_phone IS NULL OR 
  contact_phone ~ '^[0-9+() -]{8,}$'
);

-- Update RLS policies
ALTER POLICY "Teams update policy" ON teams
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = ANY (ARRAY['admin', 'coach', 'manager'])
));