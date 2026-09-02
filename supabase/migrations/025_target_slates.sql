-- 025_target_slates.sql
-- Target Slate, Slate Members, Suppressed Candidates, Publication RPC, and Staleness Verification
-- Conforms to Sections 54, 55, 56, 62, 70, 78 of MAGNIOM-Supabase Database & Security Specification v1.0

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'slate_status') THEN
    CREATE TYPE targeting.slate_status AS ENUM (
      'draft',
      'generated',
      'ready_for_review',
      'reviewed',
      'superseded',
      'abstained'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS targeting.target_slates (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  organisation_id UUID NOT NULL
    REFERENCES identity.organisations(id) ON DELETE CASCADE,
  case_id UUID NOT NULL
    REFERENCES clinical.cases(id) ON DELETE CASCADE,
  phenotype_snapshot_id UUID NOT NULL
    REFERENCES clinical.phenotype_snapshots(id) ON DELETE RESTRICT,
  evidence_release_id UUID NOT NULL
    REFERENCES evidence.library_releases(id) ON DELETE RESTRICT,
  status targeting.slate_status NOT NULL DEFAULT 'ready_for_review',
  mode system.magniom_mode NOT NULL DEFAULT 'clinical',
  engine_version TEXT NOT NULL,
  scientific_policy_version TEXT NOT NULL,
  evidence_release_version TEXT NOT NULL,
  connectome_pipeline_version TEXT,
  input_sha256 TEXT NOT NULL,
  deterministic_manifest_hash TEXT NOT NULL,
  payload_sha256 BYTEA NOT NULL,
  output_payload JSONB NOT NULL,
  counterfactual_summary JSONB,
  clinical_coverage_profile JSONB,
  abstention_profile JSONB,
  global_uncertainty JSONB,
  generation_summary TEXT,
  scientific_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  supersedes_id UUID
    REFERENCES targeting.target_slates(id) ON DELETE SET NULL,
  requested_by UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS targeting.target_slate_items (
  target_slate_id UUID NOT NULL
    REFERENCES targeting.target_slates(id) ON DELETE CASCADE,
  target_candidate_id UUID NOT NULL
    REFERENCES targeting.target_candidates(id) ON DELETE RESTRICT,
  position targeting.candidate_role NOT NULL,
  rank_within_role INTEGER DEFAULT 1,
  inclusion_reason TEXT NOT NULL,
  redundancy_with UUID[],
  PRIMARY KEY (target_slate_id, position),
  UNIQUE (target_slate_id, target_candidate_id)
);

CREATE TABLE IF NOT EXISTS targeting.suppressed_candidates (
  target_slate_id UUID NOT NULL
    REFERENCES targeting.target_slates(id) ON DELETE CASCADE,
  target_candidate_id UUID NOT NULL
    REFERENCES targeting.target_candidates(id) ON DELETE RESTRICT,
  reason_code TEXT NOT NULL,
  explanation TEXT NOT NULL,
  PRIMARY KEY (target_slate_id, target_candidate_id)
);

-- Link cases to current target slate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cases_current_target_slate'
  ) THEN
    ALTER TABLE clinical.cases
      ADD CONSTRAINT fk_cases_current_target_slate
      FOREIGN KEY (current_target_slate_id)
      REFERENCES targeting.target_slates(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_target_slates_case ON targeting.target_slates(case_id);
CREATE INDEX IF NOT EXISTS idx_target_slates_org ON targeting.target_slates(organisation_id);
CREATE INDEX IF NOT EXISTS idx_target_slates_snapshot ON targeting.target_slates(phenotype_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_slate_items_slate ON targeting.target_slate_items(target_slate_id);
CREATE INDEX IF NOT EXISTS idx_suppressed_candidates_slate ON targeting.suppressed_candidates(target_slate_id);

-- Immutability Guard Function for Target Slates
CREATE OR REPLACE FUNCTION targeting.guard_slate_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IN ('ready_for_review', 'reviewed', 'superseded', 'abstained') THEN
    -- Allow status transition from ready_for_review to reviewed or superseded only
    IF TG_OP = 'UPDATE' AND OLD.status = 'ready_for_review' AND NEW.status IN ('reviewed', 'superseded') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Published Target Slate is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_target_slates_immutable ON targeting.target_slates;
CREATE TRIGGER trg_target_slates_immutable
  BEFORE UPDATE OR DELETE ON targeting.target_slates
  FOR EACH ROW EXECUTE FUNCTION targeting.guard_slate_mutation();

-- Enable RLS
ALTER TABLE targeting.target_slates ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.target_slate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.suppressed_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_slates_read_policy" ON targeting.target_slates
  FOR SELECT TO authenticated
  USING (
    security.has_permission(organisation_id, 'target.read')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_slates.organisation_id
        AND m.active = true
    )
  );

CREATE POLICY "target_slate_items_read_policy" ON targeting.target_slate_items
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "suppressed_candidates_read_policy" ON targeting.suppressed_candidates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "target_slates_write_policy" ON targeting.target_slates
  FOR ALL TO authenticated
  USING (
    security.has_permission(organisation_id, 'target.generate')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_slates.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'system_admin', 'service_worker')
    )
  )
  WITH CHECK (
    security.has_permission(organisation_id, 'target.generate')
    OR EXISTS (
      SELECT 1 FROM identity.memberships m
      WHERE m.user_id = auth.uid()
        AND m.organisation_id = target_slates.organisation_id
        AND m.active = true
        AND m.role IN ('tms_specialist', 'system_admin', 'service_worker')
    )
  );

