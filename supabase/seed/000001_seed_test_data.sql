-- ===== CFB PASS-AUTOMATION: SEED DATA =====
-- File: 000001_seed_test_data.sql
-- Description: Test data for Phase 3 Admin Dashboard validation
-- Author: CFB Development Team
-- Date: 2026-03-05
-- Purpose: Create test users, teams, registrations, audit logs for testing

-- NOTE: This assumes you have already run 000001_initial_schema.sql

-- ===== TEST TEAMS =====

INSERT INTO teams (id, name, dfbnet_id, season, metadata) VALUES
  ('00000000-0000-0000-0000-000000000001', 'U19 Regionalliga', 'DFBNET-U19-001', 2026, '{"coach": "Hans Müller", "league": "Regionalliga West"}'),
  ('00000000-0000-0000-0000-000000000002', 'U17 Oberliga', 'DFBNET-U17-002', 2026, '{"coach": "Anna Schmidt", "league": "Oberliga"}'),
  ('00000000-0000-0000-0000-000000000003', 'U15 Kreisliga', NULL, 2026, '{"coach": "Peter Wagner", "league": "Kreisliga A"}'),
  ('00000000-0000-0000-0000-000000000004', 'Herren 1. Mannschaft', 'DFBNET-HERREN-004', 2026, '{"coach": "Thomas Becker", "league": "Landesliga"}');

-- ===== TEST USERS =====
-- NOTE: In production, these would be created via Supabase Auth
-- For testing, we create them directly with known UUIDs
-- Password: "Test123!" for all users (you'll set this in Supabase Auth Dashboard)

INSERT INTO users (id, email, role, full_name, team_id, is_active) VALUES
  -- SUPER_ADMIN (can do everything)
  ('10000000-0000-0000-0000-000000000001', 'admin@cfb-test.de', 'SUPER_ADMIN', 'Max Superadmin', NULL, TRUE),

  -- PASSWART (can view all registrations, manage RPA)
  ('20000000-0000-0000-0000-000000000002', 'passwart@cfb-test.de', 'PASSWART', 'Maria Passwart', NULL, TRUE),

  -- TRAINER (can only view their team's registrations)
  ('30000000-0000-0000-0000-000000000003', 'trainer.u19@cfb-test.de', 'TRAINER', 'Hans Müller', '00000000-0000-0000-0000-000000000001', TRUE),
  ('30000000-0000-0000-0000-000000000004', 'trainer.u17@cfb-test.de', 'TRAINER', 'Anna Schmidt', '00000000-0000-0000-0000-000000000002', TRUE),

  -- ANTRAGSTELLER (normal user, creates registrations)
  ('40000000-0000-0000-0000-000000000005', 'antrag@cfb-test.de', 'ANTRAGSTELLER', 'Klaus Antragsteller', NULL, TRUE);

-- ===== TEST REGISTRATIONS =====

-- Registration 1: DRAFT (in progress)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, player_data, consent_flags,
  created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000001',
  'Leon Müller',
  '2008-03-15',
  NULL,
  '00000000-0000-0000-0000-000000000001',
  'U19 Regionalliga',
  'DRAFT',
  'NEW_PLAYER',
  '{"email": "leon.mueller@example.com", "phone": "+49 170 1234567", "address": "Musterstraße 10, 40211 Düsseldorf"}',
  '{"data_protection": false, "photo_consent": false, "medical_consent": false, "terms_accepted": false}',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
);

-- Registration 2: SUBMITTED (waiting for validation)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000002',
  'Emma Schmidt',
  '2009-07-22',
  NULL,
  '00000000-0000-0000-0000-000000000002',
  'U17 Oberliga',
  'SUBMITTED',
  'NEW_PLAYER',
  '2026-03-05',
  '{"email": "emma.schmidt@example.com", "phone": "+49 170 2345678", "address": "Hauptstraße 5, 40213 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000002/photo.jpg',
  NOW() - INTERVAL '1 day',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
);

