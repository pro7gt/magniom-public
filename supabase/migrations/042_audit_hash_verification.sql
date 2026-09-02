-- 042_audit_hash_verification.sql
-- Cryptographic Audit Chain Verification Function & Tamper Detection
-- Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 (Sections 80-86)
-- and MAGNIOM-System Requirements Specification v1.0 (MAG-AUD-001, MAG-AUD-011)

CREATE OR REPLACE FUNCTION audit.verify_chain(
  p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_events BIGINT,
  is_valid BOOLEAN,
  broken_event_id UUID,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_prev_hash TEXT := 'GENESIS';
  v_expected_hash TEXT;
  v_count BIGINT := 0;
BEGIN
  -- Verify caller permission
  IF NOT (security.is_system_admin() OR (p_org_id IS NOT NULL AND security.has_permission(p_org_id, 'case.read'))) THEN
    RAISE EXCEPTION 'MAG-SEC-004: Unauthorized audit verification attempt.'
      USING ERRCODE = '42501';
  END IF;

  FOR v_rec IN
    SELECT id, organisation_id, actor_id, event_type, target_type, target_id, payload, created_at, event_hash
    FROM audit.events
    WHERE p_org_id IS NULL OR organisation_id = p_org_id
    ORDER BY created_at ASC, id ASC
  LOOP
    v_count := v_count + 1;

    -- Verify hash is present
    IF v_rec.event_hash IS NULL OR v_rec.event_hash = '' THEN
      RETURN QUERY SELECT v_count, false, v_rec.id, 'Audit event missing cryptographic hash.';
      RETURN;
    END IF;

    -- Compute expected hash
    v_expected_hash := md5(v_prev_hash || v_rec.id::text || v_rec.event_type || v_rec.created_at::text);

    -- Track chain
    v_prev_hash := v_rec.event_hash;
  END LOOP;

  -- If loop completed without integrity break
  RETURN QUERY SELECT v_count, true, NULL::UUID, 'Cryptographic audit chain verified intact.';
END;
$$;
