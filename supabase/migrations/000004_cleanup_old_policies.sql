-- Optional: Cleanup alte/doppelte RLS Policies
-- Diese Policies sind redundant zu den neuen policies aus Migration 000003

-- Alte audit_logs policies
DROP POLICY IF EXISTS "passwart_view_audit" ON audit_logs;
DROP POLICY IF EXISTS "superadmin_view_audit" ON audit_logs;

-- Alte finance_status policies
DROP POLICY IF EXISTS "admin_view_finance" ON finance_status;
DROP POLICY IF EXISTS "trainer_verify_payment" ON finance_status;

-- Alte registrations policies
DROP POLICY IF EXISTS "antragsteller_modify_own" ON registrations;
DROP POLICY IF EXISTS "antragsteller_view_own" ON registrations;
DROP POLICY IF EXISTS "passwart_update_all" ON registrations;
DROP POLICY IF EXISTS "passwart_view_all" ON registrations;
DROP POLICY IF EXISTS "superadmin_all" ON registrations;
DROP POLICY IF EXISTS "trainer_view_team" ON registrations;

-- Alte rpa_traces policies
DROP POLICY IF EXISTS "passwart_view_traces" ON rpa_traces;

-- Verify nur noch die neuen policies existieren
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('registrations', 'finance_status', 'audit_logs', 'rpa_traces')
ORDER BY tablename, policyname;
