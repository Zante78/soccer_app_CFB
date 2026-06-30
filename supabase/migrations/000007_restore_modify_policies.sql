-- ===== MIGRATION 7: RESTORE INSERT/UPDATE POLICIES + AUDIT-HARDENING =====
-- Migration: 000007_restore_modify_policies
-- Description: Fixes critical regression from Migration 4 which dropped
--              INSERT/UPDATE policies without replacement, leaving the app
--              unable to create or modify registrations.
--
-- Also addresses Audit-Report Findings:
--   #6 — Migration 4 dropped policies (THIS migration restores them)
--   #11 — auth.uid() not wrapped in subquery (caching pattern)
--   Bonus: SECURITY DEFINER functions hardened with search_path
--
-- Author: CFB Development Team
-- Date: 2026-06-30
-- Audit-Reference: AUDIT-REPORT-2026-06-30.md

BEGIN;

-- ============================================================
-- 1. HARDEN SECURITY DEFINER FUNCTIONS (search_path injection)
-- ============================================================
-- Fixes Audit-Finding #10: SECURITY DEFINER without search_path
-- allows privilege escalation via pg_temp table shadowing.

ALTER FUNCTION public.get_user_role(UUID)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_user_team_id(UUID)
  SET search_path = public, pg_temp;

-- Note: bot_execution_lock functions from Migration 6 are hardened
-- in a separate migration step if needed; out of scope for this fix.

-- ============================================================
-- 2. RESTORE ANTRAGSTELLER INSERT/UPDATE ON REGISTRATIONS
-- ============================================================
-- Migration 4 dropped "antragsteller_modify_own" (FOR ALL) without
-- replacement. Migration 3 has only SELECT. Result: ANTRAGSTELLER
-- cannot register at all (42501 RLS violation).

DROP POLICY IF EXISTS "antragsteller_insert_own_registrations" ON registrations;
CREATE POLICY "antragsteller_insert_own_registrations"
ON registrations
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_user_id = (SELECT auth.uid())
  AND (SELECT get_user_role((SELECT auth.uid()))) = 'ANTRAGSTELLER'
);

DROP POLICY IF EXISTS "antragsteller_update_own_draft" ON registrations;
CREATE POLICY "antragsteller_update_own_draft"
ON registrations
FOR UPDATE
TO authenticated
USING (
  created_by_user_id = (SELECT auth.uid())
  AND status IN ('DRAFT', 'SUBMITTED', 'VALIDATION_PENDING')
  AND (SELECT get_user_role((SELECT auth.uid()))) = 'ANTRAGSTELLER'
)
WITH CHECK (
  created_by_user_id = (SELECT auth.uid())
  AND status IN ('DRAFT', 'SUBMITTED', 'VALIDATION_PENDING')
);

-- ============================================================
-- 3. RESTORE PASSWART UPDATE ON REGISTRATIONS
-- ============================================================
-- Required so PASSWART can move registrations through statuses
-- (READY_FOR_BOT → BOT_IN_PROGRESS → COMPLETED, MANUALLY_PROCESSED, ERROR).

DROP POLICY IF EXISTS "passwart_update_all_registrations" ON registrations;
CREATE POLICY "passwart_update_all_registrations"
ON registrations
FOR UPDATE
TO authenticated
USING ((SELECT get_user_role((SELECT auth.uid()))) IN ('PASSWART', 'SUPER_ADMIN'))
WITH CHECK ((SELECT get_user_role((SELECT auth.uid()))) IN ('PASSWART', 'SUPER_ADMIN'));

-- ============================================================
-- 4. TRAINER: QR PAYMENT VERIFICATION ON FINANCE_STATUS
-- ============================================================
-- TRAINER must be able to confirm cash payments for their team.

DROP POLICY IF EXISTS "trainer_update_team_finance" ON finance_status;
CREATE POLICY "trainer_update_team_finance"
ON finance_status
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = finance_status.registration_id
    AND r.team_id = (SELECT get_user_team_id((SELECT auth.uid())))
  )
  AND (SELECT get_user_role((SELECT auth.uid()))) = 'TRAINER'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = finance_status.registration_id
    AND r.team_id = (SELECT get_user_team_id((SELECT auth.uid())))
  )
);

