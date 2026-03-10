-- Migration 000008: Restore Missing Write Policies
-- Migration 000007 dropped UPDATE/INSERT/DELETE policies without replacing them.
-- This migration restores write access using the optimized subquery pattern.

-- ==========================================
-- 1. Registrations: Write Policies
-- ==========================================

-- ANTRAGSTELLER: Can INSERT new registrations (own)
CREATE POLICY "antragsteller_insert_registrations"
ON registrations FOR INSERT TO authenticated
WITH CHECK (
  created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
);

-- ANTRAGSTELLER: Can UPDATE own registrations (only DRAFT/SUBMITTED)
CREATE POLICY "antragsteller_update_own_registrations"
ON registrations FOR UPDATE TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
  AND status IN ('DRAFT', 'SUBMITTED')
)
WITH CHECK (
  created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
  AND status IN ('DRAFT', 'SUBMITTED')
);

-- ANTRAGSTELLER: Can DELETE own DRAFT registrations
CREATE POLICY "antragsteller_delete_own_drafts"
ON registrations FOR DELETE TO authenticated
USING (
  created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
  AND status = 'DRAFT'
);

-- PASSWART: Can UPDATE all registrations
CREATE POLICY "passwart_update_all_registrations"
ON registrations FOR UPDATE TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'PASSWART'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'PASSWART'
);

-- Note: SUPER_ADMIN already has FOR ALL via "admin_manage_registrations" in 000007

-- ==========================================
-- 2. Finance Status: Write Policies
-- ==========================================

-- TRAINER: Can UPDATE finance_status for own team's registrations
CREATE POLICY "trainer_verify_team_payment"
ON finance_status FOR UPDATE TO authenticated
USING (
  registration_id IN (
    SELECT id FROM registrations
    WHERE team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
)
WITH CHECK (
  registration_id IN (
    SELECT id FROM registrations
    WHERE team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

-- PASSWART: Can UPDATE all finance_status
CREATE POLICY "passwart_update_all_finance"
ON finance_status FOR UPDATE TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'PASSWART'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'PASSWART'
);

-- SUPER_ADMIN: Full CRUD on finance_status
CREATE POLICY "admin_manage_finance"
ON finance_status FOR ALL TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'SUPER_ADMIN'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- ==========================================
-- 3. Audit Logs: Insert Policy (for system writes)
-- ==========================================

-- All authenticated users can INSERT audit logs (triggered by actions)
CREATE POLICY "authenticated_insert_audit_logs"
ON audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- ==========================================
-- 4. RPA Traces: Write Policies
-- ==========================================

-- PASSWART + SUPER_ADMIN: Can UPDATE rpa_traces (accept baseline, retry)
CREATE POLICY "passwart_admin_update_rpa_traces"
ON rpa_traces FOR UPDATE TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- Service role inserts RPA traces (via n8n), but for completeness:
CREATE POLICY "admin_insert_rpa_traces"
ON rpa_traces FOR INSERT TO authenticated
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'SUPER_ADMIN'
);