-- Registration 3: READY_FOR_BOT (validated, paid, ready for RPA)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000003',
  'Lukas Wagner',
  '2010-11-08',
  NULL,
  '00000000-0000-0000-0000-000000000003',
  'U15 Kreisliga',
  'READY_FOR_BOT',
  'NEW_PLAYER',
  '2026-03-05',
  '{"email": "lukas.wagner@example.com", "phone": "+49 170 3456789", "address": "Bahnhofstraße 12, 40215 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000003/photo.jpg',
  NOW() - INTERVAL '4 hours',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '4 hours'
);

-- Registration 4: COMPLETED (successfully processed)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000004',
  'Sophie Becker',
  '2007-01-30',
  'DFB123456789',
  '00000000-0000-0000-0000-000000000004',
  'Herren 1. Mannschaft',
  'COMPLETED',
  'NEW_PLAYER',
  '2026-03-01',
  '{"email": "sophie.becker@example.com", "phone": "+49 170 4567890", "address": "Parkstraße 8, 40217 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000004/photo.jpg',
  NOW() - INTERVAL '7 days',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '2 days'
);

-- Registration 5: TRANSFER with Sperrfrist (blocking period)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, sperrfrist_start, sperrfrist_end,
  previous_team_name, previous_team_deregistration_date, previous_team_last_game,
  player_data, consent_flags, photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000005',
  'Tim Fischer',
  '2008-09-12',
  'DFB987654321',
  '00000000-0000-0000-0000-000000000001',
  'U19 Regionalliga',
  'SUBMITTED',
  'TRANSFER',
  '2026-09-01',
  '2026-03-01',
  '2026-09-01',
  'VfL Bochum U19',
  '2026-02-28',
  '2026-02-15',
  '{"email": "tim.fischer@example.com", "phone": "+49 170 5678901", "address": "Gartenstraße 3, 40219 Düsseldorf", "previous_club_name": "VfL Bochum U19", "previous_club_id": "DFBNET-BOCHUM-U19", "deregistration_date": "2026-02-28", "last_game_date": "2026-02-15"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000005/photo.jpg',
  NOW() - INTERVAL '2 days',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '2 days'
);

-- Registration 6: ERROR (bot failed)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000006',
  'Mia Hoffmann',
  '2009-05-18',
  NULL,
  '00000000-0000-0000-0000-000000000002',
  'U17 Oberliga',
  'ERROR',
  'NEW_PLAYER',
  '2026-03-05',
  '{"email": "mia.hoffmann@example.com", "phone": "+49 170 6789012", "address": "Lindenstraße 7, 40221 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000006/photo.jpg',
  NOW() - INTERVAL '6 hours',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '5 hours'
);

-- Registration 7: BOT_IN_PROGRESS (currently being processed)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000007',
  'Felix Weber',
  '2010-12-03',
  NULL,
  '00000000-0000-0000-0000-000000000003',
  'U15 Kreisliga',
  'BOT_IN_PROGRESS',
  'NEW_PLAYER',
  '2026-03-05',
  '{"email": "felix.weber@example.com", "phone": "+49 170 7890123", "address": "Rosenweg 15, 40223 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000007/photo.jpg',
  NOW() - INTERVAL '30 minutes',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '10 minutes'
);

-- Registration 8: VALIDATION_PENDING (submitted, waiting for PASSWART review)
INSERT INTO registrations (
  id, player_name, player_birth_date, player_dfb_id, team_id, team_name,
  status, registration_reason, eligibility_date, player_data, consent_flags,
  photo_path, submitted_at, created_by_user_id, created_at, updated_at
) VALUES (
  '50000000-0000-0000-0000-000000000008',
  'Hannah Klein',
  '2008-04-25',
  NULL,
  '00000000-0000-0000-0000-000000000001',
  'U19 Regionalliga',
  'VALIDATION_PENDING',
  'RE_REGISTRATION',
  '2026-03-05',
  '{"email": "hannah.klein@example.com", "phone": "+49 170 8901234", "address": "Schulstraße 22, 40225 Düsseldorf"}',
  '{"data_protection": true, "photo_consent": true, "medical_consent": true, "terms_accepted": true}',
  'player-photos/50000000-0000-0000-0000-000000000008/photo.jpg',
  NOW() - INTERVAL '12 hours',
  '40000000-0000-0000-0000-000000000005',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '12 hours'
);

-- ===== FINANCE_STATUS =====

