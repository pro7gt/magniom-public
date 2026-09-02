-- 026_clinician_decisions.sql
-- Clinician Decision, Candidate Decisions, Final Targets, Immutable Sign-Off, and Stale Protection
-- Conforms to Sections 57, 58, 59, 63, 67, 69, 77, 78 of MAGNIOM-Supabase Database & Security Specification v1.0

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'decision_status') THEN
    CREATE TYPE targeting.decision_status AS ENUM (
      'in_review',
      'completed',
      'deferred',
      'superseded'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_decision_action') THEN
    CREATE TYPE targeting.candidate_decision_action AS ENUM (
      'accept',
      'reject',
      'modify',
      'replace',
      'defer'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'magniom_influence') THEN
    CREATE TYPE targeting.magniom_influence AS ENUM (
      'none',
      'minor',
      'moderate',
      'major'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS targeting.clinician_decisions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  target_slate_id UUID NOT NULL
    REFERENCES targeting.target_slates(id) ON DELETE RESTRICT,
  clinician_id UUID NOT NULL
    REFERENCES identity.clinicians(id) ON DELETE RESTRICT,
  status targeting.decision_status NOT NULL DEFAULT 'in_review',
  decision_type targeting.decision_type NOT NULL DEFAULT 'ACCEPTED_PRIMARY',
  overall_reasoning TEXT,
  magniom_influence targeting.magniom_influence,
  disagreement_with_magniom TEXT,
  reviewed_counterfactuals BOOLEAN NOT NULL DEFAULT false,
  reviewed_conflicting_evidence BOOLEAN NOT NULL DEFAULT false,
  attestation_statement TEXT,
  attestation_version TEXT DEFAULT '1.0.0',
  attestation_accepted BOOLEAN NOT NULL DEFAULT false,
  digital_signature_hash TEXT,
  payload_sha256 BYTEA,
  canonical_payload JSONB,
  signed_at TIMESTAMPTZ,
  supersedes_id UUID
    REFERENCES targeting.clinician_decisions(id) ON DELETE SET NULL,
  created_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS targeting.candidate_decisions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  clinician_decision_id UUID NOT NULL
    REFERENCES targeting.clinician_decisions(id) ON DELETE CASCADE,
  target_candidate_id UUID NOT NULL
    REFERENCES targeting.target_candidates(id) ON DELETE RESTRICT,
  action targeting.candidate_decision_action NOT NULL,
  reason_codes TEXT[] NOT NULL DEFAULT '{}',
  free_text_reason TEXT,
  modified_target JSONB,
  replacement_candidate_id UUID
    REFERENCES targeting.target_candidates(id) ON DELETE SET NULL,
  evidence_reviewed BOOLEAN NOT NULL DEFAULT false,
  reliability_reviewed BOOLEAN NOT NULL DEFAULT false,
  counterarguments_reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (clinician_decision_id, target_candidate_id)
);

CREATE TABLE IF NOT EXISTS targeting.final_targets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  clinician_decision_id UUID NOT NULL
    REFERENCES targeting.clinician_decisions(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL
    CHECK (source IN ('magniom_candidate', 'clinician_defined', 'standard_target')),
  source_candidate_id UUID
    REFERENCES targeting.target_candidates(id) ON DELETE SET NULL,
  target_region JSONB NOT NULL,
  therapeutic_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Link case to current decision pointer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'clinical'
      AND table_name = 'cases'
      AND column_name = 'current_clinician_decision_id'
  ) THEN
    ALTER TABLE clinical.cases ADD COLUMN current_clinician_decision_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cases_current_clinician_decision'
  ) THEN
    ALTER TABLE clinical.cases
      ADD CONSTRAINT fk_cases_current_clinician_decision
      FOREIGN KEY (current_clinician_decision_id)
      REFERENCES targeting.clinician_decisions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clinician_decisions_case ON targeting.clinician_decisions(case_id);
