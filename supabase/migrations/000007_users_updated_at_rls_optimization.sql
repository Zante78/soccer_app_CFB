-- Migration 000007: Users updated_at + RLS Performance Optimization
-- 1. Add updated_at column to users table
-- 2. Add trigger for automatic updated_at on users
-- 3. Optimize RLS policies to use subquery pattern for PG caching

-- ==========================================
-- 1. Users: Add updated_at column + trigger
-- ==========================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows
UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;

-- Auto-update trigger for users.updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ==========================================
-- 2. RLS Policy Optimization (Subquery Pattern)
-- Replace function calls with inline subqueries for PostgreSQL query caching
-- ==========================================

-- Drop existing policies that use get_user_role()/get_user_team_id() functions
DROP POLICY IF EXISTS "antragsteller_view_own_registrations" ON registrations;
DROP POLICY IF EXISTS "trainer_view_team_registrations" ON registrations;
DROP POLICY IF EXISTS "passwart_admin_view_all_registrations" ON registrations;
DROP POLICY IF EXISTS "admin_manage_registrations" ON registrations;

DROP POLICY IF EXISTS "antragsteller_view_own_finance" ON finance_status;
DROP POLICY IF EXISTS "trainer_view_team_finance" ON finance_status;
DROP POLICY IF EXISTS "passwart_admin_view_all_finance" ON finance_status;

DROP POLICY IF EXISTS "passwart_admin_view_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "passwart_admin_view_all_rpa_traces" ON rpa_traces;

-- ==========================================
-- 2a. Registrations Policies (Optimized)
-- ==========================================

-- ANTRAGSTELLER: Only own registrations
CREATE POLICY "antragsteller_view_own_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
);

-- TRAINER: Only team registrations
CREATE POLICY "trainer_view_team_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

-- PASSWART + SUPER_ADMIN: All registrations
CREATE POLICY "passwart_admin_view_all_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- SUPER_ADMIN: Full CRUD on registrations
CREATE POLICY "admin_manage_registrations"
ON registrations FOR ALL TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'SUPER_ADMIN'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- ==========================================
-- 2b. Finance Status Policies (Optimized)
-- ==========================================

-- ANTRAGSTELLER: Own finance status
CREATE POLICY "antragsteller_view_own_finance"
ON finance_status FOR SELECT TO authenticated
USING (
  registration_id IN (
    SELECT id FROM registrations WHERE created_by_user_id = auth.uid()
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
);

-- TRAINER: Team finance status
CREATE POLICY "trainer_view_team_finance"
ON finance_status FOR SELECT TO authenticated
USING (
  registration_id IN (
    SELECT id FROM registrations WHERE team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

-- PASSWART + SUPER_ADMIN: All finance status
CREATE POLICY "passwart_admin_view_all_finance"
ON finance_status FOR SELECT TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- ==========================================
-- 2c. Audit Logs Policies (Optimized)
-- ==========================================

-- PASSWART + SUPER_ADMIN: All audit logs
CREATE POLICY "passwart_admin_view_audit_logs"
ON audit_logs FOR SELECT TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- ==========================================
-- 2d. RPA Traces Policies (Optimized)
-- ==========================================

-- PASSWART + SUPER_ADMIN: All RPA traces
CREATE POLICY "passwart_admin_view_all_rpa_traces"
ON rpa_traces FOR SELECT TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- ==========================================
-- 3. Index for created_by_user_id (supports ANTRAGSTELLER RLS filter)
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_registrations_created_by_user_id
ON registrations (created_by_user_id);
