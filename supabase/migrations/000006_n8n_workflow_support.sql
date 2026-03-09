-- ===== CFB PASS-AUTOMATION: N8N WORKFLOW SUPPORT =====
-- Migration: 000006_n8n_workflow_support
-- Description: Bot execution lock, DSGVO purge RPC, alert cooldown tracking
-- Author: CFB Development Team (Opus 4.6 Audit)
-- Date: 2026-03-08

-- ===== BOT EXECUTION LOCK TABLE =====
-- Database-level singleton lock for bot execution (cloud-safe)
-- Replaces in-memory n8n static data lock

CREATE TABLE IF NOT EXISTS bot_execution_lock (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton: nur 1 Row erlaubt
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by TEXT DEFAULT 'n8n', -- Identifier des Lock-Holders
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert the singleton row
INSERT INTO bot_execution_lock (id, registration_id, locked_at, locked_by, expires_at)
VALUES (1, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- RLS: nur service_role darf Lock aendern (n8n nutzt Service Key)
ALTER TABLE bot_execution_lock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_manage_lock"
ON bot_execution_lock
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- PASSWART/ADMIN koennen Lock-Status sehen (Dashboard Ampel)
CREATE POLICY "admin_view_lock"
ON bot_execution_lock
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

COMMENT ON TABLE bot_execution_lock IS 'Singleton lock to prevent parallel bot executions (DFBnet limit)';

-- ===== RPC: ACQUIRE BOT LOCK =====
-- Atomare Lock-Akquise mit Expiry-Check
-- Gibt true zurueck wenn Lock erworben, false wenn bereits gelockt

CREATE OR REPLACE FUNCTION acquire_bot_lock(
  p_registration_id UUID,
  p_locked_by TEXT DEFAULT 'n8n',
  p_timeout_minutes INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows INTEGER;
BEGIN
  -- Versuche Lock zu erwerben: nur wenn nicht gelockt oder expired
  UPDATE bot_execution_lock
  SET
    registration_id = p_registration_id,
    locked_at = NOW(),
    locked_by = p_locked_by,
    expires_at = NOW() + (p_timeout_minutes || ' minutes')::INTERVAL
  WHERE id = 1
    AND (
      locked_at IS NULL                    -- Nicht gelockt
      OR expires_at < NOW()                -- Lock expired
      OR registration_id IS NULL           -- Lock released
    );

  -- Pruefe ob Update erfolgreich war (1 row affected)
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  RETURN v_rows > 0;
END;
$$;

COMMENT ON FUNCTION acquire_bot_lock IS 'Atomically acquire bot execution lock. Returns true if acquired, false if already locked.';

-- ===== RPC: RELEASE BOT LOCK =====
-- Gibt Lock frei (nur fuer die richtige registration_id)

CREATE OR REPLACE FUNCTION release_bot_lock(
  p_registration_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows INTEGER;
BEGIN
  UPDATE bot_execution_lock
  SET
    registration_id = NULL,
    locked_at = NULL,
    locked_by = NULL,
    expires_at = NULL
  WHERE id = 1
    AND (
      p_registration_id IS NULL              -- Force release (kein Check)
      OR registration_id = p_registration_id -- Nur eigenen Lock freigeben
    );

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  RETURN v_rows > 0;
END;
$$;

COMMENT ON FUNCTION release_bot_lock IS 'Release bot execution lock. Optionally validates registration_id.';

-- ===== RPC: GET EXPIRED RECORDS FOR DSGVO PURGE =====
-- Findet alle Registrierungen mit abgelaufener Aufbewahrungsfrist

CREATE OR REPLACE FUNCTION get_expired_records(
  p_retention_hours INTEGER DEFAULT 48
)
RETURNS TABLE (
  registration_id UUID,
  photo_path TEXT,
  document_paths TEXT[],
  player_name TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS registration_id,
    r.photo_path,
    r.document_paths,
    r.player_name,
    r.updated_at AS completed_at
  FROM registrations r
  WHERE r.status = 'COMPLETED'
    AND r.updated_at < NOW() - (p_retention_hours || ' hours')::INTERVAL
    AND (
      r.photo_path IS NOT NULL
      OR array_length(r.document_paths, 1) > 0
    );
END;
$$;

COMMENT ON FUNCTION get_expired_records IS 'Find registrations with expired DSGVO retention period (photos + documents)';

-- ===== ALERT COOLDOWN: consecutive_failures Spalte =====
-- Fuer Heartbeat: Alert erst nach 2 aufeinanderfolgenden Fehlern

ALTER TABLE system_health
ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0;

ALTER TABLE system_health
ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN system_health.consecutive_failures IS 'Counter for consecutive check failures (reset on GREEN)';
COMMENT ON COLUMN system_health.last_alert_sent_at IS 'Timestamp of last alert email (for cooldown)';

-- ===== RPC: UPSERT SYSTEM HEALTH =====
-- Sauberer Upsert statt PostgREST Prefer Header

CREATE OR REPLACE FUNCTION upsert_system_health(
  p_service_name TEXT,
  p_status TEXT,
  p_message TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_check_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  consecutive_failures INTEGER,
  should_alert BOOLEAN,
  last_alert_sent_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consecutive INTEGER;
  v_should_alert BOOLEAN;
  v_last_alert TIMESTAMP WITH TIME ZONE;
  v_alert_cooldown INTERVAL := '1 hour';
BEGIN
  INSERT INTO system_health (service_name, status, message, details, checked_at, check_id, consecutive_failures)
  VALUES (p_service_name, p_status, p_message, p_details, NOW(), p_check_id, CASE WHEN p_status != 'GREEN' THEN 1 ELSE 0 END)
  ON CONFLICT (service_name) DO UPDATE SET
    status = EXCLUDED.status,
    message = EXCLUDED.message,
    details = EXCLUDED.details,
    checked_at = NOW(),
    check_id = EXCLUDED.check_id,
    consecutive_failures = CASE
      WHEN EXCLUDED.status = 'GREEN' THEN 0
      ELSE system_health.consecutive_failures + 1
    END,
    updated_at = NOW()
  RETURNING
    system_health.consecutive_failures,
    -- Alert wenn: >= 2 Failures UND letzter Alert > 1h her (oder nie gesendet)
    (system_health.consecutive_failures >= 2
     AND (system_health.last_alert_sent_at IS NULL
          OR system_health.last_alert_sent_at < NOW() - v_alert_cooldown)),
    system_health.last_alert_sent_at
  INTO v_consecutive, v_should_alert, v_last_alert;

  RETURN QUERY SELECT v_consecutive, v_should_alert, v_last_alert;
END;
$$;

COMMENT ON FUNCTION upsert_system_health IS 'Upsert health check with alert cooldown logic (2 consecutive failures, 1h cooldown)';

-- ===== RPC: MARK ALERT SENT =====

CREATE OR REPLACE FUNCTION mark_health_alert_sent(
  p_service_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE system_health
  SET last_alert_sent_at = NOW()
  WHERE service_name = p_service_name;
END;
$$;
