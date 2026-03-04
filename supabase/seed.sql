-- ===== SEED DATA FOR DEVELOPMENT =====
-- This file populates the database with test data for development

-- Insert Teams
INSERT INTO teams (id, name, dfbnet_id, season) VALUES
  ('11111111-1111-1111-1111-111111111111', 'A-Junioren U19', 'DFBNET-A19-2026', 2026),
  ('22222222-2222-2222-2222-222222222222', 'B-Junioren U17', 'DFBNET-B17-2026', 2026),
  ('33333333-3333-3333-3333-333333333333', '1. Herren Senioren', 'DFBNET-1HS-2026', 2026),
  ('44444444-4444-4444-4444-444444444444', 'E-Junioren U11', 'DFBNET-E11-2026', 2026);

-- Insert Users
INSERT INTO users (id, email, role, full_name, team_id, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@cfb-niehl.de', 'SUPER_ADMIN', 'Max Mustermann', NULL, TRUE),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'passwart@cfb-niehl.de', 'PASSWART', 'Anna Schmidt', NULL, TRUE),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'trainer-a19@cfb-niehl.de', 'TRAINER', 'Thomas Müller', '11111111-1111-1111-1111-111111111111', TRUE),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'trainer-senioren@cfb-niehl.de', 'TRAINER', 'Lisa Weber', '33333333-3333-3333-3333-333333333333', TRUE),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'eltern@example.com', 'ANTRAGSTELLER', 'Familie Beispiel', NULL, TRUE);

-- Insert Sample Registrations

-- Registration 1: New Player (A-Junioren) - COMPLETED
INSERT INTO registrations (
  id,
  player_name,
  player_birth_date,
  player_dfb_id,
  team_id,
  team_name,
  status,
  eligibility_date,
  sperrfrist_start,
  sperrfrist_end,
  registration_reason,
  player_data,
  consent_flags,
  document_paths,
  photo_path,
  submitted_at,
  created_by_user_id
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Max Spieler',
  '2008-05-15',
  'DFB-2008-12345',
  '11111111-1111-1111-1111-111111111111',
  'A-Junioren U19',
  'COMPLETED',
  '2026-03-01',
  NULL,
  NULL,
  'NEW_PLAYER',
  '{"email": "max@example.com", "phone": "+49 123 456789"}'::jsonb,
  '{"dsgvo_consent": true, "eligibility_declaration": true, "accuracy_confirmed": true}'::jsonb,
  ARRAY['/documents/ausweis-max.pdf'],
  '/photos/max-spieler.jpg',
  NOW() - INTERVAL '5 days',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- Registration 2: Transfer (Senioren) - READY_FOR_BOT
INSERT INTO registrations (
  id,
  player_name,
  player_birth_date,
  team_id,
  team_name,
  status,
  eligibility_date,
  sperrfrist_start,
  sperrfrist_end,
  registration_reason,
  previous_team_name,
  previous_team_deregistration_date,
  previous_team_last_game,
  player_data,
  consent_flags,
  document_paths,
  photo_path,
  submitted_at,
  created_by_user_id
) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Thomas Wechsler',
  '1995-08-22',
  '33333333-3333-3333-3333-333333333333',
  '1. Herren Senioren',
  'READY_FOR_BOT',
  '2026-09-01',
  '2026-03-01',
  '2026-09-01',
  'TRANSFER',
  'SC Köln Süd',
  '2025-12-31',
  '2025-12-20',
  '{"email": "thomas@example.com"}'::jsonb,
  '{"dsgvo_consent": true, "eligibility_declaration": true, "accuracy_confirmed": true}'::jsonb,
  ARRAY['/documents/ausweis-thomas.pdf', '/documents/abmeldung-thomas.pdf'],
  '/photos/thomas-wechsler.jpg',
  NOW() - INTERVAL '1 day',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- Registration 3: Draft (not yet submitted)
INSERT INTO registrations (
  id,
  player_name,
  player_birth_date,
  team_id,
  team_name,
  status,
  registration_reason,
  player_data,
  consent_flags,
  created_by_user_id
) VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Jonas Junior',
  '2013-03-10',
  '44444444-4444-4444-4444-444444444444',
  'E-Junioren U11',
  'DRAFT',
  'NEW_PLAYER',
  '{"email": "jonas@example.com"}'::jsonb,
  '{"dsgvo_consent": false, "eligibility_declaration": false, "accuracy_confirmed": false}'::jsonb,
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- Insert Finance Status
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference) VALUES
  ('10000000-0000-0000-0000-000000000001', 'PAYPAL', TRUE, 50.00, NOW() - INTERVAL '5 days', 'PAYPAL-TXN-123456'),
  ('10000000-0000-0000-0000-000000000002', 'CASH', TRUE, 50.00, NOW() - INTERVAL '1 day', NULL);

-- Update finance status for cash payment with trainer verification
UPDATE finance_status SET
  verified_by_trainer_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  verified_at = NOW() - INTERVAL '1 day'
WHERE registration_id = '10000000-0000-0000-0000-000000000002';

-- Insert RPA Traces
INSERT INTO rpa_traces (
  registration_id,
  execution_id,
  status,
  dfbnet_draft_url,
  screenshot_actual,
  screenshot_baseline,
  visual_diff_score,
  started_at,
  completed_at,
  duration_ms,
  bot_version
) VALUES (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'SUCCESS',
  'https://dfbnet.org/draft/12345',
  '/screenshots/actual-20000001.png',
  '/baselines/baseline-draft.png',
  0.0015,
  NOW() - INTERVAL '4 days 23 hours',
  NOW() - INTERVAL '4 days 22 hours 30 minutes',
  1800000,
  '1.0.0'
);

-- Insert Audit Logs
INSERT INTO audit_logs (registration_id, action, new_value, user_id, ip_address) VALUES
  ('10000000-0000-0000-0000-000000000001', 'registration_created', '{"status": "DRAFT"}'::jsonb, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '192.168.1.100'),
  ('10000000-0000-0000-0000-000000000001', 'registration_submitted', '{"status": "SUBMITTED"}'::jsonb, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '192.168.1.100'),
  ('10000000-0000-0000-0000-000000000001', 'payment_confirmed', '{"is_paid": true, "payment_method": "PAYPAL"}'::jsonb, NULL, NULL),
  ('10000000-0000-0000-0000-000000000001', 'bot_execution_success', '{"status": "COMPLETED"}'::jsonb, NULL, NULL),
  ('10000000-0000-0000-0000-000000000002', 'registration_created', '{"status": "DRAFT"}'::jsonb, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '192.168.1.101'),
  ('10000000-0000-0000-0000-000000000002', 'payment_verified_cash', '{"is_paid": true, "verified_by": "Lisa Weber"}'::jsonb, 'dddddddd-dddd-dddd-dddd-dddddddddddd', '192.168.1.50');

-- Update last_login for users
UPDATE users SET last_login = NOW() - INTERVAL '1 hour' WHERE email = 'passwart@cfb-niehl.de';
UPDATE users SET last_login = NOW() - INTERVAL '3 hours' WHERE email = 'trainer-senioren@cfb-niehl.de';