CREATE INDEX IF NOT EXISTS idx_clinician_decisions_org ON targeting.clinician_decisions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_clinician_decisions_slate ON targeting.clinician_decisions(target_slate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_decisions_parent ON targeting.candidate_decisions(clinician_decision_id);
CREATE INDEX IF NOT EXISTS idx_final_targets_parent ON targeting.final_targets(clinician_decision_id);

-- Immutability Guard Trigger Functions
CREATE OR REPLACE FUNCTION targeting.guard_signed_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.status = 'completed' OR OLD.signed_at IS NOT NULL THEN
    -- Allow transition to superseded only
    IF TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status = 'superseded' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Signed clinician decision is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION targeting.guard_signed_decision_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_state targeting.decision_status;
  v_signed_at TIMESTAMPTZ;
BEGIN
  SELECT status, signed_at
  INTO v_state, v_signed_at
  FROM targeting.clinician_decisions
  WHERE id = COALESCE(NEW.clinician_decision_id, OLD.clinician_decision_id);

  IF v_state = 'completed' OR v_signed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Signed clinician decision items are immutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_clinician_decisions_immutable ON targeting.clinician_decisions;
CREATE TRIGGER trg_clinician_decisions_immutable
  BEFORE UPDATE OR DELETE ON targeting.clinician_decisions
  FOR EACH ROW EXECUTE FUNCTION targeting.guard_signed_decision();

DROP TRIGGER IF EXISTS trg_candidate_decisions_immutable ON targeting.candidate_decisions;
CREATE TRIGGER trg_candidate_decisions_immutable
  BEFORE UPDATE OR DELETE ON targeting.candidate_decisions
  FOR EACH ROW EXECUTE FUNCTION targeting.guard_signed_decision_item();

DROP TRIGGER IF EXISTS trg_final_targets_immutable ON targeting.final_targets;
CREATE TRIGGER trg_final_targets_immutable
  BEFORE UPDATE OR DELETE ON targeting.final_targets
  FOR EACH ROW EXECUTE FUNCTION targeting.guard_signed_decision_item();

-- Enable RLS
ALTER TABLE targeting.clinician_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.candidate_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.final_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinician_decisions_read_policy" ON targeting.clinician_decisions
  FOR SELECT TO authenticated
  USING (
    security.has_permission(organisation_id, 'case.read')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = clinician_decisions.organisation_id
        AND m.active = true
    )
  );

CREATE POLICY "candidate_decisions_read_policy" ON targeting.candidate_decisions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "final_targets_read_policy" ON targeting.final_targets
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "clinician_decisions_write_policy" ON targeting.clinician_decisions
  FOR ALL TO authenticated
  USING (
    security.has_permission(organisation_id, 'decision.create')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = clinician_decisions.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
    )
  )
  WITH CHECK (
    security.has_permission(organisation_id, 'decision.create')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = clinician_decisions.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
    )
  );

