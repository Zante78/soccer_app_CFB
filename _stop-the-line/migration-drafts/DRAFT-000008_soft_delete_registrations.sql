-- Migration 000009: Add soft-delete to registrations (DSGVO compliance)
-- Physical deletes destroy audit trail. Soft-delete allows 48h DSGVO purge
-- while keeping audit_logs FK references intact.

-- ==========================================
-- 1. Add deleted_at column
-- ==========================================

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Index for filtering out soft-deleted records
CREATE INDEX IF NOT EXISTS idx_registrations_deleted_at
  ON registrations (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ==========================================
-- 2. Update RLS SELECT policies to exclude soft-deleted records
-- ==========================================

-- Drop and recreate SELECT policies with deleted_at IS NULL filter

DROP POLICY IF EXISTS "antragsteller_view_own_registrations" ON registrations;
CREATE POLICY "antragsteller_view_own_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND created_by_user_id = auth.uid()
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'ANTRAGSTELLER'
);

DROP POLICY IF EXISTS "trainer_view_team_registrations" ON registrations;
CREATE POLICY "trainer_view_team_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND team_id = (SELECT team_id FROM users WHERE id = auth.uid())
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'TRAINER'
);

DROP POLICY IF EXISTS "passwart_admin_view_all_registrations" ON registrations;
CREATE POLICY "passwart_admin_view_all_registrations"
ON registrations FOR SELECT TO authenticated
USING (
  deleted_at IS NULL
  AND (SELECT role FROM users WHERE id = auth.uid()) IN ('PASSWART', 'SUPER_ADMIN')
);

-- Note: admin_manage_registrations (FOR ALL) stays as-is for SUPER_ADMIN
-- SUPER_ADMIN can still see soft-deleted records through FOR ALL policy

-- ==========================================
-- 3. Update DSGVO purge function to use soft-delete
-- ==========================================

CREATE OR REPLACE FUNCTION soft_delete_expired_registrations(
  p_retention_hours INT DEFAULT 48
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count INT;
BEGIN
  UPDATE registrations
  SET deleted_at = NOW()
  WHERE status = 'COMPLETED'
    AND deleted_at IS NULL
    AND updated_at < NOW() - (p_retention_hours || ' hours')::INTERVAL;

  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$;
