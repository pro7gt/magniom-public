-- 057_target_slate_v2_provenance.sql
-- Step 15 in Section 18: Target Slate v2 Provenance and Non-Destructive v1 Coexistence
-- Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§81-88)
-- and Section 19 (Historical v1 TargetSlates remain historically valid)

CREATE TABLE IF NOT EXISTS targeting.target_slates_v2 (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  version TEXT NOT NULL DEFAULT '2.0.0',
  case_id UUID NOT NULL REFERENCES clinical.cases(id) ON DELETE CASCADE,
  case_indication_id UUID NOT NULL REFERENCES clinical.case_indications(id) ON DELETE CASCADE,
  assessment_id UUID,
  mode system.magniom_mode NOT NULL DEFAULT 'clinical',
  indication_module_release_id UUID NOT NULL
    REFERENCES clinical.indication_module_releases(id) ON DELETE RESTRICT,
  scientific_policy_release_id UUID NOT NULL,
  status targeting.slate_status NOT NULL DEFAULT 'ready_for_review',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  phenotype_snapshot_id UUID NOT NULL REFERENCES clinical.phenotype_snapshots(id) ON DELETE RESTRICT,
  clinical_objective_ids UUID[] NOT NULL DEFAULT '{}',
  disease_stage_context_id UUID REFERENCES clinical.disease_stage_contexts(id) ON DELETE SET NULL,
  lesion_context_ids UUID[] DEFAULT '{}',
  measurement_bundle_id UUID NOT NULL REFERENCES measurement.measurement_bundles(id) ON DELETE RESTRICT,
  reliability_bundle_id UUID REFERENCES measurement.reliability_bundles(id) ON DELETE SET NULL,
  evidence_library_release_id UUID NOT NULL,
  target_engine_version_id TEXT NOT NULL,
  pipeline_version_ids UUID[] DEFAULT '{}',
  slate_convergence JSONB NOT NULL DEFAULT '{}'::jsonb,
  clinical_coverage JSONB NOT NULL DEFAULT '{}'::jsonb,
  abstention JSONB,
  global_uncertainty JSONB,
  generation_summary TEXT,
  scientific_limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_sha256 BYTEA NOT NULL,
  provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS targeting.target_slate_items_v2 (
  target_slate_id UUID NOT NULL REFERENCES targeting.target_slates_v2(id) ON DELETE CASCADE,
  target_candidate_id UUID NOT NULL REFERENCES targeting.target_candidates_v2(id) ON DELETE RESTRICT,
  position TEXT NOT NULL CHECK (position IN ('primary_1', 'primary_2', 'primary_3', 'additional_a', 'additional_b')),
  candidate_role TEXT NOT NULL,
  rank_within_role INTEGER DEFAULT 1,
  inclusion_reason TEXT NOT NULL,
  redundancy_with UUID[] DEFAULT '{}',
  PRIMARY KEY (target_slate_id, position),
  UNIQUE (target_slate_id, target_candidate_id)
);

-- Immutability enforcement trigger for TargetSlates (§81)
CREATE OR REPLACE FUNCTION targeting.prevent_target_slate_v2_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'TargetSlateV2 is an immutable scientific aggregate. Generate a new slate instead of modifying.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_target_slates_v2_immutable ON targeting.target_slates_v2;
CREATE TRIGGER trg_target_slates_v2_immutable
  BEFORE UPDATE ON targeting.target_slates_v2
  FOR EACH ROW EXECUTE FUNCTION targeting.prevent_target_slate_v2_mutation();

CREATE INDEX IF NOT EXISTS idx_target_slates_v2_case ON targeting.target_slates_v2(case_id);
CREATE INDEX IF NOT EXISTS idx_target_slates_v2_indication ON targeting.target_slates_v2(case_indication_id);

-- Enable Row Level Security
ALTER TABLE targeting.target_slates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE targeting.target_slate_items_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "target_slates_v2_read_policy" ON targeting.target_slates_v2
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_slates_v2.case_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "target_slates_v2_write_policy" ON targeting.target_slates_v2
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_slates_v2.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM clinical.cases c
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE c.id = target_slates_v2.case_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ));

CREATE POLICY "slate_items_v2_read_policy" ON targeting.target_slate_items_v2
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM targeting.target_slates_v2 ts
    JOIN clinical.cases c ON c.id = ts.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE ts.id = target_slate_items_v2.target_slate_id AND m.user_id = auth.uid() AND m.active = true
  ));

CREATE POLICY "slate_items_v2_write_policy" ON targeting.target_slate_items_v2
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM targeting.target_slates_v2 ts
    JOIN clinical.cases c ON c.id = ts.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE ts.id = target_slate_items_v2.target_slate_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM targeting.target_slates_v2 ts
    JOIN clinical.cases c ON c.id = ts.case_id
    JOIN identity.memberships m ON m.organisation_id = c.organisation_id
    WHERE ts.id = target_slate_items_v2.target_slate_id AND m.user_id = auth.uid() AND m.active = true AND m.role IN ('tms_specialist', 'service_worker', 'system_admin')
  ));

-- Non-destructive v1 compatibility view: projects historical v1 target slates without alteration
CREATE OR REPLACE VIEW targeting.v_target_slates_v2_adapter AS
SELECT
  ts.id,
  '1.0.0-compat' AS version,
  ts.case_id,
  NULL::uuid AS case_indication_id,
  ts.mode,
  ts.status,
  ts.generated_at,
  ts.phenotype_snapshot_id,
  ts.engine_version AS target_engine_version_id,
  ts.evidence_release_version,
  ts.deterministic_manifest_hash,
  ts.payload_sha256,
  ts.generation_summary,
  ts.scientific_limitations,
  ts.created_at
FROM targeting.target_slates ts;
