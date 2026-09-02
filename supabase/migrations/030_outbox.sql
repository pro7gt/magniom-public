-- 030_outbox.sql
-- Transactional Outbox Pattern for Decoupled Asynchronous Side Effects
-- Conforms to Sections 87, 127 of MAGNIOM-Supabase Database & Security Specification v1.0
-- and MAGNIOM-Technical Architecture v1.0 Section 127

CREATE TABLE IF NOT EXISTS workflow.outbox (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID,
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  published_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON workflow.outbox(created_at)
  WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON workflow.outbox(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_org ON workflow.outbox(organisation_id);

-- Emit Outbox Event within domain transactions
CREATE OR REPLACE FUNCTION workflow.emit_outbox_event(
  p_org_id UUID,
  p_aggregate_type TEXT,
  p_aggregate_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO workflow.outbox (
    organisation_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  )
  VALUES (
    p_org_id,
    p_aggregate_type,
    p_aggregate_id,
    p_event_type,
    COALESCE(p_payload, '{}'::jsonb)
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- Fetch pending outbox events with row-level locking
CREATE OR REPLACE FUNCTION workflow.fetch_pending_outbox_events(
  p_batch_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  organisation_id UUID,
  aggregate_type TEXT,
  aggregate_id UUID,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ,
  attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.organisation_id,
    o.aggregate_type,
    o.aggregate_id,
    o.event_type,
    o.payload,
    o.created_at,
    o.attempts
  FROM workflow.outbox o
  WHERE o.published_at IS NULL
    AND o.attempts < 5
  ORDER BY o.created_at ASC
  LIMIT COALESCE(p_batch_size, 50)
  FOR UPDATE SKIP LOCKED;
END;
$$;

-- Mark outbox event as successfully dispatched
CREATE OR REPLACE FUNCTION workflow.mark_outbox_event_published(
  p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE workflow.outbox
  SET published_at = timezone('utc'::text, now())
  WHERE id = p_event_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- Increment dispatch attempt count for retry tracking
CREATE OR REPLACE FUNCTION workflow.increment_outbox_attempts(
  p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE workflow.outbox
  SET attempts = attempts + 1
  WHERE id = p_event_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