-- Registration 2: Paid via PayPal
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference) VALUES
  ('50000000-0000-0000-0000-000000000002', 'PAYPAL', TRUE, 25.00, NOW() - INTERVAL '23 hours', 'PAYPAL-TXN-12345');

-- Registration 3: Paid via Cash (verified by Trainer)
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference, verified_by_trainer_id, verified_at) VALUES
  ('50000000-0000-0000-0000-000000000003', 'CASH', TRUE, 25.00, NOW() - INTERVAL '5 hours', 'CASH-QR-67890', '30000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 hours');

-- Registration 4: Paid via Bank Transfer
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference) VALUES
  ('50000000-0000-0000-0000-000000000004', 'BANK_TRANSFER', TRUE, 25.00, NOW() - INTERVAL '8 days', 'SEPA-REF-ABCDEF');

-- Registration 5: NOT paid yet
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount) VALUES
  ('50000000-0000-0000-0000-000000000005', 'PAYPAL', FALSE, NULL);

-- Registration 6: Paid but bot failed
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference) VALUES
  ('50000000-0000-0000-0000-000000000006', 'PAYPAL', TRUE, 25.00, NOW() - INTERVAL '6 hours', 'PAYPAL-TXN-54321');

-- Registration 7: Paid (processing in progress)
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount, paid_at, payment_reference, verified_by_trainer_id, verified_at) VALUES
  ('50000000-0000-0000-0000-000000000007', 'CASH', TRUE, 25.00, NOW() - INTERVAL '1 hour', 'CASH-QR-11111', '30000000-0000-0000-0000-000000000004', NOW() - INTERVAL '1 hour');

-- Registration 8: NOT paid yet
INSERT INTO finance_status (registration_id, payment_method, is_paid, paid_amount) VALUES
  ('50000000-0000-0000-0000-000000000008', 'PAYPAL', FALSE, NULL);

-- ===== AUDIT_LOGS =====

-- Audit for Registration 2 (Submitted)
INSERT INTO audit_logs (registration_id, action, old_value, new_value, user_id, timestamp) VALUES
  ('50000000-0000-0000-0000-000000000002', 'STATUS_CHANGE', '{"status": "DRAFT"}', '{"status": "SUBMITTED"}', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '23 hours');

-- Audit for Registration 3 (Validated by PASSWART)
INSERT INTO audit_logs (registration_id, action, old_value, new_value, user_id, timestamp) VALUES
  ('50000000-0000-0000-0000-000000000003', 'STATUS_CHANGE', '{"status": "SUBMITTED"}', '{"status": "VALIDATION_PENDING"}', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '6 hours'),
  ('50000000-0000-0000-0000-000000000003', 'STATUS_CHANGE', '{"status": "VALIDATION_PENDING"}', '{"status": "READY_FOR_BOT"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours'),
  ('50000000-0000-0000-0000-000000000003', 'PAYMENT_VERIFIED', '{"is_paid": false}', '{"is_paid": true, "method": "CASH"}', '30000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 hours');

