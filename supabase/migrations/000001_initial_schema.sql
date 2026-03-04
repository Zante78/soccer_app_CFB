-- ===== CFB PASS-AUTOMATION: INITIAL SCHEMA =====
-- Migration: 000001_initial_schema
-- Description: Core tables for registration, audit, RPA traces, finance, users, teams
-- Author: CFB Development Team
-- Date: 2026-03-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== ENUMS =====

CREATE TYPE registration_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'VALIDATION_PENDING',
  'READY_FOR_BOT',
  'BOT_IN_PROGRESS',
  'COMPLETED',
  'ERROR',
  'MANUALLY_PROCESSED',
  'VISUAL_REGRESSION_ERROR'
);

CREATE TYPE payment_method AS ENUM (
  'PAYPAL',
  'CASH',
  'BANK_TRANSFER',
  'EXEMPT'
);

CREATE TYPE role_type AS ENUM (
  'SUPER_ADMIN',
  'PASSWART',
  'TRAINER',
  'ANTRAGSTELLER'
);

CREATE TYPE registration_reason AS ENUM (
  'NEW_PLAYER',
  'TRANSFER',
  'RE_REGISTRATION',
  'INTERNATIONAL_TRANSFER'
);

CREATE TYPE rpa_trace_status AS ENUM (
  'QUEUED',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'VISUAL_REGRESSION_ERROR',
  'TIMEOUT'
);

-- ===== TEAMS TABLE =====

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  dfbnet_id TEXT UNIQUE,
  season INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_season ON teams(season);
CREATE INDEX idx_teams_dfbnet_id ON teams(dfbnet_id) WHERE dfbnet_id IS NOT NULL;

-- ===== USERS TABLE =====

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role role_type NOT NULL DEFAULT 'ANTRAGSTELLER',
  full_name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_team_id ON users(team_id) WHERE team_id IS NOT NULL;

-- ===== REGISTRATIONS TABLE =====

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name TEXT NOT NULL,
  player_birth_date DATE NOT NULL,
  player_dfb_id TEXT,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  status registration_status NOT NULL DEFAULT 'DRAFT',
  eligibility_date DATE,
  sperrfrist_start DATE,
  sperrfrist_end DATE,
  registration_reason registration_reason NOT NULL DEFAULT 'NEW_PLAYER',
  previous_team_name TEXT,
  previous_team_deregistration_date DATE,
  previous_team_last_game DATE,
  player_data JSONB DEFAULT '{}'::jsonb,
  consent_flags JSONB DEFAULT '{}'::jsonb,
  document_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  photo_path TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_team_id ON registrations(team_id);
CREATE INDEX idx_registrations_player_name ON registrations(player_name);
CREATE INDEX idx_registrations_player_birth_date ON registrations(player_birth_date);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX idx_registrations_eligibility_date ON registrations(eligibility_date);

-- ===== AUDIT_LOGS TABLE =====

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_registration_id ON audit_logs(registration_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ===== RPA_TRACES TABLE =====

CREATE TABLE rpa_traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  execution_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  status rpa_trace_status NOT NULL DEFAULT 'QUEUED',
  dfbnet_draft_url TEXT,
  screenshot_actual TEXT,
  screenshot_baseline TEXT,
  visual_diff_score DECIMAL(5,4),
  error_message TEXT,
  error_stacktrace TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  bot_version TEXT NOT NULL DEFAULT '1.0.0'
);

CREATE INDEX idx_rpa_traces_registration_id ON rpa_traces(registration_id);
CREATE INDEX idx_rpa_traces_execution_id ON rpa_traces(execution_id);
CREATE INDEX idx_rpa_traces_status ON rpa_traces(status);
CREATE INDEX idx_rpa_traces_started_at ON rpa_traces(started_at DESC);

-- ===== FINANCE_STATUS TABLE =====