CREATE POLICY "candidate_decisions_write_policy" ON targeting.candidate_decisions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "final_targets_write_policy" ON targeting.final_targets
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- RPC Function 1: Begin Clinician Review
CREATE OR REPLACE FUNCTION api.begin_clinician_review(
  p_case_id UUID,
  p_target_slate_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_case clinical.cases%ROWTYPE;
  v_slate targeting.target_slates%ROWTYPE;
  v_clinician_id UUID;
  v_decision_id UUID;
BEGIN
  -- Lock case row
  SELECT * INTO v_case FROM clinical.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CASE_NOT_FOUND';
  END IF;

  SELECT * INTO v_slate FROM targeting.target_slates WHERE id = p_target_slate_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SLATE_NOT_FOUND';
  END IF;

  -- Verify slate matches case and is current
  IF v_case.current_target_slate_id IS DISTINCT FROM v_slate.id THEN
    RAISE EXCEPTION 'TARGET_SLATE_SUPERSEDED';
  END IF;

  IF v_case.current_phenotype_snapshot_id IS DISTINCT FROM v_slate.phenotype_snapshot_id THEN
    RAISE EXCEPTION 'STALE_PHENOTYPE_SNAPSHOT';
  END IF;

  -- Verify permissions
  IF NOT security.has_permission(v_case.organisation_id, 'target.review')
     AND NOT EXISTS (
       SELECT 1 FROM identity.memberships m
       WHERE m.user_id = auth.uid()
         AND m.organisation_id = v_case.organisation_id
         AND m.active = true
         AND m.role IN ('tms_specialist', 'clinical_reviewer', 'system_admin')
     ) THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Get active clinician
  SELECT id INTO v_clinician_id
  FROM identity.clinicians
  WHERE (user_id = auth.uid() OR auth.uid() IS NULL)
    AND organisation_id = v_case.organisation_id
    AND active = true
  LIMIT 1;

  IF v_clinician_id IS NULL THEN
    RAISE EXCEPTION 'ACTIVE_CLINICIAN_REQUIRED';
  END IF;

  -- Create draft decision
  INSERT INTO targeting.clinician_decisions (
    organisation_id,
    case_id,
    target_slate_id,
    clinician_id,
    status,
    created_by
  )
  VALUES (
    v_case.organisation_id,
    p_case_id,
    p_target_slate_id,
    v_clinician_id,
    'in_review',
    auth.uid()
  )
  RETURNING id INTO v_decision_id;

  -- Update case state
  UPDATE clinical.cases
  SET
    current_clinician_decision_id = v_decision_id,
    state = 'clinician_review',
    version = version + 1,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_case_id;

  -- Append domain audit event
  PERFORM audit.append_domain_event(
    v_case.organisation_id,
    p_case_id,
    'user',
    auth.uid(),
    v_clinician_id,
    'clinician-workspace',
    'CLINICIAN_REVIEW_STARTED',
    'case',
    p_case_id,
    jsonb_build_object(
      'decisionId', v_decision_id,
      'slateId', p_target_slate_id
    )
  );

  RETURN v_decision_id;
END;
$$;

-- RPC Function 2: Save Candidate Decision
CREATE OR REPLACE FUNCTION api.save_candidate_decision(
  p_decision_id UUID,
  p_target_candidate_id UUID,
  p_action targeting.candidate_decision_action,
  p_reason_codes TEXT[],
  p_free_text_reason TEXT DEFAULT NULL,
  p_modified_target JSONB DEFAULT NULL,
  p_replacement_candidate_id UUID DEFAULT NULL,
  p_evidence_reviewed BOOLEAN DEFAULT true,
  p_reliability_reviewed BOOLEAN DEFAULT true,
  p_counterarguments_reviewed BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_decision targeting.clinician_decisions%ROWTYPE;
  v_item_id UUID;
BEGIN
  SELECT * INTO v_decision FROM targeting.clinician_decisions WHERE id = p_decision_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DECISION_NOT_FOUND';
  END IF;

  IF v_decision.status <> 'in_review' THEN
    RAISE EXCEPTION 'DECISION_NOT_IN_REVIEW';
  END IF;

  INSERT INTO targeting.candidate_decisions (
    clinician_decision_id,
    target_candidate_id,
    action,
    reason_codes,
    free_text_reason,
    modified_target,
    replacement_candidate_id,
    evidence_reviewed,
    reliability_reviewed,
    counterarguments_reviewed
  )
  VALUES (
    p_decision_id,
    p_target_candidate_id,
    p_action,
    p_reason_codes,
    p_free_text_reason,
    p_modified_target,
    p_replacement_candidate_id,
    p_evidence_reviewed,
    p_reliability_reviewed,
    p_counterarguments_reviewed
  )
  ON CONFLICT (clinician_decision_id, target_candidate_id)
  DO UPDATE SET
    action = EXCLUDED.action,
    reason_codes = EXCLUDED.reason_codes,
    free_text_reason = EXCLUDED.free_text_reason,
    modified_target = EXCLUDED.modified_target,
    replacement_candidate_id = EXCLUDED.replacement_candidate_id,
    evidence_reviewed = EXCLUDED.evidence_reviewed,
    reliability_reviewed = EXCLUDED.reliability_reviewed,
    counterarguments_reviewed = EXCLUDED.counterarguments_reviewed
  RETURNING id INTO v_item_id;

  -- Append audit event
  PERFORM audit.append_domain_event(
    v_decision.organisation_id,
    v_decision.case_id,
    'user',
    auth.uid(),
    v_decision.clinician_id,
    'clinician-workspace',
    'CANDIDATE_REVIEWED',
    'clinician_decision',
    p_decision_id,
    jsonb_build_object(
      'candidateId', p_target_candidate_id,
      'action', p_action,
      'counterargumentsReviewed', p_counterarguments_reviewed
    )
  );

  RETURN v_item_id;
END;
$$;

-- RPC Function 3: Sign Clinician Decision (Immutable Attestation & Sealing)
CREATE OR REPLACE FUNCTION api.sign_clinician_decision(
  p_decision_id UUID,
  p_overall_reasoning TEXT,
  p_magniom_influence targeting.magniom_influence,
  p_disagreement_with_magniom TEXT,
  p_reviewed_counterfactuals BOOLEAN,
  p_reviewed_conflicting_evidence BOOLEAN,
  p_attestation_statement TEXT,
  p_final_targets JSONB,
  p_decision_type targeting.decision_type DEFAULT 'ACCEPTED_PRIMARY'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_decision targeting.clinician_decisions%ROWTYPE;
  v_case clinical.cases%ROWTYPE;
  v_slate targeting.target_slates%ROWTYPE;
  v_clinician identity.clinicians%ROWTYPE;
  v_target JSONB;
  v_canonical_payload JSONB;
  v_payload_bytes BYTEA;
  v_payload_sha256 BYTEA;
  v_digital_sig_hash TEXT;
  v_unreviewed_count INTEGER;
BEGIN
  -- 1. Lock decision row
  SELECT * INTO v_decision FROM targeting.clinician_decisions WHERE id = p_decision_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'DECISION_NOT_FOUND';
  END IF;

  IF v_decision.status <> 'in_review' THEN
    RAISE EXCEPTION 'DECISION_NOT_IN_REVIEW';
  END IF;

  -- 2. Lock case row
  SELECT * INTO v_case FROM clinical.cases WHERE id = v_decision.case_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'CASE_NOT_FOUND';
  END IF;

  -- 3. Lock Target Slate
  SELECT * INTO v_slate FROM targeting.target_slates WHERE id = v_decision.target_slate_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'TARGET_SLATE_NOT_FOUND';
  END IF;

  -- 4. Verify Stale Protection
  IF v_case.current_target_slate_id IS DISTINCT FROM v_slate.id THEN
    RAISE EXCEPTION 'TARGET_SLATE_SUPERSEDED';
  END IF;

  IF v_case.current_phenotype_snapshot_id IS DISTINCT FROM v_slate.phenotype_snapshot_id THEN
    RAISE EXCEPTION 'STALE_PHENOTYPE_SNAPSHOT';
  END IF;

  -- 5. Verify Clinician Identity and TMS Signing Authority
  SELECT * INTO v_clinician FROM identity.clinicians WHERE id = v_decision.clinician_id;
  IF NOT FOUND OR v_clinician.active = false THEN
    RAISE EXCEPTION 'ACTIVE_CLINICIAN_REQUIRED';
  END IF;

  IF v_clinician.tms_signing_authority = false THEN
    RAISE EXCEPTION 'TMS_SIGNING_AUTHORITY_REQUIRED';
  END IF;

  -- 6. Verify Clinical Reasoning Requirements
  IF length(trim(COALESCE(p_overall_reasoning, ''))) < 20 THEN
    RAISE EXCEPTION 'CLINICAL_REASONING_REQUIRED';
  END IF;

  -- 7. Verify Candidate Counterarguments & Evidence were Reviewed
  SELECT COUNT(*)
  INTO v_unreviewed_count
  FROM targeting.candidate_decisions
  WHERE clinician_decision_id = p_decision_id
    AND (counterarguments_reviewed = false OR evidence_reviewed = false);

  IF v_unreviewed_count > 0 THEN
    RAISE EXCEPTION 'ALL_CANDIDATE_COUNTERARGUMENTS_MUST_BE_REVIEWED';
  END IF;

  -- 8. Insert Final Targets
  IF p_final_targets IS NOT NULL AND jsonb_array_length(p_final_targets) > 0 THEN
    FOR v_target IN SELECT * FROM jsonb_array_elements(p_final_targets)
    LOOP
      INSERT INTO targeting.final_targets (
        clinician_decision_id,
        sequence_order,
        source,
        source_candidate_id,
        target_region,
        therapeutic_objectives
      )
      VALUES (
        p_decision_id,
        COALESCE((v_target ->> 'sequenceOrder')::integer, 1),
        COALESCE(v_target ->> 'source', 'magniom_candidate'),
        (v_target ->> 'sourceCandidateId')::uuid,
        v_target -> 'targetRegion',
        COALESCE(v_target -> 'therapeuticObjectives', '[]'::jsonb)
      );
    END LOOP;
  END IF;

  -- 9. Construct Canonical Signed JSON Payload and Compute Cryptographic Seals
  v_canonical_payload := jsonb_build_object(
    'decisionId', p_decision_id,
    'caseId', v_case.id,
    'slateId', v_slate.id,
    'clinicianId', v_clinician.id,
    'clinicianName', v_clinician.full_name,
    'registrationIdentifier', v_clinician.registration_identifier,
    'decisionType', p_decision_type,
    'overallReasoning', p_overall_reasoning,
    'magniomInfluence', p_magniom_influence,
    'disagreementWithMagniom', p_disagreement_with_magniom,
    'reviewedCounterfactuals', p_reviewed_counterfactuals,
    'reviewedConflictingEvidence', p_reviewed_conflicting_evidence,
    'attestationStatement', p_attestation_statement,
    'finalTargets', p_final_targets,
    'signedAt', timezone('utc'::text, now())
  );

  v_payload_bytes := v_canonical_payload::text::bytea;
  v_payload_sha256 := extensions.digest(v_payload_bytes, 'sha256');
  v_digital_sig_hash := encode(v_payload_sha256, 'hex');

  -- 10. Update Clinician Decision to Completed / Signed
  UPDATE targeting.clinician_decisions
  SET
    status = 'completed',
    decision_type = p_decision_type,
    overall_reasoning = p_overall_reasoning,
    magniom_influence = p_magniom_influence,
    disagreement_with_magniom = p_disagreement_with_magniom,
    reviewed_counterfactuals = p_reviewed_counterfactuals,
    reviewed_conflicting_evidence = p_reviewed_conflicting_evidence,
    attestation_statement = p_attestation_statement,
    attestation_accepted = true,
    payload_sha256 = v_payload_sha256,
    digital_signature_hash = v_digital_sig_hash,
    canonical_payload = v_canonical_payload,
    signed_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_decision_id;

  -- 11. Mark Target Slate as Reviewed
  UPDATE targeting.target_slates
  SET status = 'reviewed'
  WHERE id = v_slate.id;

  -- 12. Advance Case State to decision_signed
  UPDATE clinical.cases
  SET
    state = 'decision_signed',
    version = version + 1,
    updated_at = timezone('utc'::text, now())
  WHERE id = v_case.id;

  -- 13. Append Semantic Domain Event
  PERFORM audit.append_domain_event(
    v_case.organisation_id,
    v_case.id,
    'clinician',
    auth.uid(),
    v_clinician.id,
    'clinician-workspace',
    'TARGET_DECISION_SIGNED',
    'case',
    v_case.id,
    jsonb_build_object(
      'decisionId', p_decision_id,
      'slateId', v_slate.id,
      'clinicianId', v_clinician.id,
      'signatureHash', v_digital_sig_hash,
      'decisionType', p_decision_type
    )
  );

  RETURN p_decision_id;
END;
$$;

-- RPC Function 4: Supersede Decision
CREATE OR REPLACE FUNCTION api.supersede_clinician_decision(
  p_old_decision_id UUID,
  p_new_decision_id UUID,
  p_supersession_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old targeting.clinician_decisions%ROWTYPE;
BEGIN
  SELECT * INTO v_old FROM targeting.clinician_decisions WHERE id = p_old_decision_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'OLD_DECISION_NOT_FOUND';
  END IF;

  UPDATE targeting.clinician_decisions
  SET
    status = 'superseded',
    supersedes_id = p_new_decision_id,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_old_decision_id;

  PERFORM audit.append_domain_event(
    v_old.organisation_id,
    v_old.case_id,
    'user',
    auth.uid(),
    v_old.clinician_id,
    'clinician-workspace',
    'DECISION_SUPERSEDED',
    'clinician_decision',
    p_old_decision_id,
    jsonb_build_object(
      'supersededBy', p_new_decision_id,
      'reason', p_supersession_reason
    )
  );
END;
$$;