-- Audit for Registration 4 (Completed)
INSERT INTO audit_logs (registration_id, action, old_value, new_value, user_id, timestamp) VALUES
  ('50000000-0000-0000-0000-000000000004', 'STATUS_CHANGE', '{"status": "DRAFT"}', '{"status": "SUBMITTED"}', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '7 days'),
  ('50000000-0000-0000-0000-000000000004', 'STATUS_CHANGE', '{"status": "SUBMITTED"}', '{"status": "READY_FOR_BOT"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '6 days'),
  ('50000000-0000-0000-0000-000000000004', 'STATUS_CHANGE', '{"status": "READY_FOR_BOT"}', '{"status": "BOT_IN_PROGRESS"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),
  ('50000000-0000-0000-0000-000000000004', 'STATUS_CHANGE', '{"status": "BOT_IN_PROGRESS"}', '{"status": "COMPLETED"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),
  ('50000000-0000-0000-0000-000000000004', 'DFB_ID_ASSIGNED', '{"player_dfb_id": null}', '{"player_dfb_id": "DFB123456789"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days');

-- Audit for Registration 6 (Failed)
INSERT INTO audit_logs (registration_id, action, old_value, new_value, user_id, timestamp) VALUES
  ('50000000-0000-0000-0000-000000000006', 'STATUS_CHANGE', '{"status": "DRAFT"}', '{"status": "SUBMITTED"}', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '6 hours'),
  ('50000000-0000-0000-0000-000000000006', 'STATUS_CHANGE', '{"status": "SUBMITTED"}', '{"status": "READY_FOR_BOT"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours 30 minutes'),
  ('50000000-0000-0000-0000-000000000006', 'STATUS_CHANGE', '{"status": "READY_FOR_BOT"}', '{"status": "BOT_IN_PROGRESS"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours 15 minutes'),
  ('50000000-0000-0000-0000-000000000006', 'STATUS_CHANGE', '{"status": "BOT_IN_PROGRESS"}', '{"status": "ERROR"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours'),
  ('50000000-0000-0000-0000-000000000006', 'BOT_ERROR', NULL, '{"error": "DFBnet timeout after 120s", "retry_count": 1}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 hours');

-- Audit for Registration 7 (In Progress)
INSERT INTO audit_logs (registration_id, action, old_value, new_value, user_id, timestamp) VALUES
  ('50000000-0000-0000-0000-000000000007', 'STATUS_CHANGE', '{"status": "DRAFT"}', '{"status": "SUBMITTED"}', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '30 minutes'),
  ('50000000-0000-0000-0000-000000000007', 'STATUS_CHANGE', '{"status": "SUBMITTED"}', '{"status": "READY_FOR_BOT"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '15 minutes'),
  ('50000000-0000-0000-0000-000000000007', 'STATUS_CHANGE', '{"status": "READY_FOR_BOT"}', '{"status": "BOT_IN_PROGRESS"}', '20000000-0000-0000-0000-000000000002', NOW() - INTERVAL '10 minutes');

-- ===== RPA_TRACES =====

-- Successful RPA execution (Registration 4)
INSERT INTO rpa_traces (
  id, registration_id, execution_id, status, dfbnet_draft_url,
  screenshot_actual, screenshot_baseline, visual_diff_score,
  started_at, completed_at, duration_ms, bot_version
) VALUES (
  '60000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000004',
  '70000000-0000-0000-0000-000000000001',
  'SUCCESS',
  'https://dfbnet.org/draft/abc123def456',
  'rpa-screenshots/70000000-0000-0000-0000-000000000001/final.png',
  'rpa-baselines/dfbnet-registration-form-v2.png',
  0.0012,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '45 seconds',
  45000,
  '1.0.0'
);

-- Failed RPA execution (Registration 6)
INSERT INTO rpa_traces (
  id, registration_id, execution_id, status,
  error_message, error_stacktrace,
  started_at, completed_at, duration_ms, bot_version
) VALUES (
  '60000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000006',
  '70000000-0000-0000-0000-000000000002',
  'TIMEOUT',
  'DFBnet did not respond within 120 seconds',
  'TimeoutError: Navigation timeout of 120000 ms exceeded\n  at Page.goto (playwright/lib/page.js:123)',
  NOW() - INTERVAL '5 hours 15 minutes',
  NOW() - INTERVAL '5 hours',
  120000,
  '1.0.0'
);

-- In-progress RPA execution (Registration 7)
INSERT INTO rpa_traces (
  id, registration_id, execution_id, status,
  started_at, bot_version
) VALUES (
  '60000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000007',
  '70000000-0000-0000-0000-000000000003',
  'RUNNING',
  NOW() - INTERVAL '10 minutes',
  '1.0.0'
);

-- ===== VERIFICATION QUERIES =====
-- Run these to verify seed data was inserted correctly

-- SELECT COUNT(*) FROM teams;            -- Should be 4
-- SELECT COUNT(*) FROM users;            -- Should be 5
-- SELECT COUNT(*) FROM registrations;    -- Should be 8
-- SELECT COUNT(*) FROM finance_status;   -- Should be 8
-- SELECT COUNT(*) FROM audit_logs;       -- Should be ~15
-- SELECT COUNT(*) FROM rpa_traces;       -- Should be 3

-- Check status distribution
-- SELECT status, COUNT(*) FROM registrations GROUP BY status ORDER BY status;

-- Check payment status
-- SELECT is_paid, COUNT(*) FROM finance_status GROUP BY is_paid;
