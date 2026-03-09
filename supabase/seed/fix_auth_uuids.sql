-- ===== FIX AUTH UUIDs =====
-- Synchronize users table with Supabase Auth UUIDs
-- Run this in Supabase SQL Editor

-- Disable triggers temporarily to allow UUID updates
ALTER TABLE users DISABLE TRIGGER ALL;
ALTER TABLE registrations DISABLE TRIGGER ALL;
ALTER TABLE audit_logs DISABLE TRIGGER ALL;

-- Update users table with actual Auth UUIDs
UPDATE users SET id = '58eabfed-44cb-4e25-8484-551c3d06dd86' WHERE email = 'admin@cfb-test.de';
UPDATE users SET id = '2f3b42bd-b9bb-43bb-b806-d2830563c9ce' WHERE email = 'passwart@cfb-test.de';
UPDATE users SET id = '0307ef72-8064-4b6b-83e5-1c2731f8f900' WHERE email = 'trainer.u19@cfb-test.de';
UPDATE users SET id = '4942bb63-1011-48d5-a427-e62d18864729' WHERE email = 'trainer.u17@cfb-test.de';
UPDATE users SET id = '8bf656d9-8c54-4482-9c25-6d899e7013b4' WHERE email = 'antrag@cfb-test.de';

-- Update registrations created_by_user_id (all test registrations created by ANTRAGSTELLER)
UPDATE registrations
SET created_by_user_id = '8bf656d9-8c54-4482-9c25-6d899e7013b4'
WHERE created_by_user_id = '40000000-0000-0000-0000-000000000005';

-- Update audit_logs user_id references
UPDATE audit_logs SET user_id = '8bf656d9-8c54-4482-9c25-6d899e7013b4' WHERE user_id = '40000000-0000-0000-0000-000000000005';
UPDATE audit_logs SET user_id = '2f3b42bd-b9bb-43bb-b806-d2830563c9ce' WHERE user_id = '20000000-0000-0000-0000-000000000002';
UPDATE audit_logs SET user_id = '4942bb63-1011-48d5-a427-e62d18864729' WHERE user_id = '30000000-0000-0000-0000-000000000004';

-- Update finance_status verified_by_trainer_id
UPDATE finance_status SET verified_by_trainer_id = '4942bb63-1011-48d5-a427-e62d18864729' WHERE verified_by_trainer_id = '30000000-0000-0000-0000-000000000004';

-- Re-enable triggers
ALTER TABLE users ENABLE TRIGGER ALL;
ALTER TABLE registrations ENABLE TRIGGER ALL;
ALTER TABLE audit_logs ENABLE TRIGGER ALL;

-- Verify
SELECT email, id, role, full_name FROM users ORDER BY role;
