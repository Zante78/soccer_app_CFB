-- ===== FIX AUTH UUIDs (Alternative Approach) =====
-- Step 1: Create temporary mapping table
CREATE TEMP TABLE uuid_mapping (
  old_uuid UUID,
  new_uuid UUID,
  email TEXT
);

-- Insert mappings
INSERT INTO uuid_mapping (old_uuid, new_uuid, email) VALUES
  ('10000000-0000-0000-0000-000000000001', '58eabfed-44cb-4e25-8484-551c3d06dd86', 'admin@cfb-test.de'),
  ('20000000-0000-0000-0000-000000000002', '2f3b42bd-b9bb-43bb-b806-d2830563c9ce', 'passwart@cfb-test.de'),
  ('30000000-0000-0000-0000-000000000003', '0307ef72-8064-4b6b-83e5-1c2731f8f900', 'trainer.u19@cfb-test.de'),
  ('30000000-0000-0000-0000-000000000004', '4942bb63-1011-48d5-a427-e62d18864729', 'trainer.u17@cfb-test.de'),
  ('40000000-0000-0000-0000-000000000005', '8bf656d9-8c54-4482-9c25-6d899e7013b4', 'antrag@cfb-test.de');

-- Step 2: Update foreign key references FIRST (before primary keys)

-- Update finance_status.verified_by_trainer_id
UPDATE finance_status
SET verified_by_trainer_id = m.new_uuid
FROM uuid_mapping m
WHERE finance_status.verified_by_trainer_id = m.old_uuid;

-- Update audit_logs.user_id
UPDATE audit_logs
SET user_id = m.new_uuid
FROM uuid_mapping m
WHERE audit_logs.user_id = m.old_uuid;

-- Update registrations.created_by_user_id
UPDATE registrations
SET created_by_user_id = m.new_uuid
FROM uuid_mapping m
WHERE registrations.created_by_user_id = m.old_uuid;

-- Step 3: Now update the primary keys in users table
-- We need to insert new records and delete old ones (UUIDs are immutable as PKs)

-- Insert new user records with correct Auth UUIDs
INSERT INTO users (id, email, role, full_name, team_id, created_at, last_login, is_active)
SELECT
  m.new_uuid,
  u.email,
  u.role,
  u.full_name,
  u.team_id,
  u.created_at,
  u.last_login,
  u.is_active
FROM users u
JOIN uuid_mapping m ON u.id = m.old_uuid
ON CONFLICT (id) DO NOTHING;

-- Delete old user records
DELETE FROM users WHERE id IN (
  SELECT old_uuid FROM uuid_mapping
);

-- Step 4: Verify
SELECT email, id, role, full_name FROM users ORDER BY role;
