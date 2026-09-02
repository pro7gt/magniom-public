-- 041_worker_roles_and_permissions.sql
-- Scoped Worker Roles, Machine-to-Machine Permissions, and Ephemeral Storage Token Procedures
-- Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 (Sections 88-96, 107, 128, 129)
-- and MAGNIOM-System Requirements Specification v1.0 (MAG-SEC-010, MAG-SEC-011, MAG-SEC-029)

-- ============================================================================
-- 1. Scoped Worker Role Privileges & RPCs
-- ============================================================================

-- Worker-specific state transition RPC: Claim next job
CREATE OR REPLACE FUNCTION workflow.claim_next_job(
  p_worker_id TEXT,
  p_queue_name TEXT
)
RETURNS TABLE (
  job_id UUID,
  case_id UUID,
  organisation_id UUID,
  job_type TEXT,
  payload JSONB,
  correlation_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  -- Verify caller has service worker role or system admin
  IF NOT (security.is_service_worker() OR security.is_system_admin()) THEN
    RAISE EXCEPTION 'MAG-SEC-010: Unauthorized worker invocation.'
      USING ERRCODE = '42501';
  END IF;

  -- Lock and dequeue next pending job
  SELECT id INTO v_job_id
  FROM workflow.jobs
  WHERE status = 'queued'
    AND (p_queue_name IS NULL OR queue_name = p_queue_name)
  ORDER BY priority DESC, created_at ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF v_job_id IS NOT NULL THEN
    UPDATE workflow.jobs
    SET status = 'claimed',
        claimed_at = now(),
        claimed_by = p_worker_id,
        updated_at = now()
    WHERE id = v_job_id;

    RETURN QUERY
    SELECT j.id, j.case_id, j.organisation_id, j.job_type, j.payload, j.correlation_id
    FROM workflow.jobs j
    WHERE j.id = v_job_id;
  END IF;
END;
$$;

-- Worker-specific state transition RPC: Update job status
CREATE OR REPLACE FUNCTION workflow.complete_job(
  p_job_id UUID,
  p_worker_id TEXT,
  p_status TEXT, -- 'succeeded' or 'failed_terminal'
  p_result JSONB DEFAULT '{}'::jsonb,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (security.is_service_worker() OR security.is_system_admin()) THEN
    RAISE EXCEPTION 'MAG-SEC-010: Unauthorized worker invocation.'
      USING ERRCODE = '42501';
  END IF;

  UPDATE workflow.jobs
  SET status = p_status::workflow.job_status,
      result = p_result,
      error_message = p_error_message,
      completed_at = now(),
      updated_at = now()
  WHERE id = p_job_id
    AND claimed_by = p_worker_id;

  -- Record audit event for completed worker operation (MAG-SEC-011)
  INSERT INTO audit.events (
    organisation_id,
    actor_id,
    event_type,
    target_type,
    target_id,
    payload,
    event_hash
  )
  SELECT
    j.organisation_id,
    auth.uid(),
    'WORKER_JOB_COMPLETED',
    'workflow_job',
    p_job_id,
    jsonb_build_object(
      'worker_id', p_worker_id,
      'status', p_status,
      'has_error', p_error_message IS NOT NULL,
      'correlation_id', j.correlation_id
    ),
    md5(now()::text || p_job_id::text)
  FROM workflow.jobs j
  WHERE j.id = p_job_id;

  RETURN true;
END;
$$;

-- Worker Storage Bounded URL Token Helper (Section 106 & 107)
CREATE OR REPLACE FUNCTION security.generate_worker_storage_token(
  p_org_id UUID,
  p_case_id UUID,
  p_bucket_name TEXT,
  p_ttl_seconds INTEGER DEFAULT 900 -- 15 minutes max
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_bounded_prefix TEXT;
  v_token_payload JSONB;
BEGIN
  IF NOT (security.is_service_worker() OR security.is_system_admin()) THEN
    RAISE EXCEPTION 'MAG-SEC-010: Worker storage token requires service_worker role.'
      USING ERRCODE = '42501';
  END IF;

  -- Cap TTL to 3600 seconds (1 hour)
  IF p_ttl_seconds > 3600 THEN
    p_ttl_seconds := 3600;
  END IF;

  v_bounded_prefix := format('org/%s/case/%s/', p_org_id, p_case_id);

  v_token_payload := jsonb_build_object(
    'bucket', p_bucket_name,
    'allowed_prefix', v_bounded_prefix,
    'expires_at', (now() + (p_ttl_seconds || ' seconds')::interval),
    'issued_to', auth.uid()
  );

  RETURN v_token_payload;
END;
$$;

-- Revoke dangerous table grants from service_worker
REVOKE ALL ON identity.user_profiles FROM service_worker;
REVOKE ALL ON clinical.patients FROM service_worker;
