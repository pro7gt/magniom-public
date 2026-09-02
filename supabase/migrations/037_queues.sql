-- 037_queues.sql
-- PGMQ Durable Queue Setup and Messaging Wrappers
-- Conforms to Sections 89, 90, 91, 92, 93, 94, 95 of MAGNIOM-Supabase Database & Security Specification v1.0

-- Create internal queue storage fallback table if PGMQ extension is not enabled in environment
CREATE TABLE IF NOT EXISTS workflow.queue_messages (
  msg_id BIGSERIAL PRIMARY KEY,
  queue_name TEXT NOT NULL,
  message_payload JSONB NOT NULL,
  vt TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  read_count INTEGER NOT NULL DEFAULT 0,
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_queue_messages_read ON workflow.queue_messages(queue_name, vt)
  WHERE archived_at IS NULL;

-- Attempt to create PGMQ queues if extension is loaded
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgmq') THEN
    PERFORM pgmq.create('imaging_ingest');
    PERFORM pgmq.create('neurocompute');
    PERFORM pgmq.create('target_reliability');
    PERFORM pgmq.create('efield');
    PERFORM pgmq.create('target_generation');
    PERFORM pgmq.create('report_generation');
    PERFORM pgmq.create('outbox_dispatch');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- PGMQ not available or queue already exists, fallback handles messages
    NULL;
END $$;

-- Enqueue Queue Message RPC
CREATE OR REPLACE FUNCTION workflow.enqueue_queue_message(
  p_queue_name TEXT,
  p_envelope JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_msg_id BIGINT;
BEGIN
  -- If pgmq exists, try pgmq.send
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgmq') THEN
    BEGIN
      EXECUTE format('SELECT pgmq.send(%L, %L::jsonb)', p_queue_name, p_envelope) INTO v_msg_id;
      RETURN v_msg_id;
    EXCEPTION WHEN OTHERS THEN
      -- Fall through to internal table
      NULL;
    END;
  END IF;

  INSERT INTO workflow.queue_messages (queue_name, message_payload)
  VALUES (p_queue_name, p_envelope)
  RETURNING msg_id INTO v_msg_id;

  RETURN v_msg_id;
END;
$$;

-- Read Queue Messages with visibility timeout (non-destructive read)
CREATE OR REPLACE FUNCTION workflow.read_queue_messages(
  p_queue_name TEXT,
  p_vt INTEGER DEFAULT 300,
  p_qty INTEGER DEFAULT 1
)
RETURNS TABLE (
  msg_id BIGINT,
  read_count INTEGER,
  enqueued_at TIMESTAMPTZ,
  vt TIMESTAMPTZ,
  message JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_new_vt TIMESTAMPTZ := v_now + (COALESCE(p_vt, 300) || ' seconds')::interval;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgmq') THEN
    BEGIN
      RETURN QUERY
      EXECUTE format('SELECT msg_id, read_ct as read_count, enqueued_at, vt, message FROM pgmq.read(%L, %s, %s)',
        p_queue_name, COALESCE(p_vt, 300), COALESCE(p_qty, 1));
      RETURN;
    EXCEPTION WHEN OTHERS THEN
      -- Fall through to internal table
      NULL;
    END;
  END IF;

  RETURN QUERY
  WITH available AS (
    SELECT qm.msg_id
    FROM workflow.queue_messages qm
    WHERE qm.queue_name = p_queue_name
      AND qm.archived_at IS NULL
      AND qm.vt <= v_now
    ORDER BY qm.enqueued_at ASC
    LIMIT COALESCE(p_qty, 1)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE workflow.queue_messages qm
  SET
    vt = v_new_vt,
    read_count = qm.read_count + 1
  FROM available
  WHERE qm.msg_id = available.msg_id
  RETURNING
    qm.msg_id,
    qm.read_count,
    qm.enqueued_at,
    qm.vt,
    qm.message_payload AS message;
END;
$$;

-- Archive Queue Message (retaining audit dispatch history)
CREATE OR REPLACE FUNCTION workflow.archive_queue_message(
  p_queue_name TEXT,
  p_msg_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_archived BOOLEAN;
  v_updated INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgmq') THEN
    BEGIN
      EXECUTE format('SELECT pgmq.archive(%L, %s)', p_queue_name, p_msg_id) INTO v_archived;
      RETURN COALESCE(v_archived, true);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  UPDATE workflow.queue_messages
  SET archived_at = timezone('utc'::text, now())
  WHERE msg_id = p_msg_id
    AND queue_name = p_queue_name;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;