CREATE POLICY "target_slate_items_write_policy" ON targeting.target_slate_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "suppressed_candidates_write_policy" ON targeting.suppressed_candidates
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Domain Staleness Check Function
CREATE OR REPLACE FUNCTION targeting.check_slate_staleness(
  p_case_id UUID,
  p_slate_id UUID
)
RETURNS TABLE (
  is_stale BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_case clinical.cases%ROWTYPE;
  v_slate targeting.target_slates%ROWTYPE;
BEGIN
  SELECT * INTO v_case FROM clinical.cases WHERE id = p_case_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 'CASE_NOT_FOUND'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO v_slate FROM targeting.target_slates WHERE id = p_slate_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 'SLATE_NOT_FOUND'::TEXT;
    RETURN;
  END IF;

  -- 1. Check if phenotype snapshot has changed / superseded
  IF v_case.current_phenotype_snapshot_id IS DISTINCT FROM v_slate.phenotype_snapshot_id THEN
    RETURN QUERY SELECT true, 'STALE_PHENOTYPE_SNAPSHOT'::TEXT;
    RETURN;
  END IF;

  -- 2. Check if a newer slate has already been published
  IF v_case.current_target_slate_id IS DISTINCT FROM v_slate.id THEN
    RETURN QUERY SELECT true, 'TARGET_SLATE_SUPERSEDED'::TEXT;
    RETURN;
  END IF;

  -- 3. Slate is current and valid
  RETURN QUERY SELECT false, 'CURRENT'::TEXT;
END;
$$;

-- Atomic Target Slate Publication RPC
CREATE OR REPLACE FUNCTION api.publish_target_slate(
  p_case_id UUID,
  p_phenotype_snapshot_id UUID,
  p_evidence_release_id UUID,
  p_engine_version TEXT,
  p_scientific_policy_version TEXT,
  p_evidence_release_version TEXT,
  p_input_sha256 TEXT,
  p_deterministic_manifest_hash TEXT,
  p_payload_sha256 BYTEA,
  p_output_payload JSONB,
  p_candidates JSONB,
  p_mode system.magniom_mode DEFAULT 'clinical'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_case clinical.cases%ROWTYPE;
  v_slate_id UUID;
  v_cand JSONB;
  v_cand_id UUID;
  v_role targeting.candidate_role;
  v_pos_str TEXT;
  v_old_slate_id UUID;
  v_clinician_id UUID;
BEGIN
  -- Lock case row for concurrency protection
  SELECT *
  INTO v_case
  FROM clinical.cases
  WHERE id = p_case_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CASE_NOT_FOUND';
  END IF;

  -- Verify permissions
  IF NOT security.has_permission(v_case.organisation_id, 'target.generate')
     AND NOT EXISTS (
       SELECT 1 FROM identity.memberships m
       WHERE m.user_id = auth.uid()
         AND m.organisation_id = v_case.organisation_id
         AND m.active = true
         AND m.role IN ('tms_specialist', 'system_admin', 'service_worker')
     ) THEN
    RAISE EXCEPTION 'PERMISSION_DENIED';
  END IF;

  -- Verify that phenotype snapshot matches current case snapshot and is approved
  IF v_case.current_phenotype_snapshot_id IS DISTINCT FROM p_phenotype_snapshot_id THEN
    RAISE EXCEPTION 'STALE_PHENOTYPE_SNAPSHOT';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM clinical.phenotype_snapshots ps
    WHERE ps.id = p_phenotype_snapshot_id
      AND ps.state = 'approved'
  ) THEN
    RAISE EXCEPTION 'PHENOTYPE_NOT_APPROVED';
  END IF;

  -- Store previous slate ID
  v_old_slate_id := v_case.current_target_slate_id;

  -- Mark existing published slates for this case as superseded
  UPDATE targeting.target_slates
  SET status = 'superseded'
  WHERE case_id = p_case_id
    AND status IN ('ready_for_review', 'generated');

  -- Insert new TargetSlate record
  INSERT INTO targeting.target_slates (
    organisation_id,
    case_id,
    phenotype_snapshot_id,
    evidence_release_id,
    status,
    mode,
    engine_version,
    scientific_policy_version,
    evidence_release_version,
    input_sha256,
    deterministic_manifest_hash,
    payload_sha256,
    output_payload,
    counterfactual_summary,
    clinical_coverage_profile,
    abstention_profile,
    global_uncertainty,
    generation_summary,
    scientific_limitations,
    supersedes_id,
    requested_by
  )
  VALUES (
    v_case.organisation_id,
    p_case_id,
    p_phenotype_snapshot_id,
    p_evidence_release_id,
    'ready_for_review',
    p_mode,
    p_engine_version,
    p_scientific_policy_version,
    p_evidence_release_version,
    p_input_sha256,
    p_deterministic_manifest_hash,
    p_payload_sha256,
    p_output_payload,
    p_output_payload -> 'counterfactualSummary',
    p_output_payload -> 'clinicalCoverageProfile',
    p_output_payload -> 'abstentionProfile',
    p_output_payload -> 'globalUncertainty',
    p_output_payload ->> 'generationSummary',
    COALESCE(p_output_payload -> 'scientificLimitations', '[]'::jsonb),
    v_old_slate_id,
    auth.uid()
  )
  RETURNING id INTO v_slate_id;

  -- Iterate through candidates and insert them
  FOR v_cand IN SELECT * FROM jsonb_array_elements(p_candidates)
  LOOP
    INSERT INTO targeting.target_candidates (
      organisation_id,
      case_id,
      phenotype_snapshot_id,
      evidence_release_id,
      target_family_code,
      circuit_code,
      candidate_code,
      candidate_role,
      target_method,
      evidence_tier,
      status,
      eligible,
      suppression_reason,
      subject_coordinate,
      mni_coordinate,
      surface_vertex,
      evidence_score,
      phenotype_concordance_score,
      connectome_refinement_score,
      overall_score,
      rationale,
      counterarguments,
      contraindications_or_conflicts,
      convergence_profile,
      ranking_features,
      metrics,
      explanation
    )
    VALUES (
      v_case.organisation_id,
      p_case_id,
      p_phenotype_snapshot_id,
      p_evidence_release_id,
      COALESCE(v_cand ->> 'familyId', v_cand ->> 'targetFamilyCode', 'TF-MDD-DEFAULT'),
      COALESCE(v_cand ->> 'circuitId', v_cand ->> 'circuitCode', 'CIRCUIT-MDD-DEFAULT'),
      COALESCE(v_cand ->> 'id', v_cand ->> 'candidateCode'),
      (v_cand ->> 'role')::targeting.candidate_role,
      (v_cand ->> 'method')::targeting.target_method,
      (v_cand ->> 'evidenceTier')::evidence.evidence_tier,
      CASE
        WHEN (v_cand ->> 'isSuppressedOrRedundant')::boolean = true THEN 'suppressed'::targeting.candidate_status
        ELSE 'eligible'::targeting.candidate_status
      END,
      NOT COALESCE((v_cand ->> 'isSuppressedOrRedundant')::boolean, false),
      v_cand ->> 'suppressionReason',
      v_cand -> 'subjectCoordinate',
      v_cand -> 'mniCoordinate',
      v_cand -> 'surfaceVertex',
      COALESCE((v_cand ->> 'evidenceScore')::numeric, 0.0),
      COALESCE((v_cand ->> 'phenotypeConcordanceScore')::numeric, 0.0),
      (v_cand ->> 'connectomeRefinementScore')::numeric,
      COALESCE((v_cand ->> 'overallScore')::numeric, 0.0),
      COALESCE(v_cand ->> 'rationale', 'Standard candidate nomination.'),
      COALESCE(v_cand -> 'counterarguments', '["Target location subject to empirical inter-individual variance."]'::jsonb),
      COALESCE(v_cand -> 'contraindicationsOrConflicts', '[]'::jsonb),
      v_cand -> 'convergenceProfile',
      v_cand -> 'rankingFeatures',
      COALESCE(v_cand -> 'metrics', '{}'::jsonb),
      COALESCE(v_cand -> 'explanation', '{}'::jsonb)
    )
    ON CONFLICT (case_id, phenotype_snapshot_id, candidate_code)
    DO UPDATE SET
      overall_score = EXCLUDED.overall_score,
      rationale = EXCLUDED.rationale
    RETURNING id INTO v_cand_id;

    -- If candidate is suppressed, insert into suppressed_candidates
    IF COALESCE((v_cand ->> 'isSuppressedOrRedundant')::boolean, false) THEN
      INSERT INTO targeting.suppressed_candidates (
        target_slate_id,
        target_candidate_id,
        reason_code,
        explanation
      )
      VALUES (
        v_slate_id,
        v_cand_id,
        COALESCE(v_cand ->> 'suppressionReason', 'LOW_RELIABILITY'),
        COALESCE(v_cand ->> 'rationale', 'Suppressed due to ranking policy.')
      )
      ON CONFLICT (target_slate_id, target_candidate_id) DO NOTHING;
    ELSE
      -- Assign slate item role position
      v_pos_str := v_cand ->> 'role';
      IF v_pos_str IN ('PRIMARY_1', 'PRIMARY_2', 'PRIMARY_3', 'ADDITIONAL_A', 'ADDITIONAL_B') THEN
        INSERT INTO targeting.target_slate_items (
          target_slate_id,
          target_candidate_id,
          position,
          rank_within_role,
          inclusion_reason
        )
        VALUES (
          v_slate_id,
          v_cand_id,
          v_pos_str::targeting.candidate_role,
          1,
          COALESCE(v_cand ->> 'rationale', 'Nominated in primary slate.')
        )
        ON CONFLICT (target_slate_id, position) DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  -- Update case pointer and state
  UPDATE clinical.cases
  SET
    current_target_slate_id = v_slate_id,
    state = 'target_slate_ready',
    version = version + 1,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_case_id;

  -- Get active clinician ID if available
  SELECT id INTO v_clinician_id
  FROM identity.clinicians
  WHERE (user_id = auth.uid() OR auth.uid() IS NULL)
    AND organisation_id = v_case.organisation_id
    AND active = true
  LIMIT 1;

  -- Append domain audit event
  PERFORM audit.append_domain_event(
    v_case.organisation_id,
    p_case_id,
    'user',
    auth.uid(),
    v_clinician_id,
    'target-engine',
    'TARGET_SLATE_GENERATED',
    'case',
    p_case_id,
    jsonb_build_object(
      'slateId', v_slate_id,
      'engineVersion', p_engine_version,
      'policyVersion', p_scientific_policy_version,
      'evidenceVersion', p_evidence_release_version,
      'manifestHash', p_deterministic_manifest_hash
    )
  );

  RETURN v_slate_id;
END;
$$;