-- ============================================================
-- 5. PASSWART UPDATE ON RPA_TRACES (Visual Audit Accept Baseline)
-- ============================================================
-- PASSWART needs to update RPA traces (e.g., accept_baseline action).

DROP POLICY IF EXISTS "passwart_update_rpa_traces" ON rpa_traces;
CREATE POLICY "passwart_update_rpa_traces"
ON rpa_traces
FOR UPDATE
TO authenticated
USING ((SELECT get_user_role((SELECT auth.uid()))) IN ('PASSWART', 'SUPER_ADMIN'))
WITH CHECK ((SELECT get_user_role((SELECT auth.uid()))) IN ('PASSWART', 'SUPER_ADMIN'));

-- ============================================================
-- 6. UPGRADE EXISTING SELECT POLICIES TO USE SUBQUERY PATTERN
-- ============================================================
-- Audit-Finding #11: auth.uid() and get_user_role(auth.uid()) called
-- per-row instead of once per query. Wrapping in (SELECT ...) enables
-- InitPlan caching. Significant performance gain for PASSWART dashboard
-- which scans hundreds of rows.

-- ANTRAGSTELLER VIEW OWN REGISTRATIONS
DROP POLICY IF EXISTS "antragsteller_view_own_registrations" ON registrations;
CREATE POLICY "antragsteller_view_own_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (
  created_by_user_id = (SELECT auth.uid())
  AND (SELECT get_user_role((SELECT auth.uid()))) = 'ANTRAGSTELLER'
);

-- TRAINER VIEW TEAM REGISTRATIONS
DROP POLICY IF EXISTS "trainer_view_team_registrations" ON registrations;
CREATE POLICY "trainer_view_team_registrations"
ON registrations
FOR SELECT
TO authenticated
USING (
  team_id = (SELECT get_user_team_id((SELECT auth.uid())))
  AND (SELECT get_user_role((SELECT auth.uid()))) = 'TRAINER'
);

-- PASSWART VIEW ALL
DROP POLICY IF EXISTS "passwart_view_all_registrations" ON registrations;
CREATE POLICY "passwart_view_all_registrations"
ON registrations
FOR SELECT
TO authenticated
USING ((SELECT get_user_role((SELECT auth.uid()))) = 'PASSWART');

-- SUPER_ADMIN VIEW ALL
DROP POLICY IF EXISTS "super_admin_view_all_registrations" ON registrations;
CREATE POLICY "super_admin_view_all_registrations"
ON registrations
FOR SELECT
TO authenticated
USING ((SELECT get_user_role((SELECT auth.uid()))) = 'SUPER_ADMIN');

-- ============================================================
-- 7. SMOKE-TEST QUERY
-- ============================================================
-- After running this migration, this query should show INSERT and
-- UPDATE policies on registrations and rpa_traces.

DO $$
DECLARE
  insert_count INT;
  update_count INT;
BEGIN
  SELECT COUNT(*) INTO insert_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'registrations'
    AND cmd = 'INSERT';

  SELECT COUNT(*) INTO update_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'registrations'
    AND cmd = 'UPDATE';

  IF insert_count < 1 THEN
    RAISE EXCEPTION 'Migration 7 failed: no INSERT policy on registrations';
  END IF;

  IF update_count < 2 THEN
    RAISE EXCEPTION 'Migration 7 failed: expected >=2 UPDATE policies on registrations, got %', update_count;
  END IF;

  RAISE NOTICE 'Migration 7 verification OK: INSERT=%, UPDATE=%', insert_count, update_count;
END $$;

COMMIT;

-- ============================================================
-- POST-MIGRATION CHECK (run separately)
-- ============================================================
-- SELECT tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('registrations', 'finance_status', 'audit_logs', 'rpa_traces')
-- ORDER BY tablename, cmd, policyname;
