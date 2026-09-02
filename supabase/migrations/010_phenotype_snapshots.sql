-- 010_phenotype_snapshots.sql
-- Immutable phenotype snapshots, audit logging, state transition RPC, and RLS foundation
-- Conforms to Sections 26, 27, 60, 61, 64-67, 75, 80-84 of MAGNIOM-Supabase Database & Security Specification v1.0

-- 1. Create clinical.phenotype_snapshots
CREATE TABLE IF NOT EXISTS clinical.phenotype_snapshots (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  state clinical.snapshot_state NOT NULL DEFAULT 'approved',
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  ontology_version TEXT NOT NULL DEFAULT '1.0.0',
  evidence_library_version TEXT NOT NULL DEFAULT '1.0.0',
  payload JSONB NOT NULL,
  payload_sha256 BYTEA NOT NULL,
  approved_by_clinician_id UUID NOT NULL
    REFERENCES identity.clinicians(id) ON DELETE RESTRICT,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  supersedes_id UUID
    REFERENCES clinical.phenotype_snapshots(id) ON DELETE SET NULL,
  created_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (case_id, version)
);

-- Foreign key linking cases to their current snapshot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cases_current_phenotype'
  ) THEN
    ALTER TABLE clinical.cases
      ADD CONSTRAINT fk_cases_current_phenotype
      FOREIGN KEY (current_phenotype_snapshot_id)
      REFERENCES clinical.phenotype_snapshots(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_phenotype_snapshots_case ON clinical.phenotype_snapshots(case_id);
CREATE INDEX IF NOT EXISTS idx_phenotype_snapshots_org ON clinical.phenotype_snapshots(organisation_id);

-- 2. Audit Trail Infrastructure
CREATE TABLE IF NOT EXISTS audit.events (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID
    REFERENCES clinical.cases(id) ON DELETE SET NULL,
  actor_type TEXT NOT NULL DEFAULT 'user',
  actor_user_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_clinician_id UUID
    REFERENCES identity.clinicians(id) ON DELETE SET NULL,
  actor_service TEXT,
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_sequence BIGINT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  request_id UUID,
  correlation_id UUID,
  payload JSONB NOT NULL,
  previous_hash BYTEA,
  event_hash BYTEA NOT NULL,
  UNIQUE (aggregate_type, aggregate_id, aggregate_sequence)
);

CREATE TABLE IF NOT EXISTS audit.aggregate_heads (
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  last_sequence BIGINT NOT NULL DEFAULT 0,
  last_hash BYTEA,
  PRIMARY KEY (aggregate_type, aggregate_id)
);

CREATE OR REPLACE FUNCTION audit.append_domain_event(
  p_organisation_id UUID,
  p_case_id UUID,
  p_actor_type TEXT,
  p_actor_user_id UUID,
  p_actor_clinician_id UUID,
  p_actor_service TEXT,
  p_event_type TEXT,
  p_aggregate_type TEXT,
  p_aggregate_id UUID,
  p_payload JSONB,
  p_request_id UUID DEFAULT NULL,
  p_correlation_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_head audit.aggregate_heads%ROWTYPE;
  v_next_sequence BIGINT;
  v_previous_hash BYTEA;
  v_event_hash BYTEA;
  v_event_id UUID;
BEGIN
  -- Lock aggregate head
  SELECT *
  INTO v_head
  FROM audit.aggregate_heads
  WHERE aggregate_type = p_aggregate_type
    AND aggregate_id = p_aggregate_id
  FOR UPDATE;

  IF NOT FOUND THEN
    v_next_sequence := 1;
    v_previous_hash := NULL;
  ELSE
    v_next_sequence := v_head.last_sequence + 1;
    v_previous_hash := v_head.last_hash;
  END IF;

  -- Compute cryptographic event hash
  v_event_hash := extensions.digest(
    COALESCE(v_previous_hash, ''::bytea) ||
    p_aggregate_type::bytea ||
    p_aggregate_id::text::bytea ||
    v_next_sequence::text::bytea ||
    p_event_type::bytea ||
    p_payload::text::bytea,
    'sha256'
  );

  INSERT INTO audit.events (
    organisation_id,
    case_id,
    actor_type,
    actor_user_id,
    actor_clinician_id,
    actor_service,
    event_type,
    aggregate_type,
    aggregate_id,
    aggregate_sequence,
    request_id,
    correlation_id,
    payload,
    previous_hash,
    event_hash
  )
  VALUES (
    p_organisation_id,
    p_case_id,
    p_actor_type,
    p_actor_user_id,
    p_actor_clinician_id,
    p_actor_service,
    p_event_type,
    p_aggregate_type,
    p_aggregate_id,
    v_next_sequence,
    p_request_id,
    p_correlation_id,
    p_payload,
    v_previous_hash,
    v_event_hash
  )
  RETURNING id INTO v_event_id;

  -- Update aggregate head
  INSERT INTO audit.aggregate_heads (
    aggregate_type,
    aggregate_id,
    last_sequence,
    last_hash
  )
  VALUES (
    p_aggregate_type,
    p_aggregate_id,
    v_next_sequence,
    v_event_hash
  )
  ON CONFLICT (aggregate_type, aggregate_id)
  DO UPDATE SET
    last_sequence = EXCLUDED.last_sequence,
    last_hash = EXCLUDED.last_hash;

  RETURN v_event_id;
END;
$$;

-- 3. Immutability Triggers
DROP TRIGGER IF EXISTS trg_phenotype_snapshots_immutable ON clinical.phenotype_snapshots;
CREATE TRIGGER trg_phenotype_snapshots_immutable
BEFORE UPDATE OR DELETE ON clinical.phenotype_snapshots
FOR EACH ROW EXECUTE FUNCTION security.reject_mutation();

DROP TRIGGER IF EXISTS trg_audit_events_immutable ON audit.events;
CREATE TRIGGER trg_audit_events_immutable
BEFORE UPDATE OR DELETE ON audit.events
FOR EACH ROW EXECUTE FUNCTION security.reject_mutation();

-- 4. State Transition RPC: api.approve_phenotype
CREATE OR REPLACE FUNCTION api.approve_phenotype(
  p_case_id UUID,
  p_expected_case_version INTEGER,
  p_schema_version TEXT,
  p_ontology_version TEXT,
  p_evidence_library_version TEXT,
  p_payload JSONB,
  p_payload_sha256 BYTEA
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_case clinical.cases%ROWTYPE;
  v_clinician_id UUID;
  v_snapshot_id UUID;
  v_next_version INTEGER;
BEGIN
  -- Lock case row for optimistic concurrency verification
  SELECT *
  INTO v_case
  FROM clinical.cases
  WHERE id = p_case_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CASE_NOT_FOUND';
  END IF;

  IF v_case.version <> p_expected_case_version THEN
    RAISE EXCEPTION 'STALE_CASE_VERSION';
  END IF;

  -- Verify caller permission
  IF NOT security.has_permission(v_case.organisation_id, 'phenotype.approve') THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Retrieve active clinician identity
  SELECT id
  INTO v_clinician_id
  FROM identity.clinicians
  WHERE (user_id = auth.uid() OR auth.uid() IS NULL)
    AND organisation_id = v_case.organisation_id
    AND active = true
  LIMIT 1;

  IF v_clinician_id IS NULL THEN
    RAISE EXCEPTION 'CLINICIAN_REQUIRED';
  END IF;

  -- Determine next snapshot version
  SELECT COALESCE(MAX(version), 0) + 1
  INTO v_next_version
  FROM clinical.phenotype_snapshots
  WHERE case_id = p_case_id;

  -- Insert immutable snapshot
  INSERT INTO clinical.phenotype_snapshots (
    organisation_id,
    case_id,
    version,
    state,
    schema_version,
    ontology_version,
    evidence_library_version,
    payload,
    payload_sha256,
    approved_by_clinician_id,
    approved_at,
    created_by
  )
  VALUES (
    v_case.organisation_id,
    p_case_id,
    v_next_version,
    'approved',
    p_schema_version,
    p_ontology_version,
    p_evidence_library_version,
    p_payload,
    p_payload_sha256,
    v_clinician_id,
    timezone('utc'::text, now()),
    auth.uid()
  )
  RETURNING id INTO v_snapshot_id;

  -- Advance case state and optimistic version
  UPDATE clinical.cases
  SET
    state = 'phenotype_ready',
    version = version + 1,
    current_phenotype_snapshot_id = v_snapshot_id,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_case_id;

  -- Append audit domain event
  PERFORM audit.append_domain_event(
    v_case.organisation_id,
    p_case_id,
    'clinician',
    auth.uid(),
    v_clinician_id,
    NULL,
    'phenotype.approved',
    'case',
    p_case_id,
    jsonb_build_object(
      'snapshot_id', v_snapshot_id,
      'version', v_next_version,
      'payload_sha256', encode(p_payload_sha256, 'hex')
    )
  );

  RETURN v_snapshot_id;
END;
$$;

-- 5. Row Level Security Foundation
ALTER TABLE identity.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.clinicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.memberships ENABLE ROW LEVEL SECURITY;

ALTER TABLE clinical.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.functional_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.phenotype_snapshots ENABLE ROW LEVEL SECURITY;

ALTER TABLE audit.events ENABLE ROW LEVEL SECURITY;

-- Identity Policies
DROP POLICY IF EXISTS p_organisations_read ON identity.organisations;
CREATE POLICY p_organisations_read ON identity.organisations
FOR SELECT TO authenticated
USING (
  id IN (SELECT security.current_user_org_ids())
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_sites_read ON identity.sites;
CREATE POLICY p_sites_read ON identity.sites
FOR SELECT TO authenticated
USING (
  organisation_id IN (SELECT security.current_user_org_ids())
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_user_profiles_read ON identity.user_profiles;
CREATE POLICY p_user_profiles_read ON identity.user_profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_clinicians_read ON identity.clinicians;
CREATE POLICY p_clinicians_read ON identity.clinicians
FOR SELECT TO authenticated
USING (
  organisation_id IN (SELECT security.current_user_org_ids())
  OR security.is_system_admin()
);

DROP POLICY IF EXISTS p_memberships_read ON identity.memberships;
CREATE POLICY p_memberships_read ON identity.memberships
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR organisation_id IN (SELECT security.current_user_org_ids())
  OR security.is_system_admin()
);

-- Clinical Policies
DROP POLICY IF EXISTS p_patients_read ON clinical.patients;
CREATE POLICY p_patients_read ON clinical.patients
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
  AND (site_id IS NULL OR security.can_access_site(organisation_id, site_id))
);

DROP POLICY IF EXISTS p_patients_insert ON clinical.patients;
CREATE POLICY p_patients_insert ON clinical.patients
FOR INSERT TO authenticated
WITH CHECK (
  security.has_permission(organisation_id, 'case.create')
);

DROP POLICY IF EXISTS p_cases_read ON clinical.cases;
CREATE POLICY p_cases_read ON clinical.cases
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
  AND (site_id IS NULL OR security.can_access_site(organisation_id, site_id))
);

DROP POLICY IF EXISTS p_cases_insert ON clinical.cases;
CREATE POLICY p_cases_insert ON clinical.cases
FOR INSERT TO authenticated
WITH CHECK (
  security.has_permission(organisation_id, 'case.create')
);

DROP POLICY IF EXISTS p_cases_update ON clinical.cases;
CREATE POLICY p_cases_update ON clinical.cases
FOR UPDATE TO authenticated
USING (
  security.has_permission(organisation_id, 'case.update')
);

DROP POLICY IF EXISTS p_assessments_read ON clinical.assessments;
CREATE POLICY p_assessments_read ON clinical.assessments
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
);

DROP POLICY IF EXISTS p_assessments_mutate ON clinical.assessments;
CREATE POLICY p_assessments_mutate ON clinical.assessments
FOR ALL TO authenticated
USING (
  security.has_permission(organisation_id, 'phenotype.edit')
);

DROP POLICY IF EXISTS p_observations_read ON clinical.observations;
CREATE POLICY p_observations_read ON clinical.observations
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
);

DROP POLICY IF EXISTS p_observations_mutate ON clinical.observations;
CREATE POLICY p_observations_mutate ON clinical.observations
FOR ALL TO authenticated
USING (
  security.has_permission(organisation_id, 'phenotype.edit')
);

DROP POLICY IF EXISTS p_functional_goals_read ON clinical.functional_goals;
CREATE POLICY p_functional_goals_read ON clinical.functional_goals
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
);

DROP POLICY IF EXISTS p_functional_goals_mutate ON clinical.functional_goals;
CREATE POLICY p_functional_goals_mutate ON clinical.functional_goals
FOR ALL TO authenticated
USING (
  security.has_permission(organisation_id, 'phenotype.edit')
);

DROP POLICY IF EXISTS p_phenotype_snapshots_read ON clinical.phenotype_snapshots;
CREATE POLICY p_phenotype_snapshots_read ON clinical.phenotype_snapshots
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
);

DROP POLICY IF EXISTS p_audit_events_read ON audit.events;
CREATE POLICY p_audit_events_read ON audit.events
FOR SELECT TO authenticated
USING (
  security.has_permission(organisation_id, 'case.read')
  OR security.is_system_admin()
);
