-- ===== CFB PASS-AUTOMATION: SYSTEM HEALTH TABLE =====
-- Migration: 000005_system_health
-- Description: Table for storing system health status (Heartbeat Monitor)
-- Author: CFB Development Team
-- Date: 2026-03-08

-- ===== SYSTEM_HEALTH TABLE =====
-- Stores the latest health status for each monitored service

CREATE TABLE IF NOT EXISTS system_health (
  service_name TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('GREEN', 'YELLOW', 'RED')),
  message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON system_health(checked_at DESC);

-- Enable RLS
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Only PASSWART and SUPER_ADMIN can view system health
CREATE POLICY "admin_view_health"
ON system_health
FOR SELECT
TO authenticated
USING (get_user_role(auth.uid()) IN ('PASSWART', 'SUPER_ADMIN'));

-- Service role can upsert (for n8n workflows)
CREATE POLICY "service_upsert_health"
ON system_health
FOR ALL
TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Trigger for updated_at
CREATE TRIGGER update_system_health_updated_at
BEFORE UPDATE ON system_health
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE system_health IS 'System health status for monitoring (Heartbeat)';
COMMENT ON COLUMN system_health.service_name IS 'Service identifier (e.g., dfbnet, supabase, bot)';
COMMENT ON COLUMN system_health.status IS 'Traffic light status: GREEN (healthy), YELLOW (degraded), RED (unhealthy)';
COMMENT ON COLUMN system_health.details IS 'Additional details like response time, error messages';

-- Insert initial row for DFBnet
INSERT INTO system_health (service_name, status, message, details)
VALUES ('dfbnet', 'YELLOW', 'Not yet checked', '{"initial": true}')
ON CONFLICT (service_name) DO NOTHING;
