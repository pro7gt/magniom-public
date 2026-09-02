-- 029_workflow_jobs.sql
-- Artifact Registry, Lineage, Workflow Jobs, and Progress Tracking
-- Conforms to Sections 30, 31, 88, 93, 108, 128, 129 of MAGNIOM-Supabase Database & Security Specification v1.0

-- ==========================================
-- 1. Artifact Registry & Lineage
-- ==========================================

CREATE TABLE IF NOT EXISTS imaging.artifacts (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  imaging_study_id UUID,
  artifact_type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  object_path TEXT NOT NULL,
  mime_type TEXT,
  sha256 TEXT NOT NULL,
  size_bytes BIGINT,
  immutable BOOLEAN NOT NULL DEFAULT true,
  processing_run_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (bucket, object_path),
  UNIQUE (sha256, artifact_type, case_id)
);

CREATE TABLE IF NOT EXISTS imaging.artifact_lineage (
  parent_artifact_id UUID NOT NULL
    REFERENCES imaging.artifacts(id) ON DELETE CASCADE,
  child_artifact_id UUID NOT NULL
    REFERENCES imaging.artifacts(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (parent_artifact_id, child_artifact_id)
);

CREATE INDEX IF NOT EXISTS idx_artifacts_case ON imaging.artifacts(case_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_org ON imaging.artifacts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON imaging.artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_artifacts_sha256 ON imaging.artifacts(sha256);

-- Immutability Guard Trigger for Artifacts
CREATE OR REPLACE FUNCTION imaging.guard_artifact_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_IMMUTABLE_ARTIFACT: Artifacts are immutable once registered';
  ELSIF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'CANNOT_DELETE_IMMUTABLE_ARTIFACT: Artifact retention requires formal administrative workflow';
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_artifact_mutation ON imaging.artifacts;
CREATE TRIGGER trg_guard_artifact_mutation
  BEFORE UPDATE OR DELETE ON imaging.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION imaging.guard_artifact_mutation();

-- ==========================================
-- 2. Workflow Jobs & Status Enum
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE workflow.job_status AS ENUM (
      'queued',
      'claimed',
      'running',
      'succeeded',
      'failed_retryable',
      'failed_terminal',
      'cancelled',
      'superseded'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS workflow.jobs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID
    REFERENCES clinical.cases(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL,
  status workflow.job_status NOT NULL DEFAULT 'queued',
  idempotency_key TEXT NOT NULL,
  input_reference JSONB NOT NULL,
  worker_id TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  claimed_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  error_code TEXT,
  error_detail JSONB,
  result_reference JSONB,
  UNIQUE (organisation_id, job_type, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_workflow_jobs_status_type ON workflow.jobs(status, job_type);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_case ON workflow.jobs(case_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_org ON workflow.jobs(organisation_id);
CREATE INDEX IF NOT EXISTS idx_workflow_jobs_heartbeat ON workflow.jobs(last_heartbeat_at)
  WHERE status IN ('claimed', 'running');

-- ==========================================
-- 3. Job Progress Tracking Table
-- ==========================================

CREATE TABLE IF NOT EXISTS workflow.job_progress (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id UUID NOT NULL
    REFERENCES workflow.jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  stage_description TEXT NOT NULL,
  progress_percent NUMERIC(5,2),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_job_progress_job ON workflow.job_progress(job_id, recorded_at);

-- ==========================================
-- 4. Atomic Workflow Stored Procedures & RPCs
-- ==========================================

-- Enqueue a Workflow Job (Idempotent)
CREATE OR REPLACE FUNCTION workflow.enqueue_job(
  p_org_id UUID,
  p_case_id UUID,
  p_job_type TEXT,
  p_idempotency_key TEXT,
  p_input_reference JSONB,
  p_max_attempts INTEGER DEFAULT 3
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job_id UUID;
  v_existing_job RECORD;
BEGIN
  -- Check for existing successful or active job with identical idempotency key
  SELECT id, status INTO v_existing_job
  FROM workflow.jobs
  WHERE organisation_id = p_org_id
    AND job_type = p_job_type
    AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    IF v_existing_job.status = 'succeeded' THEN
      RETURN v_existing_job.id;
    ELSIF v_existing_job.status IN ('queued', 'claimed', 'running') THEN
      RETURN v_existing_job.id;
    END IF;
  END IF;

  INSERT INTO workflow.jobs (
    organisation_id,
    case_id,
    job_type,
    status,
    idempotency_key,
    input_reference,
    max_attempts
  )
  VALUES (
    p_org_id,
    p_case_id,
    p_job_type,
    'queued',
    p_idempotency_key,
    p_input_reference,
    COALESCE(p_max_attempts, 3)
  )
  ON CONFLICT (organisation_id, job_type, idempotency_key)
  DO UPDATE SET
    status = 'queued',
    attempt_count = 0,
    error_code = NULL,
    error_detail = NULL,
    input_reference = EXCLUDED.input_reference
  RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

-- Claim a Workflow Job atomically with visibility lease
CREATE OR REPLACE FUNCTION workflow.claim_job(
  p_job_id UUID,
  p_worker_id TEXT,
  p_lease_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows_updated INTEGER;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_lease_cutoff TIMESTAMPTZ := v_now - (COALESCE(p_lease_seconds, 300) || ' seconds')::interval;
BEGIN
  UPDATE workflow.jobs
  SET
    status = 'running',
    worker_id = p_worker_id,
    attempt_count = attempt_count + 1,
    claimed_at = COALESCE(claimed_at, v_now),
    started_at = v_now,
    last_heartbeat_at = v_now,
    error_code = NULL,
    error_detail = NULL
  WHERE id = p_job_id
    AND (
      status = 'queued'
      OR (status IN ('claimed', 'running') AND last_heartbeat_at < v_lease_cutoff)
      OR (status = 'failed_retryable' AND attempt_count < max_attempts)
    );

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated > 0;
END;
$$;

-- Heartbeat to extend worker lease
CREATE OR REPLACE FUNCTION workflow.heartbeat_job(
  p_job_id UUID,
  p_worker_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows_updated INTEGER;
BEGIN
  UPDATE workflow.jobs
  SET last_heartbeat_at = timezone('utc'::text, now())
  WHERE id = p_job_id
    AND worker_id = p_worker_id
    AND status = 'running';

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated > 0;
END;
$$;

-- Record honest stage progress
CREATE OR REPLACE FUNCTION workflow.record_job_progress(
  p_job_id UUID,
  p_worker_id TEXT,
  p_stage TEXT,
  p_stage_description TEXT,
  p_progress_percent NUMERIC DEFAULT NULL,
  p_detail JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_progress_id UUID;
BEGIN
  -- Verify worker ownership and update heartbeat
  UPDATE workflow.jobs
  SET last_heartbeat_at = timezone('utc'::text, now())
  WHERE id = p_job_id
    AND worker_id = p_worker_id
    AND status = 'running';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WORKER_NOT_AUTHORIZED_OR_JOB_NOT_RUNNING';
  END IF;

  INSERT INTO workflow.job_progress (
    job_id,
    stage,
    stage_description,
    progress_percent,
    detail
  )
  VALUES (
    p_job_id,
    p_stage,
    p_stage_description,
    p_progress_percent,
    COALESCE(p_detail, '{}'::jsonb)
  )
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$;

-- Complete Job Successfully
CREATE OR REPLACE FUNCTION workflow.complete_job(
  p_job_id UUID,
  p_worker_id TEXT,
  p_result_reference JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rows_updated INTEGER;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  UPDATE workflow.jobs
  SET
    status = 'succeeded',
    completed_at = v_now,
    last_heartbeat_at = v_now,
    result_reference = COALESCE(p_result_reference, '{}'::jsonb)
  WHERE id = p_job_id
    AND worker_id = p_worker_id
    AND status = 'running';

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  RETURN v_rows_updated > 0;
END;
$$;

-- Fail Job (Retryable or Terminal)
CREATE OR REPLACE FUNCTION workflow.fail_job(
  p_job_id UUID,
  p_worker_id TEXT,
  p_error_code TEXT,
  p_error_detail JSONB DEFAULT '{}'::jsonb,
  p_retryable BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job RECORD;
  v_next_status workflow.job_status;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  SELECT * INTO v_job
  FROM workflow.jobs
  WHERE id = p_job_id
    AND worker_id = p_worker_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF p_retryable AND v_job.attempt_count < v_job.max_attempts THEN
    v_next_status := 'failed_retryable';
  ELSE
    v_next_status := 'failed_terminal';
  END IF;

  UPDATE workflow.jobs
  SET
    status = v_next_status,
    error_code = p_error_code,
    error_detail = COALESCE(p_error_detail, '{}'::jsonb),
    completed_at = CASE WHEN v_next_status = 'failed_terminal' THEN v_now ELSE NULL END,
    last_heartbeat_at = v_now
  WHERE id = p_job_id;

  RETURN true;
END;
$$;

-- Reap stale jobs whose lease expired
CREATE OR REPLACE FUNCTION workflow.reap_stale_jobs(
  p_lease_timeout_seconds INTEGER DEFAULT 600
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
  v_cutoff TIMESTAMPTZ := timezone('utc'::text, now()) - (COALESCE(p_lease_timeout_seconds, 600) || ' seconds')::interval;
BEGIN
  UPDATE workflow.jobs
  SET
    status = CASE
      WHEN attempt_count >= max_attempts THEN 'failed_terminal'::workflow.job_status
      ELSE 'failed_retryable'::workflow.job_status
    END,
    error_code = 'LEASE_EXPIRED_HEARTBEAT_TIMEOUT',
    error_detail = jsonb_build_object('reaped_at', timezone('utc'::text, now()), 'last_heartbeat', last_heartbeat_at)
  WHERE status IN ('claimed', 'running')
    AND last_heartbeat_at < v_cutoff;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
