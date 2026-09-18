-- 066_clinician_sessions.sql
-- Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session Integrity),
-- and MAGNIOM Revision 06 distributed session authority architecture.
-- Provides authoritative shared persistence for clinician session lifecycles,
-- terminal revocation tombstones, and cross-process token status validation.

CREATE TABLE IF NOT EXISTS identity.clinician_sessions (
  jti TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  organisation_id TEXT NOT NULL,
  issued_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at BIGINT,
  revocation_reason TEXT,
  auth_assurance_level TEXT NOT NULL DEFAULT 'AAL2'
    CHECK (auth_assurance_level IN ('AAL1', 'AAL2', 'AAL3')),
  last_activity_at BIGINT NOT NULL,
  key_version INT NOT NULL DEFAULT 1,
  revision INT NOT NULL DEFAULT 1,
  updated_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indices for rapid lookup and periodic cleanup
CREATE INDEX IF NOT EXISTS idx_clinician_sessions_lookup ON identity.clinician_sessions(jti, revoked, expires_at);
CREATE INDEX IF NOT EXISTS idx_clinician_sessions_user ON identity.clinician_sessions(user_id, username);
CREATE INDEX IF NOT EXISTS idx_clinician_sessions_expires ON identity.clinician_sessions(expires_at);

-- Row-Level Security (RLS) enforcement
ALTER TABLE identity.clinician_sessions ENABLE ROW LEVEL SECURITY;

-- Default-deny policies
CREATE POLICY clinician_sessions_select_policy
  ON identity.clinician_sessions
  FOR SELECT
  TO authenticated, service_role
  USING (true);

CREATE POLICY clinician_sessions_insert_policy
  ON identity.clinician_sessions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY clinician_sessions_update_policy
  ON identity.clinician_sessions
  FOR UPDATE
  TO service_role
  USING (true);

-- Immutability trigger: Once revoked = true, session cannot be resurrected or un-revoked (terminal tombstone)
CREATE OR REPLACE FUNCTION identity.prevent_unrevoking_session()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.revoked = true AND NEW.revoked = false THEN
    RAISE EXCEPTION 'Security Policy Violation: Revoked clinician session % cannot be resurrected (terminal tombstone).', OLD.jti;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_session_resurrection ON identity.clinician_sessions;
CREATE TRIGGER trg_prevent_session_resurrection
  BEFORE UPDATE ON identity.clinician_sessions
  FOR EACH ROW
  EXECUTE FUNCTION identity.prevent_unrevoking_session();
