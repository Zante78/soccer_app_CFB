-- Fix RLS Policies für alle Rollen (ANTRAGSTELLER, TRAINER, PASSWART, SUPER_ADMIN)
-- Verwendet DROP IF EXISTS Pattern (CREATE IF NOT EXISTS wird nicht unterstützt)

-- ========================================
-- REGISTRATIONS TABLE
-- ========================================

-- ANTRAGSTELLER: Kann eigene Registrierungen sehen
DROP POLICY IF EXISTS "antragsteller_view_own_registrations" ON registrations;
CREATE POLICY "antragsteller_view_own_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- TRAINER: Kann Team-Registrierungen sehen
DROP POLICY IF EXISTS "trainer_view_team_registrations" ON registrations;
CREATE POLICY "trainer_view_team_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (
  team_id = get_user_team_id(auth.uid())
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- PASSWART: Kann alle Registrierungen sehen
DROP POLICY IF EXISTS "passwart_view_all_registrations" ON registrations;
CREATE POLICY "passwart_view_all_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'PASSWART');

-- SUPER_ADMIN: Kann alle Registrierungen sehen
DROP POLICY IF EXISTS "super_admin_view_all_registrations" ON registrations;
CREATE POLICY "super_admin_view_all_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- ========================================
-- FINANCE_STATUS TABLE
-- ========================================

-- ANTRAGSTELLER: Kann finance_status für eigene Registrierungen sehen
DROP POLICY IF EXISTS "antragsteller_view_own_finance" ON finance_status;
CREATE POLICY "antragsteller_view_own_finance"
ON finance_status
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = finance_status.registration_id
    AND r.created_by_user_id = auth.uid()
  )
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- TRAINER: Kann finance_status für Team-Registrierungen sehen
DROP POLICY IF EXISTS "trainer_view_team_finance" ON finance_status;
CREATE POLICY "trainer_view_team_finance"
ON finance_status
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = finance_status.registration_id
    AND r.team_id = get_user_team_id(auth.uid())
  )
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- PASSWART: Kann alle finance_status sehen
DROP POLICY IF EXISTS "passwart_view_all_finance" ON finance_status;
CREATE POLICY "passwart_view_all_finance"
ON finance_status
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'PASSWART');

-- SUPER_ADMIN: Kann alle finance_status sehen
DROP POLICY IF EXISTS "super_admin_view_all_finance" ON finance_status;
CREATE POLICY "super_admin_view_all_finance"
ON finance_status
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- ========================================
-- AUDIT_LOGS TABLE
-- ========================================

-- PASSWART: Kann alle audit_logs sehen
DROP POLICY IF EXISTS "passwart_view_all_audit" ON audit_logs;
CREATE POLICY "passwart_view_all_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'PASSWART');

-- SUPER_ADMIN: Kann alle audit_logs sehen
DROP POLICY IF EXISTS "super_admin_view_all_audit" ON audit_logs;
CREATE POLICY "super_admin_view_all_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- TRAINER: Kann audit_logs für eigene Team-Registrierungen sehen
DROP POLICY IF EXISTS "trainer_view_team_audit" ON audit_logs;
CREATE POLICY "trainer_view_team_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = audit_logs.registration_id
    AND r.team_id = get_user_team_id(auth.uid())
  )
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- ANTRAGSTELLER: Kann audit_logs für eigene Registrierungen sehen
DROP POLICY IF EXISTS "antragsteller_view_own_audit" ON audit_logs;
CREATE POLICY "antragsteller_view_own_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = audit_logs.registration_id
    AND r.created_by_user_id = auth.uid()
  )
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- ========================================
-- RPA_TRACES TABLE
-- ========================================

-- PASSWART: Kann alle rpa_traces sehen
DROP POLICY IF EXISTS "passwart_view_all_rpa" ON rpa_traces;
CREATE POLICY "passwart_view_all_rpa"
ON rpa_traces
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'PASSWART');

-- SUPER_ADMIN: Kann alle rpa_traces sehen
DROP POLICY IF EXISTS "super_admin_view_all_rpa" ON rpa_traces;
CREATE POLICY "super_admin_view_all_rpa"
ON rpa_traces
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) = 'SUPER_ADMIN');

-- TRAINER: Kann rpa_traces für Team-Registrierungen sehen
DROP POLICY IF EXISTS "trainer_view_team_rpa" ON rpa_traces;
CREATE POLICY "trainer_view_team_rpa"
ON rpa_traces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = rpa_traces.registration_id
    AND r.team_id = get_user_team_id(auth.uid())
  )
  AND get_user_role(auth.uid()) = 'TRAINER'
);

-- ANTRAGSTELLER: Kann rpa_traces für eigene Registrierungen sehen
DROP POLICY IF EXISTS "antragsteller_view_own_rpa" ON rpa_traces;
CREATE POLICY "antragsteller_view_own_rpa"
ON rpa_traces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = rpa_traces.registration_id
    AND r.created_by_user_id = auth.uid()
  )
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Verify all policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('registrations', 'finance_status', 'audit_logs', 'rpa_traces')
ORDER BY tablename, policyname;