CREATE TABLE finance_status (
  registration_id UUID PRIMARY KEY REFERENCES registrations(id) ON DELETE CASCADE,
  payment_method payment_method NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_amount DECIMAL(10,2),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  verified_by_trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_finance_status_is_paid ON finance_status(is_paid);
CREATE INDEX idx_finance_status_payment_method ON finance_status(payment_method);
CREATE INDEX idx_finance_status_verified_by ON finance_status(verified_by_trainer_id) WHERE verified_by_trainer_id IS NOT NULL;

-- ===== ROW-LEVEL SECURITY (RLS) POLICIES =====

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpa_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_status ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS role_type
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM users WHERE id = user_uuid;
$$;

-- Helper function to get current user's team_id
CREATE OR REPLACE FUNCTION get_user_team_id(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT team_id FROM users WHERE id = user_uuid;
$$;

-- REGISTRATIONS POLICIES

-- ANTRAGSTELLER: Can only view their own registrations
CREATE POLICY "antragsteller_view_own"
ON registrations
FOR SELECT
TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- ANTRAGSTELLER: Can insert/update their own registrations in DRAFT/SUBMITTED status
CREATE POLICY "antragsteller_modify_own"
ON registrations
FOR ALL
TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
  AND status IN ('DRAFT', 'SUBMITTED')
);

-- TRAINER: Can view registrations from their team
CREATE POLICY "trainer_view_team"
ON registrations
FOR SELECT
TO authenticated
USING (
  team_id = get_user_team_id(auth.uid())
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- PASSWART: Can view all registrations
CREATE POLICY "passwart_view_all"
ON registrations
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- PASSWART: Can update all registrations
CREATE POLICY "passwart_update_all"
ON registrations
FOR UPDATE
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- SUPER_ADMIN: Full access
CREATE POLICY "superadmin_all"
ON registrations
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- FINANCE_STATUS POLICIES

-- TRAINER: Can update finance status for their team (cash payment verification)
CREATE POLICY "trainer_verify_payment"
ON finance_status
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = finance_status.registration_id
    AND r.team_id = get_user_team_id(auth.uid())
  )
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- PASSWART/ADMIN: Can view all finance status
CREATE POLICY "admin_view_finance"
ON finance_status
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- RPA_TRACES POLICIES

-- PASSWART: Can view all RPA traces
CREATE POLICY "passwart_view_traces"
ON rpa_traces
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- AUDIT_LOGS POLICIES

-- SUPER_ADMIN: Can view all audit logs
CREATE POLICY "superadmin_view_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- TEAMS POLICIES

-- All authenticated users can view teams
CREATE POLICY "authenticated_view_teams"
ON teams
FOR SELECT
TO authenticated
USING (TRUE);

-- Only SUPER_ADMIN can modify teams
CREATE POLICY "superadmin_modify_teams"
ON teams
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- USERS POLICIES

-- Users can view their own profile
CREATE POLICY "users_view_own"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- SUPER_ADMIN can view/modify all users
CREATE POLICY "superadmin_users"
ON users
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- ===== TRIGGERS FOR UPDATED_AT =====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
BEFORE UPDATE ON registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===== STORAGE BUCKETS =====

INSERT INTO storage.buckets (id, name, public) VALUES
  ('player-photos', 'player-photos', false),
  ('player-documents', 'player-documents', false),
  ('rpa-screenshots', 'rpa-screenshots', false),
  ('rpa-baselines', 'rpa-baselines', false);

-- Storage Policies
CREATE POLICY "authenticated_upload_photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "authenticated_upload_documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'player-documents');

CREATE POLICY "passwart_view_all_storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('player-photos', 'player-documents', 'rpa-screenshots', 'rpa-baselines')
  AND get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- ===== COMMENTS =====

COMMENT ON TABLE registrations IS 'Core table for player pass registrations';
COMMENT ON TABLE audit_logs IS 'Immutable audit trail for compliance (DSGVO)';
COMMENT ON TABLE rpa_traces IS 'RPA bot execution logs with visual regression data';
COMMENT ON TABLE finance_status IS 'Payment tracking (PayPal, Cash, Bank Transfer)';
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON TABLE teams IS 'Football teams/mannschaften';

COMMENT ON COLUMN registrations.player_data IS 'Flexible JSONB for additional player fields';
COMMENT ON COLUMN registrations.consent_flags IS 'DSGVO consent, signature data';
COMMENT ON COLUMN rpa_traces.visual_diff_score IS 'Pixel difference score (0.0 = identical, 1.0 = completely different)';
COMMENT ON COLUMN finance_status.verified_by_trainer_id IS 'Trainer who verified cash payment via QR scan';
