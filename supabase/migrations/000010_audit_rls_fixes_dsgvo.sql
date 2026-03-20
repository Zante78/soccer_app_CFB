-- Migration 000010: Restore Missing RLS Policies + audit_logs DSGVO
--
-- Fixes from Deep Audit R13 (2026-03-20):
-- 1. TRAINER audit_logs SELECT policy (dropped in 000007, never recreated)
-- 2. ANTRAGSTELLER rpa_traces SELECT policy (dropped in 000007, never recreated)
-- 3. audit_logs deleted_at column for DSGVO compliance
-- 4. Update DSGVO purge to cascade soft-delete to audit_logs
-- 5. Storage path traversal SQL guard

-- ==========================================
-- 1. Restore TRAINER audit_logs SELECT policy
-- ==========================================

CREATE POLICY "trainer_view_team_audit_logs"
ON audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = audit_logs.registration_id
    AND r.team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

-- ==========================================
-- 2. Restore ANTRAGSTELLER rpa_traces SELECT policy
-- ==========================================

CREATE POLICY "antragsteller_view_own_rpa_traces"
ON rpa_traces FOR SELECT TO authenticated
USING (
  registration_id IN (
    SELECT id FROM registrations WHERE created_by_user_id = auth.uid()
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
);

-- ==========================================
-- 3. audit_logs: Add deleted_at for DSGVO compliance
-- ==========================================

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_deleted_at
  ON audit_logs (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Update PASSWART/SUPER_ADMIN audit_logs policy to filter soft-deleted
DROP POLICY IF EXISTS "passwart_admin_view_audit_logs" ON audit_logs;
CREATE POLICY "passwart_admin_view_audit_logs"
ON audit_logs FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- Also update the TRAINER policy to filter soft-deleted
DROP POLICY IF EXISTS "trainer_view_team_audit_logs" ON audit_logs;
CREATE POLICY "trainer_view_team_audit_logs"
ON audit_logs FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.id = audit_logs.registration_id
    AND r.team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

-- ==========================================
-- 4. DSGVO: Cascade soft-delete to audit_logs
-- ==========================================

CREATE OR REPLACE FUNCTION cascade_soft_delete_audit_logs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a registration is soft-deleted, also soft-delete its audit logs
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    UPDATE audit_logs
    SET deleted_at = NEW.deleted_at
    WHERE registration_id = NEW.id
    AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_cascade_soft_delete_audit ON registrations;
CREATE TRIGGER trigger_cascade_soft_delete_audit
  AFTER UPDATE OF deleted_at ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION cascade_soft_delete_audit_logs();

-- ==========================================
-- 5. Composite index for rpa_traces queries
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_rpa_traces_status_started
  ON rpa_traces (status, started_at DESC);

-- ==========================================
-- 6. Storage path traversal SQL guard
-- ==========================================

-- Drop existing upload policies and recreate with path validation
DROP POLICY IF EXISTS "authenticated_upload_photos" ON storage.objects;
CREATE POLICY "authenticated_upload_photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'player-photos'
  AND name NOT LIKE '%..%'
  AND name NOT LIKE '/%'
);

DROP POLICY IF EXISTS "authenticated_upload_documents" ON storage.objects;
CREATE POLICY "authenticated_upload_documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND name NOT LIKE '%..%'
  AND name NOT LIKE '/%'
);
