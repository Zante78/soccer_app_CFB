-- Fix RLS Policies für Dashboard und Registrierungsliste
-- Run in Supabase SQL Editor

-- ANTRAGSTELLER: Kann eigene Registrierungen sehen
-- (Diese Policy fehlt noch!)
CREATE POLICY IF NOT EXISTS "antragsteller_view_own_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND get_user_role(auth.uid()) = 'ANTRAGSTELLER'
);

-- ANTRAGSTELLER: Kann finance_status für eigene Registrierungen sehen
CREATE POLICY IF NOT EXISTS "antragsteller_view_own_finance"
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
CREATE POLICY IF NOT EXISTS "trainer_view_team_finance"
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

-- SUPER_ADMIN/PASSWART: Können audit_logs sehen
CREATE POLICY IF NOT EXISTS "passwart_view_audit"
ON audit_logs
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- Verify
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('registrations', 'finance_status', 'audit_logs') ORDER BY tablename, policyname;
